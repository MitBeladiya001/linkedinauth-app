import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import jwt from "jsonwebtoken";
import clientPromise from "../../../lib/mongodb";
import { encrypt } from "../../../utils/crypto";
import { signSession } from "../../../utils/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // If LinkedIn returned an error parameter, show it (better than a generic 'Invalid state or code')
  if (req.query.error) {
    const err = String(req.query.error);
    const desc =
      typeof req.query.error_description === "string"
        ? req.query.error_description
        : "";
    console.error("LinkedIn OAuth error callback", err, desc);
    return res
      .status(400)
      .send(`LinkedIn OAuth error: ${err}${desc ? " - " + desc : ""}`);
  }
  const { code, state } = req.query;
  const stateCookie = req.cookies["li_oauth_state"];
  if (!code || !state || state !== stateCookie) {
    return res.status(400).send("Invalid state or code");
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/callback`;
  // debug: log the redirect URI used for token exchange
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("LinkedIn token-exchange redirect URI ->", redirectUri);
  }

  try {
    // Exchange code for access token
    const tokenResp = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, expires_in, refresh_token, id_token } =
      tokenResp.data;
    let profile: any = null;
    let email: string | undefined = undefined;
    let emailRespData: any = undefined;

    try {
      const profileResp = await axios.get("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      profile = profileResp.data;

      const emailResp = await axios.get(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      emailRespData = emailResp.data;
      email = emailRespData?.elements?.[0]?.["handle~"]?.emailAddress;
    } catch (err: any) {
      // If the call failed due to insufficient permissions, try id_token fallback
      console.warn(
        "Profile/email v2 endpoints failed, attempting id_token fallback",
        err?.response?.data || err.message || err
      );
      if (id_token) {
        try {
          const decoded: any = jwt.decode(id_token);
          // Map common OIDC claim names to our expected fields
          const given = decoded.given_name || decoded.givenName || "";
          const family = decoded.family_name || decoded.familyName || "";
          const name = decoded.name || `${given} ${family}`.trim();
          profile = {
            localizedFirstName: given || name.split(" ")[0] || "",
            localizedLastName:
              family || name.split(" ").slice(1).join(" ") || "",
            id: decoded.sub || decoded.sub || decoded.user_id || undefined,
          };
          email =
            decoded.email ||
            decoded.email_address ||
            decoded.preferred_username ||
            undefined;
        } catch (decErr: any) {
          console.error("Failed to decode id_token", decErr);
        }
      }
    }

    const fullName = `${profile.localizedFirstName || ""} ${
      profile.localizedLastName || ""
    }`.trim();
    const linkedinId = profile.id;
    const headline = profile.headline || (id_token ? (jwt.decode(id_token) as any)?.headline : "") || "";
    const profileUrl =
      profile.vanityName
        ? `https://www.linkedin.com/in/${profile.vanityName}`
        : (id_token ? (jwt.decode(id_token) as any)?.profile : undefined) || undefined;

    // extract profile picture if available (v2 response structure)
    let profilePicture: string | undefined = undefined
    try {
      const display = profile?.profilePicture?.['displayImage~']
      if (display?.elements && Array.isArray(display.elements)) {
        // pick the largest available
        const el = display.elements[display.elements.length - 1]
        profilePicture = el?.identifiers?.[0]?.identifier
      }
    } catch (e) {
      // ignore
    }
    // fallback to id_token claim
    if (!profilePicture && id_token) {
      const decodedAny: any = jwt.decode(id_token)
      profilePicture = decodedAny?.picture || decodedAny?.picture_url || decodedAny?.image || undefined
    }

    // optional enrichment fields (if available)
    const location = profile?.locationName || (id_token ? (jwt.decode(id_token) as any)?.location : undefined)
    const experience = profile?.positions || (id_token ? (jwt.decode(id_token) as any)?.positions : undefined)
    const education = profile?.educations || (id_token ? (jwt.decode(id_token) as any)?.education : undefined)

    const dbClient = await clientPromise;
    const db = dbClient.db();
    const users = db.collection("users");

    // we'll encrypt refresh tokens (demo encryption). Store encrypted token if available.
    const refreshTokenEncrypted = refresh_token ? encrypt(String(refresh_token)) : undefined

    const now = new Date();
    const tokenExpiresAt = Date.now() + (expires_in || 0) * 1000;

    const upsertRes = await users.findOneAndUpdate(
      { linkedinId },
      {
        $set: {
          linkedinId,
          fullName,
          email,
          headline,
          profileUrl,
          accessToken: access_token,
          tokenExpiresAt,
          updatedAt: now,
          raw: { profile, emailResp: emailRespData, tokenResp: tokenResp.data },
        },
        $setOnInsert: { createdAt: now },
        $currentDate: { lastModified: true },
      },
      { upsert: true, returnDocument: "after" as any }
    );

    // store encrypted refresh token if present
    if (refreshTokenEncrypted) {
      await users.updateOne({ linkedinId }, { $set: { refreshTokenEncrypted } })
    }

    // ensure we have a user object — findOneAndUpdate may return null value in some cases
    const user = upsertRes?.value ?? (await users.findOne({ linkedinId }));

    if (!user) {
      console.error("Failed to retrieve user after upsert", upsertRes);
      return res.status(500).send("Authentication failed");
    }

    // create our session JWT
    const token = signSession({
      userId: String(user._id),
      linkedinId: user.linkedinId,
      email: user.email,
    });

    // set cookie
    const cookieName = process.env.SESSION_COOKIE_NAME || "li_session";
    res.setHeader(
      "Set-Cookie",
      `${cookieName}=${token}; HttpOnly; Path=/; Max-Age=${
        60 * 60 * 24 * 7
      }; SameSite=Lax`
    );

    // Redirect to profile page
    res.redirect("/profile");
  } catch (err: any) {
    console.error(
      "LinkedIn callback error",
      err?.response?.data || err.message || err
    );
    res.status(500).send("Authentication failed");
  }
}

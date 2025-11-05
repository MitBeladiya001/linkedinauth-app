import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import axios from "axios";
import { decrypt } from "../../../utils/crypto";
import { verifySession } from "../../../utils/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const cookieName = process.env.SESSION_COOKIE_NAME || "li_session";
  const token = req.cookies[cookieName];
  if (!token) return res.status(401).json({ error: "not authenticated" });

  const payload: any = verifySession(token);
  if (!payload) return res.status(401).json({ error: "invalid token" });
  const linkedinId = payload.linkedinId;
  if (!linkedinId)
    return res.status(400).json({ error: "linkedinId missing in session" });

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const users = db.collection("users");
  const user = await users.findOne({ linkedinId });
  if (!user || !user.refreshTokenEncrypted)
    return res.status(404).json({ error: "no refresh token" });

  const refreshToken = decrypt(user.refreshTokenEncrypted);
  if (!refreshToken)
    return res.status(500).json({ error: "failed to decrypt refresh token" });

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const tokenResp = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = tokenResp.data;
    const tokenExpiresAt = Date.now() + (expires_in || 0) * 1000;
    await users.updateOne(
      { linkedinId },
      { $set: { accessToken: access_token, tokenExpiresAt } }
    );
    return res.json({ ok: true, access_token, expires_in });
  } catch (err: any) {
    console.error(
      "Refresh token exchange failed",
      err?.response?.data || err.message
    );
    return res
      .status(502)
      .json({
        error: "refresh_failed",
        detail: err?.response?.data || err.message,
      });
  }
}

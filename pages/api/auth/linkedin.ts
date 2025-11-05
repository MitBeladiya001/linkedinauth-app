import type { NextApiRequest, NextApiResponse } from 'next'

// Redirect user to LinkedIn OAuth 2.0 authorization endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/callback`
  // debug: log the redirect URI used for authorization
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('LinkedIn auth redirect URI ->', redirectUri)
  }
  const state = Math.random().toString(36).substring(2)
  // store state in cookie to validate in callback
  res.setHeader('Set-Cookie', `li_oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax`)

  // allow overriding scopes via env
  // If your app uses OpenID Connect product, use OIDC scopes: openid, profile, email
  const defaultScopes = ['openid', 'profile', 'email', 'w_member_social']
  const envScopes = process.env.LINKEDIN_SCOPES
  const scope = envScopes ? envScopes.split(',').map(s => s.trim()).filter(Boolean) : defaultScopes
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    clientId || ''
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(
    scope.join(' ')
  )}`

  // debug: print the full authorization URL so you can inspect the redirect_uri param
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('LinkedIn auth URL ->', authUrl)
  }

  res.redirect(authUrl)
}

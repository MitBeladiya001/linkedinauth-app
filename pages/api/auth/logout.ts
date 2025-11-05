import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'li_session'
  res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`)
  res.status(200).json({ ok: true, clearCache: true })
}

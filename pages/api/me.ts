import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySession } from '../../utils/jwt'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'li_session'
  const token = req.cookies[cookieName]
  if (!token) return res.status(401).json({ error: 'not authenticated' })

  const payload: any = verifySession(token)
  if (!payload) return res.status(401).json({ error: 'invalid token' })

  const dbClient = await clientPromise
  const db = dbClient.db()
  const user = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(payload.userId) })
  if (!user) return res.status(404).json({ error: 'user not found' })

  res.json({ fullName: user.fullName, email: user.email, headline: user.headline, profileUrl: user.profileUrl, profilePicture: user.profilePicture })
}

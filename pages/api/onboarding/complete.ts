import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { verifySession } from '../../../utils/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const cookieName = process.env.SESSION_COOKIE_NAME || 'li_session'
  const token = req.cookies[cookieName]
  if (!token) return res.status(401).json({ error: 'not authenticated' })

  const payload: any = verifySession(token)
  if (!payload) return res.status(401).json({ error: 'invalid token' })

  const { email, profilePicture } = req.body
  if (!email && !profilePicture) return res.status(400).json({ error: 'nothing to update' })

  const dbClient = await clientPromise
  const db = dbClient.db()
  const users = db.collection('users')

  const update: any = {}
  if (email) update.email = email
  if (profilePicture) update.profilePicture = profilePicture

  const { ObjectId } = require('mongodb')
  await users.updateOne({ _id: new ObjectId(payload.userId) }, { $set: update })
  return res.json({ ok: true })
}

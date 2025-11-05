import * as jwt from 'jsonwebtoken'

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'please_change'

export function signSession(payload: object | string, expiresIn: jwt.SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

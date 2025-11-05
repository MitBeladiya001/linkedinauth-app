import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

if (!process.env.REFRESH_TOKEN_ENCRYPTION_KEY) {
  // For development only — in production use a proper KMS and a long random key
  // Create a 32 byte key if not provided
  // eslint-disable-next-line no-console
  console.warn('REFRESH_TOKEN_ENCRYPTION_KEY not set; using insecure default for local dev')
}

export function encrypt(text: string) {
  const key = (process.env.REFRESH_TOKEN_ENCRYPTION_KEY || 'dev_dev_dev_dev_dev_dev_dev_dev_!').padEnd(32).slice(0, 32)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as iv:tag:cipher in base64
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decrypt(payload: string) {
  const key = (process.env.REFRESH_TOKEN_ENCRYPTION_KEY || 'dev_dev_dev_dev_dev_dev_dev_dev_!').padEnd(32).slice(0, 32)
  const [ivB64, tagB64, encB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !encB64) return null
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(encB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

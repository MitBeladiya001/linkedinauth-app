import { ObjectId } from 'mongodb'

export type User = {
  _id?: ObjectId | string
  linkedinId: string
  fullName: string
  email: string
  profilePicture?: string
  headline?: string
  profileUrl?: string
  location?: string
  experience?: any[]
  education?: any[]
  accessToken?: string
  refreshTokenEncrypted?: string
  tokenExpiresAt?: number
  createdAt?: Date
  updatedAt?: Date
  raw?: any
}

export default User

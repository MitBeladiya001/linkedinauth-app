import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const uri = process.env.MONGODB_URI
let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line
  // @ts-ignore
  var _mongoClientPromise: Promise<MongoClient>
}

client = new MongoClient(uri)
clientPromise = client.connect()

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    // @ts-ignore
    global._mongoClientPromise = clientPromise
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise
}

export default clientPromise

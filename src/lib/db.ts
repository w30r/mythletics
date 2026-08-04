import mongoose from "mongoose"

const MONGODB_URI: string = process.env.MONGODB_URI ?? ""

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.")
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache }

const cached: MongooseCache = globalForMongoose.mongooseCache ??= { conn: null, promise: null }

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

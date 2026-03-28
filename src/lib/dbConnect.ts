import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI: string =
  process.env.MONGODB_URI || process.env.MONGO_URI || "";

// Declare a global type to avoid TS errors
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect(): Promise<Mongoose> {
  // Only throw when dbConnect is actually called (NOT during build)
  if (!MONGODB_URI) {
    throw new Error(
      "❌ MONGODB_URI is not defined. Add it to your .env.local file."
    );
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = { bufferCommands: false };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully (TS)");
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    cached!.promise = null;
    throw err;
  }

  return cached!.conn!;
}

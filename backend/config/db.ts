import mongoose from "mongoose";

/**
 * @module db
 * Establishes the Mongoose connection to MongoDB using the MONGO_URI environment
 * variable. The process exits with a non-zero code on connection failure so that
 * container orchestrators (e.g. Docker, Railway) restart the service automatically.
 */

/**
 * Connects to the MongoDB instance specified by MONGO_URI.
 * Exits the process if the connection cannot be established.
 *
 * @returns {Promise<void>}
 */
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

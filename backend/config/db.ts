import mongoose from "mongoose";

/**
 * @module db
 * Establishes the Mongoose connection to MongoDB using the MONGO_URI environment
 * variable. On failure, throws so production startup can exit non-zero and tests
 * can surface the error clearly.
 */

/**
 * Connects to the MongoDB instance specified by MONGO_URI.
 * @throws If MONGO_URI is unset or the connection fails.
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
    throw error;
  }
};

export default connectDB;

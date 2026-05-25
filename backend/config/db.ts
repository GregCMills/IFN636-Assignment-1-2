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
    const useTestDb = process.argv.includes('--test');
    const mongoUri = useTestDb ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        useTestDb
          ? 'TEST_MONGO_URI environment variable is not defined (running in --test mode)'
          : 'MONGO_URI environment variable is not defined'
      );
    }
    const dbName = new URL(mongoUri).pathname.slice(1) || '(default)';
    console.log(`Connecting to MongoDB database: ${dbName}${useTestDb ? ' (test mode)' : ''}`);
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully → ${dbName}${useTestDb ? ' (test database)' : ''}`);
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;

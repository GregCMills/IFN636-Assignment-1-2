/**
 * @module db
 * Establishes the Mongoose connection to MongoDB using the MONGO_URI environment
 * variable. The process exits with a non-zero code on connection failure so that
 * container orchestrators (e.g. Docker, Railway) restart the service automatically.
 */

const mongoose = require("mongoose");

/**
 * Connects to the MongoDB instance specified by MONGO_URI.
 * Exits the process if the connection cannot be established.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
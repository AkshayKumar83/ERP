require("dotenv").config();      //  Load Environment Variables
const { Pool } = require("pg");

// Get DB Config Based on Environment
const getDbConfig = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return {
        user: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        host: process.env.DB_HOST_PROD,
        port: process.env.DB_PORT_PROD,
        database: process.env.DB_NAME_PROD,
        ssl: process.env.DB_SSL_CA
          ? { rejectUnauthorized: true, ca: process.env.DB_SSL_CA }
          : { rejectUnauthorized: false },
      };
    case "testing":
      return {
        user: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        host: process.env.DB_HOST_TEST,
        port: process.env.DB_PORT_TEST,
        database: process.env.DB_NAME_TEST,
      };
    case "development":
    default:
      return {
        user: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        host: process.env.DB_HOST_DEV,
        port: process.env.DB_PORT_DEV,
        database: process.env.DB_NAME_DEV,
      };
  }
};

// Create Connection Pool
const pool = new Pool(getDbConfig());

// Test DB Connection
const connectToDatabase = async () => {
  try {
    // Perform a test query
    await pool.query("SELECT 1");
    console.log(`${process.env.NODE_ENV || "Development"} Database connected successfully`);
  } catch (error) {
    console.error("Failed to connect to the database:", error.stack);
    process.exit(1); // Exit if connection fails
  }
};

// DB Utility
const db = {
  query: async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error(" Database query error:", { text, error: error.message });
      throw error; // Propagate error to caller
    }
  },
  on: (eventName, callback) => pool.on(eventName, callback),
};

// Export Pool and DB Utilities
module.exports = { pool, db, connectToDatabase };

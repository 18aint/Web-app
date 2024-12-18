// Import MongoClient from the MongoDB library
const { MongoClient } = require('mongodb');

// MongoDB connection URI and database name
const uri = "mongodb://127.0.0.1:27017";
const dbName = "CST222DB";

// Variable to hold the database connection
let db = null;

/**
 * Connects to the MongoDB database
 * Initializes the database connection and verifies collections
 * @returns {Promise<Db>} The connected database instance
 * @throws Will throw an error if the connection fails
 */
async function connectDB() {
    try {
        // Establish connection to MongoDB
        const client = await MongoClient.connect(uri);
        db = client.db(dbName);
        console.log("Connected to MongoDB successfully");
        
        // List and log available collections
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
        return db;
    } catch (err) {
        console.error("Could not connect to MongoDB:", err);
        throw err;
    }
}

/**
 * Retrieves the initialized database instance
 * @returns {Db} The initialized database instance
 * @throws Will throw an error if the database is not initialized
 */
function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first");
    }
    return db;
}

// Export the connectDB and getDB functions
module.exports = {
    connectDB,
    getDB
};

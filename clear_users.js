const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/research";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to Database...");
    await client.connect();
    const db = client.db("research");
    const users = db.collection("user");

    console.log("Deleting ALL users...");
    const deleteResult = await users.deleteMany({}); // Empty filter deletes everything
    console.log(`Deleted ${deleteResult.deletedCount} users.`);
    console.log("User table is now empty.");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();

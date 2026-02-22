const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/research";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to Database...");
    await client.connect();
    const db = client.db("research");
    const users = db.collection("user");
    const journals = db.collection("journals");

    // Fetch Journals
    const allJournals = await journals.find({}).toArray();
    if (allJournals.length === 0) {
      console.log("No journals found! Cannot assign journals to demo users.");
      return;
    }
    console.log(`Found ${allJournals.length} journals to assign.`);

    const password = await bcrypt.hash("123456", 10);
    const demoUsers = [];

    // Helper to get random journals (1 to 3)
    const getRandomJournals = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = allJournals.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map(j => ({ id: j._id.toString(), name: j.name }));
    };

    // Create 25 Reviewers
    for (let i = 1; i <= 25; i++) {
        const assigned = getRandomJournals();
        demoUsers.push({
            name: `Demo Reviewer ${i}`,
            email: `reviewer_${i}@demo.com`,
            password: password,
            roles: ["Reviewer"],
            isVerified: true,
            department: assigned[0] ? (assigned[0].department || "General") : "General",
            institution: "Demo University",
            reviewerJournals: assigned,
            createdAt: new Date()
        });
    }

    // Create 25 Editors
    for (let i = 1; i <= 25; i++) {
        const assigned = getRandomJournals();
        demoUsers.push({
            name: `Demo Editor ${i}`,
            email: `editor_${i}@demo.com`,
            password: password,
            roles: ["Editor"], // Associate Editor usually
            isVerified: true,
            department: assigned[0] ? (assigned[0].department || "General") : "General",
            institution: "Demo University",
            editorJournals: assigned, // or assignedJournals depending on how we want to clean it up, but profile uses editorJournals for Editor/EIC
            createdAt: new Date()
        });
    }

    console.log(`Generated ${demoUsers.length} demo users...`);
    
    // Delete old demo users first to avoid duplicates if re-run
    await users.deleteMany({ email: { $regex: '@demo.com', $options: 'i' } });

    await users.insertMany(demoUsers);
    
    console.log("Demo users inserted successfully!");
    console.log("-----------------------------------------");
    console.log("Created 25 Reviewers: reviewer_1@demo.com ... reviewer_25@demo.com");
    console.log("Created 25 Editors:   editor_1@demo.com   ... editor_25@demo.com");
    console.log("Password for all: 123456");
    console.log("-----------------------------------------");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();

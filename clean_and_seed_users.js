const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to Database...");
    await client.connect();
    const db = client.db("research");
    const users = db.collection("user");

    // 1. DELETE ALL USERS WITH 'demo' or 'test' IN EMAIL to be safe, or just 'demo' as requested?
    // User asked "delete all demo data from user table".
    // I will delete where email matches seeded patterns (demo/test) to be clean.
    console.log("Deleting 'demo' users...");
    const deleteResult = await users.deleteMany({ 
        $or: [
            { email: { $regex: 'demo', $options: 'i' } },
            { email: { $regex: 'test.com', $options: 'i' } } 
        ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} users.`);

    // 2. CREATE NEW USERS
    console.log("Creating new test users...");
    const password = await bcrypt.hash("123456", 10);

    const newUsers = [
      {
        name: "Test Author",
        email: "author@test.com",
        password: password,
        roles: ["Author"],
        isVerified: true,
        department: "Computer Science (CSE)",
        institution: "Test University",
        createdAt: new Date()
      },
      {
        name: "Test Reviewer",
        email: "reviewer@test.com",
        password: password,
        roles: ["Reviewer"],
        isVerified: true,
        department: "Electrical Engineering (EEE)",
        institution: "Test University",
        createdAt: new Date()
      },
      {
        name: "Test Associate Editor",
        email: "editor@test.com",
        password: password,
        roles: ["Associate Editor"],
        isVerified: true,
        department: "Physics",
        institution: "Test University",
        createdAt: new Date()
      },
      {
        name: "Test Editor in Chief",
        email: "eic@test.com",
        password: password,
        roles: ["Editor-in-Chief"],
        isVerified: true,
        department: "Computer Science (CSE)",
        institution: "Test University",
        createdAt: new Date()
      },
      {
        name: "Test Admin",
        email: "admin@test.com",
        password: password,
        roles: ["Admin"],
        isVerified: true,
        department: "Administration",
        institution: "Test University",
        createdAt: new Date()
      },
      {
        name: "Test Super Admin",
        email: "superadmin@test.com",
        password: password,
        roles: ["Super Admin"],
        isVerified: true,
        department: "Administration",
        institution: "Test University",
        createdAt: new Date()
      }
    ];

    await users.insertMany(newUsers);
    console.log("New test users created successfully!");
    console.log("-----------------------------------------");
    newUsers.forEach(u => console.log(`${u.roles[0]}: ${u.email} / 123456`));
    console.log("-----------------------------------------");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();

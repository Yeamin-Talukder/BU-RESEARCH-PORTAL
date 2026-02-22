const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const client = new MongoClient(uri);

const DEPARTMENTS = [
  'Computer Science (CSE)',
  'Electrical Engineering (EEE)',
  'Business Administration (BBA)',
  'English Literature',
  'Civil Engineering',
  'Mechanical Engineering'
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");

    const db = client.db("research");
    const users = db.collection("user");
    const journals = db.collection("journals");
    const papers = db.collection("papers");

    // 1. CLEAR EXISTING DATA
    await users.deleteMany({ email: { $ne: "mdyeamen611@gmail.com" } }); // Keep super admin
    await journals.deleteMany({});
    await papers.deleteMany({});
    console.log("Cleared existing data (except Super Admin).");

    // 2. CREATE USERS
    const hashedPassword = await bcrypt.hash("123456", 10);
    const createdUsers = [];

    // Create 20 users
    for (let i = 0; i < 20; i++) {
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const role = i < 5 ? "Editor" : (i < 10 ? "Reviewer" : "Author");
        
        const user = {
            name: `User ${role} ${i}`,
            email: `user${i}@test.com`,
            password: hashedPassword,
            department: dept,
            roles: [role],
            isVerified: true,
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
            createdAt: new Date()
        };
        const res = await users.insertOne(user);
        createdUsers.push({ ...user, _id: res.insertedId });
    }
    console.log(`Seeded ${createdUsers.length} users.`);

    // 3. CREATE JOURNALS
    const createdJournals = [];
    const journalData = [
        { name: "Journal of Computer Science", dept: "Computer Science (CSE)", desc: "Pioneering research in algorithms, AI, and systems." },
        { name: "Modern Electrical Systems", dept: "Electrical Engineering (EEE)", desc: "Innovations in power, electronics, and communication." },
        { name: "Global Business Review", dept: "Business Administration (BBA)", desc: "Strategic insights for the modern economic landscape." },
        { name: "Civil Infrastructures", dept: "Civil Engineering", desc: "Sustainable development and structural integrity." },
        { name: "Literary Horizon", dept: "English Literature", desc: "Critical perspectives on contemporary and classical texts." }
    ];

    for (const jData of journalData) {
        // Find an editor for this department
        const editor = createdUsers.find(u => u.roles.includes("Editor") && u.department === jData.dept) || createdUsers.find(u => u.roles.includes("Editor"));
        
        const journal = {
            name: jData.name,
            department: jData.dept,
            faculty: "Engineering", // Simplified
            description: jData.desc,
            eicId: editor?._id.toString(),
            eicName: editor?.name || "Unassigned",
            status: "Active",
            createdAt: new Date()
        };
        const res = await journals.insertOne(journal);
        createdJournals.push({ ...journal, _id: res.insertedId });
    }
    console.log(`Seeded ${createdJournals.length} journals.`);

    // 4. CREATE PAPERS
    // Generate ~50 papers
    for (let i = 0; i < 50; i++) {
        const journal = createdJournals[i % createdJournals.length];
        const author = createdUsers.find(u => u.roles.includes("Author")) || createdUsers[10]; // Fallback
        
        const views = Math.floor(Math.random() * 1000) + 50;
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        const paper = {
            title: `Research Paper Title ${i}: Investigation into ${journal.department} Topics`,
            abstract: `This is a comprehensive study regarding the nuances of ${journal.department}. We explore various methodologies and potential outcomes. The results suggest significant improvements over existing models.`,
            authorId: author._id.toString(),
            authorName: author.name,
            journalId: journal._id.toString(),
            department: journal.department,
            status: "Published",
            views: views,
            submissionDate: date,
            createdAt: date,
            publishedAt: date
        };
        await papers.insertOne(paper);
    }
    console.log("Seeded 50 papers.");

    console.log("✅ Seeding Complete!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();

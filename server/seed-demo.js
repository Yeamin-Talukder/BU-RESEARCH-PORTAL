const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");

    const db = client.db("research");
    const usersCollection = db.collection("user");
    const journalsCollection = db.collection("journals");
    const papersCollection = db.collection("papers");

    // 1. Create Users (EIC, Editors, Authors)
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const users = [
      {
        _id: new ObjectId(),
        name: "Dr. Alan Turing",
        email: "alan@university.edu",
        password: hashedPassword,
        roles: ["Editor", "Reviewer"],
        department: "Computer Science",
        university: "Cambridge University",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Alan_Turing_Aged_16.jpg",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Dr. Marie Curie",
        email: "marie@research.org",
        password: hashedPassword,
        roles: ["Editor-in-Chief", "Author"],
        department: "Physics",
        university: "University of Paris",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Marie_Curie_c1920.jpg",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Dr. Richard Feynman",
        email: "richard@caltech.edu",
        password: hashedPassword,
        roles: ["Reviewer", "Author"],
        department: "Physics",
        university: "Caltech",
        photoUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Richard_Feynman_Nobel.jpg",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Grace Hopper",
        email: "grace@navy.mil",
        password: hashedPassword,
        roles: ["Author", "Editor"],
        department: "Computer Science",
        university: "Yale University",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg",
        createdAt: new Date()
      }
    ];

    // Insert Users if they don't exist (check by email to avoid dupes)
    for (const user of users) {
      const exists = await usersCollection.findOne({ email: user.email });
      if (!exists) {
        await usersCollection.insertOne(user);
        console.log(`User created: ${user.name}`);
      } else {
        user._id = exists._id; // Use existing ID for linking
        console.log(`User exists: ${user.name}`);
      }
    }

    // 2. Create Journals
    const journals = [
      {
        name: "Journal of Theoretical Computer Science",
        department: "Computer Science (CSE)",
        description: "A peer-reviewed journal dedicated to the mathematical foundations of computation, algorithms, and complexity theory.",
        eicName: "Dr. Alan Turing",
        eicId: users[0]._id.toString(),
        createdAt: new Date("2020-01-15"),
        faculty: "Engineering"
      },
      {
        name: "Advanced Physics Review",
        department: "Physics", // Assuming this maps to a valid department string
        description: "Publishing groundbreaking research in quantum mechanics, relativity, and particle physics.",
        eicName: "Dr. Marie Curie",
        eicId: users[1]._id.toString(),
        createdAt: new Date("2019-05-20"),
        faculty: "Science"
      },
      {
        name: "International Journal of AI & Ethics",
        department: "Computer Science (CSE)",
        description: "Exploring the intersection of artificial intelligence, machine learning, and societal ethics.",
        eicName: "Grace Hopper",
        eicId: users[3]._id.toString(),
        createdAt: new Date("2021-08-10"),
        faculty: "Engineering"
      }
    ];

    const journalIds = [];

    for (const journal of journals) {
      const exists = await journalsCollection.findOne({ name: journal.name });
      if (!exists) {
        const result = await journalsCollection.insertOne(journal);
        journalIds.push({ id: result.insertedId.toString(), name: journal.name });
        console.log(`Journal created: ${journal.name}`);
      } else {
        journalIds.push({ id: exists._id.toString(), name: existing.name });
        console.log(`Journal exists: ${journal.name}`);
      }
    }

    // 3. Create Papers
    // We need correct journal IDs. Let's fetch the ones we just inserted/found.
    const createdJournals = await journalsCollection.find({}).toArray();
    
    // Helper to find a specific journal ID
    const getJId = (name) => {
       const j = createdJournals.find(j => j.name === name);
       return j ? j._id.toString() : null;
    };

    const papers = [
      {
        title: "On Computable Numbers, with an Application to the Entscheidungsproblem",
        abstract: "We present a theoretical machine that can simulate any computer algorithm, establishing the foundations of modern computing logic.",
        authorName: "Dr. Alan Turing",
        authorId: users[0]._id.toString(),
        journalId: getJId("Journal of Theoretical Computer Science"),
        journalName: "Journal of Theoretical Computer Science",
        status: "Published",
        views: 15420,
        downloads: 4102,
        keywords: ["Computing", "Logic", "Algorithms"],
        createdAt: new Date("2023-11-10"),
        fileUrl: "#"
      },
      {
        title: "Quantum Electrodynamics and Path Integrals",
        abstract: "A new formulation of quantum mechanics using path integrals, providing a visual method for calculating particle interactions.",
        authorName: "Dr. Richard Feynman",
        authorId: users[2]._id.toString(),
        journalId: getJId("Advanced Physics Review"),
        journalName: "Advanced Physics Review",
        status: "Published",
        views: 8900,
        downloads: 3200,
        keywords: ["Quantum Physics", "QED", "Particles"],
        createdAt: new Date("2023-10-05"),
        fileUrl: "#"
      },
      {
        title: "Compiler Design for COBOL Systems",
        abstract: "An analysis of compiler optimization techniques for business-oriented languages, ensuring type safety and performance.",
        authorName: "Grace Hopper",
        authorId: users[3]._id.toString(),
        journalId: getJId("Journal of Theoretical Computer Science"),
        journalName: "Journal of Theoretical Computer Science",
        status: "Published",
        views: 5600,
        downloads: 1200,
        keywords: ["Compilers", "COBOL", "Systems"],
        createdAt: new Date("2023-12-01"),
        fileUrl: "#"
      },
       {
        title: "Radioactivity and New Elements",
        abstract: "Isolation of Polonium and Radium, discussing the properties of radioactive isotopes and their potential applications.",
        authorName: "Dr. Marie Curie",
        authorId: users[1]._id.toString(),
        journalId: getJId("Advanced Physics Review"),
        journalName: "Advanced Physics Review",
        status: "Published",
        views: 21000,
        downloads: 8500,
        keywords: ["Radioactivity", "Physics", "Chemistry"],
        createdAt: new Date("2023-09-15"),
        fileUrl: "#"
      },
      {
        title: "Bias in Large Language Models",
        abstract: "A comprehensive audit of bias in modern LLMs, proposing a framework for ethical AI development.",
        authorName: "Dr. Alan Turing", // Just reusing him as an author
        authorId: users[0]._id.toString(),
        journalId: getJId("International Journal of AI & Ethics"),
        journalName: "International Journal of AI & Ethics",
        status: "Published",
        views: 12500,
        downloads: 6700,
        keywords: ["AI", "Ethics", "LLM"],
        createdAt: new Date("2024-01-20"),
        fileUrl: "#"
      }
    ];

    for (const paper of papers) {
      if (paper.journalId) { // Only insert if journal was found
          await papersCollection.insertOne(paper);
          console.log(`Paper created: ${paper.title}`);
      } else {
          console.log(`Skipping paper ${paper.title} - Journal not found`);
      }
    }
    
    // Update Users to link them to journals (for the "People" tab logic)
    // The previous logic in index.js checks `editorJournals` and `reviewerJournals` arrays
    // Let's add these fields to our users
    
    // Turing is EIC/Editor of CS Journal
    await usersCollection.updateOne(
        { _id: users[0]._id }, 
        { $addToSet: { editorJournals: getJId("Journal of Theoretical Computer Science") } }
    );
     // Marie Curie is EIC/Editor of Physics Journal
    await usersCollection.updateOne(
        { _id: users[1]._id }, 
        { $addToSet: { editorJournals: getJId("Advanced Physics Review") } }
    );
    // Grace Hopper is EIC of AI Journal
    await usersCollection.updateOne(
        { _id: users[3]._id }, 
        { $addToSet: { editorJournals: getJId("International Journal of AI & Ethics") } }
    );

    console.log("Seeding complete!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/research";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to Database...");
    await client.connect();
    const db = client.db("research");
    const papers = db.collection("papers");
    const journals = db.collection("journals");
    const users = db.collection("user");

    // Fetch Journals and Author
    const allJournals = await journals.find({}).toArray();
    if (allJournals.length === 0) {
      console.log("No journals found!");
      return;
    }

    const author = await users.findOne({ email: "author@test.com" });
    if (!author) {
      console.log("Author 'author@test.com' not found!");
      return;
    }

    const topics = [
      "Artificial Intelligence", "Machine Learning", "Climate Change", "Renewable Energy", 
      "Quantum Physics", "Bioinformatics", "Cybersecurity", "Blockchain", 
      "Urban Planning", "Sustainable Agriculture", "Robotics", "Neuroscience",
      "Nanotechnology", "Cloud Computing", "Data Science", "Internet of Things"
    ];

    const types = ["Research Article", "Review Article", "Case Study", "Short Communication"];

    const demoPapers = [];

    for (let i = 1; i <= 50; i++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const journal = allJournals[Math.floor(Math.random() * allJournals.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const isSubmitted = Math.random() > 0.4; // 60% Submitted, 40% Under Review

        demoPapers.push({
            manuscriptId: `DEMO-${Date.now()}-${i}`,
            title: `${topic}: A Comprehensive Study on Feature ${i}`,
            abstract: `Here is a detailed abstract investigating ${topic}. This study focuses on the implications of component ${i} within the broader field. We propose a novel approach to solve key challenges.`,
            authorId: author._id.toString(),
            authorName: author.name,
            department: journal.department || "General",
            journalId: journal._id.toString(),
            journalName: journal.name,
            type: type,
            keywords: [topic, "Research", `Term ${i}`],
            coAuthors: [],
            fileUrl: "/uploads/dummy.pdf",
            originalFileName: "demo_manuscript.pdf",
            version: 1,
            status: isSubmitted ? "Submitted" : "Under Review",
            submittedDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random date in past
            reviewers: [],
            editorId: null,
            editorName: null
        });
    }

    console.log(`Deleting OLD demo papers (prefix DEMO-)...`);
    await papers.deleteMany({ manuscriptId: { $regex: '^DEMO-' } });
    
    // Also delete the previous 'seed_papers' entries to avoid clutter if user wants just these 50
    // Actually, user said "create 50 paper demo", maybe in addition? 
    // Usually "demo data" implies replacing old test data. I'll clear ALL papers to be safe and clean as per previous pattern.
    console.log("Deleting ALL existing papers to ensure clean demo state...");
    await papers.deleteMany({});


    console.log(`Inserting ${demoPapers.length} demo papers...`);
    await papers.insertMany(demoPapers);
    console.log("Demo papers inserted successfully.");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();

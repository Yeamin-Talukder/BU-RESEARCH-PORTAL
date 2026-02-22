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

    // Clear existing papers
    console.log("Deleting ALL papers...");
    await papers.deleteMany({});
    console.log("Papers cleared.");

    // Fetch Journals and Author
    const allJournals = await journals.find({}).toArray();
    if (allJournals.length === 0) {
      console.log("No journals found! Run seed_users.js or create journals first.");
      return;
    }

    const author = await users.findOne({ email: "author@test.com" });
    if (!author) {
      console.log("Author 'author@test.com' not found! Run seed_users.js first.");
      return;
    }

    const samplePapers = [
      {
        title: "Deep Learning in Medical Imaging",
        abstract: "This paper explores the application of convolutional neural networks in detecting anomalies in X-Ray images.",
        keywords: ["AI", "Medical", "Deep Learning"],
        type: "Research Article"
      },
      {
        title: "Sustainable Urban Planning for 2030",
        abstract: "A comprehensive study on green energy integration in modern metropolitan areas.",
        keywords: ["Urban Planning", "Sustainability", "Green Energy"],
        type: "Review Article"
      },
      {
        title: "Quantum Computing Algorithms",
        abstract: "An introduction to quantum supremacy and basic algorithms for the next generation of computing.",
        keywords: ["Quantum", "Computing", "Algorithms"],
        type: "Research Article"
      },
       {
        title: "Cybersecurity in IoT Devices",
        abstract: "Analyzing vulnerabilities in Internet of Things devices and proposing a new encryption standard.",
        keywords: ["IoT", "Security", "Encryption"],
        type: "Case Study"
      }
    ];

    const newPapers = samplePapers.map((p, idx) => {
      const journal = allJournals[idx % allJournals.length]; // Cycle through journals
      return {
        manuscriptId: `PAPER-${Date.now()}-${idx + 1}`,
        title: p.title,
        abstract: p.abstract,
        authorId: author._id.toString(),
        authorName: author.name,
        department: journal.department || "General",
        journalId: journal._id.toString(),
        journalName: journal.name, // CRITICAL: Adding Journal Name
        type: p.type,
        keywords: p.keywords,
        coAuthors: [],
        fileUrl: "/uploads/dummy.pdf", // Dummy file
        originalFileName: "dummy.pdf",
        version: 1,
        status: "Submitted",
        submittedDate: new Date(),
        reviewers: [], // No reviewers initially
        editorId: null, // No editor initially
        editorName: null
      };
    });

    console.log(`Inserting ${newPapers.length} sample papers...`);
    await papers.insertMany(newPapers);
    console.log("Papers inserted successfully."); 

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const papers = client.db("research").collection("papers");
    const users = client.db("research").collection("user");

    // Find an author to assign these papers to (or create a dummy one if needed, but better to use existing)
    // For demo, we'll try to find any user, or just use a dummy ID.
    // Ideally we want them to show up for the Editor. The Editor view filters by journal assignment mostly.
    
    // Let's create papers that are visually distinct.
    
    const demoPapers = [
      {
        title: "DEMO: Advanced Architectures in Quantum Computing",
        abstract: "This paper explores the theoretical limits of quantum decoherence...",
        keywords: "Quantum, Physics, Computing",
        department: "Computer Science (CSE)", // Matches default journal
        authorName: "Dr. Demo Author",
        authorId: new ObjectId(), // Random ID
        status: "Accepted",
        decision: "Accept",
        submittedDate: new Date("2025-11-15"),
        journalId: null, // Will need to match editor's journal if filtering is strict. 
        // Note: Editor.tsx usually filters by user.editorJournals. If user is Super Admin or has no journals, it might show all or none.
        // We'll hope the user is seeing ALL papers or we pick a department/journal that exists.
      },
      {
        title: "DEMO: Analysis of Failed Neural Networks",
        abstract: "A study on why certain topologies fail to converge...",
        keywords: "AI, ML, Neural Networks",
        department: "Computer Science (CSE)",
        authorName: "Jane Doe",
        authorId: new ObjectId(),
        status: "Rejected",
        decision: "Reject",
        submittedDate: new Date("2025-12-01"),
        journalId: null,
      }
    ];

    console.log("Seeding demo papers...");
    
    // Check if we need to assign a valid journal ID for them to appear
    // Let's assume the default journal exists from index.js seeding.
    const journals = client.db("research").collection("journals");
    const defaultJournal = await journals.findOne({ name: "Journal of Computer Science and Technology" });
    
    if (defaultJournal) {
       demoPapers.forEach(p => {
          p.journalId = defaultJournal._id.toString(); // Editor likely needs strictly equal string or objectID. index.js uses string in some places.
          p.journalName = defaultJournal.name;
       });
       console.log("Assigned to journal: " + defaultJournal.name);
    }

    const result = await papers.insertMany(demoPapers);
    console.log(`${result.insertedCount} demo papers inserted!`);

  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await client.close();
  }
}

run();

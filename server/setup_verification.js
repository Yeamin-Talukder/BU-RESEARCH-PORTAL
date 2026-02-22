const { MongoClient, ObjectId } = require("mongodb");

async function run() {
    // Standard URI
    const uri = "mongodb://127.0.0.1:27017"; 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("research");
        const papers = db.collection("papers");
        const users = db.collection("user");

        // 1. Find a test user (Author)
        const author = await users.findOne({ email: "demo1@example.com" });
        if (!author) {
            console.log("Demo author (demo1@example.com) not found. Trying to find any author...");
        }
        
        // 2. Find ANY paper by this author or just any paper
        let paper = null;
        if (author) {
            paper = await papers.findOne({ authorId: author._id.toString() });
        } else {
            paper = await papers.findOne({});
        }

        if (!paper) {
            console.log("No papers found in DB. Creating a dummy paper...");
            // Create dummy if needed (omitted for brevity, assuming seed data exists)
            return;
        }

        console.log(`Found paper: ${paper.title} (ID: ${paper._id})`);

        // 3. Update status to 'final_submission_requested' (or 'Request Final Submission' verdict)
        // logic says: currentPaper.status === 'final_submission_requested' || currentPaper.decision === 'Request Final Submission'
        
        await papers.updateOne(
            { _id: paper._id },
            { 
                $set: { 
                    status: "final_submission_requested",
                    decision: "Request Final Submission",
                    decisionReason: "Please submit the final version for publication." 
                } 
            }
        );

        console.log("---------------------------------------------------");
        console.log(`Paper '${paper.title}' updated.`);
        console.log(`ID: ${paper._id}`);
        console.log("Status set to: 'final_submission_requested'");
        console.log("Decision set to: 'Request Final Submission'");
        console.log("---------------------------------------------------");
        console.log("INSTRUCTIONS FOR USER:");
        console.log("1. Login as the author of this paper (or Admin to view all).");
        console.log("2. Go to 'Editor Feedback' tab.");
        console.log("3. You should see 'Submit Final Version' button.");
        console.log("4. Upload a file and submit.");
        console.log("5. The status/decision should update to 'final_submitted'.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();

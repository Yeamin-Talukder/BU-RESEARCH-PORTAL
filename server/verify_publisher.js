const { MongoClient, ObjectId } = require("mongodb");

async function run() {
    // Standard URI
    const uri = "mongodb://127.0.0.1:27017"; 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("research");
        const volumes = db.collection("volumes");
        const issues = db.collection("issues");
        const papers = db.collection("papers");

        console.log("Connected to DB...");
        
        // 1. Create Volume (2027)
        console.log("Creating Volume 2027...");
        const volRes = await volumes.insertOne({ year: 2027, createdAt: new Date() });
        const volumeId = volRes.insertedId;
        console.log(`Volume created: ${volumeId}`);

        // 2. Create Issue (Vol 1, Issue 1)
        console.log("Creating Issue...");
        const issueRes = await issues.insertOne({ 
            volumeId: volumeId, // string or objectid? backend handles both usually but let's check schema
            title: "Spring Special", 
            issueNumber: 1,
            isPublished: false,
            createdAt: new Date()
        });
        const issueId = issueRes.insertedId;
        console.log(`Issue created: ${issueId}`);

        // 3. Find a Paper to Publish
        const paper = await papers.findOne({ status: 'final_submitted' });
        if (!paper) {
            console.log("No paper ready for publication. Skipping publish step.");
            return;
        }

        console.log(`Publishing paper: ${paper.title} (${paper._id})`);

        // 4. Assign to Issue (Simulate backend update)
        await papers.updateOne(
            { _id: paper._id },
            { 
                $set: { 
                    issueId: issueId.toString(), // Store as string usually
                    status: "Published",
                    publishedDate: new Date()
                } 
            }
        );
        console.log("Paper published successfully.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();

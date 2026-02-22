const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db("research");
        const users = db.collection("user");
        const journals = db.collection("journals");

        // 1. Find a journal which will be assigned
        const journal = await journals.findOne({});
        if (!journal) {
            console.log("No journals found!");
            return;
        }
        console.log("Found Journal:", journal.name, journal._id);

        // 2. Find User (Editor)
        const user = await users.findOne({ email: 'editor@test.com' });

        if (!user) {
            console.log("User editor@test.com not found!");
            // Try to list first 5 users to see who exists
            const someUsers = await users.find({}).limit(5).toArray();
            console.log("Available users:", someUsers.map(u => u.email));
            return;
        }

        console.log(`Found User: ${user.name} (${user.email})`);

        // 3. Update User with this journal as editorJournals
        await users.updateOne(
            { _id: user._id },
            {
                $set: {
                    editorJournals: [journal._id.toString()],
                    // Set others to empty to avoid 'null' issues, although optional
                    reviewerJournals: [],
                    assignedJournals: []
                }
            }
        );
        console.log(`Assigned journal '${journal.name}' to user '${user.name}'.`);

        // 4. Verify update
        const updatedUser = await users.findOne({ _id: user._id });
        console.log("Updated User Data:");
        console.log(" - Editor Journals:", updatedUser.editorJournals);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

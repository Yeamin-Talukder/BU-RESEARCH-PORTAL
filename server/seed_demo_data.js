const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://riajcse9bu_db_user:wAj8h8Brcz51wSR6@reseachproject.1vgnzqb.mongodb.net/research?retryWrites=true&w=majority&appName=reseachproject";
const client = new MongoClient(uri);

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        const db = client.db('research');
        console.log("Connected!");

        // 1. Create/Get Demo Journal
        let journal = await db.collection('journals').findOne({ name: "Demo Journal of Computer Science" });
        if (!journal) {
            console.log("Creating Demo Journal...");
            const res = await db.collection('journals').insertOne({
                name: "Demo Journal of Computer Science",
                description: "A demo journal for testing assignment flows.",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            journal = { _id: res.insertedId, name: "Demo Journal of Computer Science" };
        } else {
            console.log("Demo Journal already exists:", journal._id);
        }

        // 2. Create/Get Demo Editor
        const editorEmail = "demo_editor@test.com";
        let editor = await db.collection('users').findOne({ email: editorEmail });
        if (!editor) {
            console.log("Creating Demo Editor...");
            const res = await db.collection('users').insertOne({
                name: "Demo Editor",
                email: editorEmail,
                password: "$2a$10$YourHashedPasswordHereOrJustLoginWithAnotherUser", // Dummy hash
                roles: ["Editor"],
                editorJournals: [],
                createdAt: new Date(),
                isVerified: true
            });
            editor = { _id: res.insertedId, email: editorEmail, roles: ["Editor"] };
        } else {
            console.log("Demo Editor found:", editor._id);
            // Ensure Editor role
            if (!editor.roles.includes('Editor')) {
                await db.collection('users').updateOne({ _id: editor._id }, { $push: { roles: 'Editor' } });
            }
        }

        // 3. Link Editor to Journal
        // Ensure the structure matches what backend expects (array of objects {id, name})
        const editorJournalEntry = { id: journal._id.toString(), name: journal.name };

        // Check if already assigned
        const user = await db.collection('users').findOne({ _id: editor._id });
        const isAssigned = user.editorJournals?.some(j => j.id === editorJournalEntry.id || j._id === editorJournalEntry.id);

        if (!isAssigned) {
            console.log("Assigning Editor to Journal...");
            await db.collection('users').updateOne(
                { _id: editor._id },
                {
                    $push: {
                        editorJournals: editorJournalEntry
                    }
                }
            );
        } else {
            console.log("Editor already assigned to Journal.");
        }

        // 4. Create Demo Paper
        const paperTitle = "Optimizing Editor Workflows in 2026";
        let paper = await db.collection('papers').findOne({ title: paperTitle });

        if (!paper) {
            console.log("Creating Demo Paper...");
            await db.collection('papers').insertOne({
                title: paperTitle,
                abstract: "This is a demo paper to test the visibility in the Editor Dashboard.",
                status: "Submitted",
                authorName: "Demo Author",
                authorId: new ObjectId(), // Random ID
                journalId: journal._id.toString(), // CRITICAL: String or ObjectId? Backend seems to compare Strings often, but let's check.
                // SubmitPaper.tsx sends string. Backend schema? Usually mongo stores ObjectIds but if passed as string...
                // Let's store as String to match my debug findings "assigned matches string".
                journalName: journal.name,
                submittedDate: new Date(),
                keywords: ["Demo", "Testing"],
                version: 1,
                reviewers: []
            });
            console.log("Demo Paper Created.");
        } else {
            console.log("Demo Paper already exists.");
            // Fix Journal ID if broken
            if (paper.journalId !== journal._id.toString()) {
                console.log("Fixing Paper Journal Link...");
                await db.collection('papers').updateOne(
                    { _id: paper._id },
                    { $set: { journalId: journal._id.toString(), journalName: journal.name } }
                );
            }
        }

        console.log("Seed Complete!");
        console.log(`\nLOGIN CREDENTIALS:`);
        console.log(`User: ${editorEmail}`);
        console.log(`(You may need to rest password if you don't know it, or use existing user 'editor@test.com' if you prefer)`);

        // ALSO fix 'editor@test.com' if it exists, to match this journal
        const existingEditor = await db.collection('users').findOne({ email: "editor@test.com" });
        if (existingEditor) {
            console.log("Fixing 'editor@test.com' assignments too...");
            const isAssignedExisting = existingEditor.editorJournals?.some(j => j.id === editorJournalEntry.id || j._id === editorJournalEntry.id);
            if (!isAssignedExisting) {
                await db.collection('users').updateOne(
                    { _id: existingEditor._id },
                    { $push: { editorJournals: editorJournalEntry } }
                );
                console.log("Assigned 'editor@test.com' to Demo Journal.");
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();

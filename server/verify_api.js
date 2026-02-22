const { MongoClient } = require("mongodb");

// MOCKING the fetch since we are in node environment without native fetch in older versions, 
// OR we can just use the DB directly to get the ID, then use fetch if Node 18+.
// Let's assume Node 18+ (User environment seems modern).

async function run() {
    const uri = "mongodb://127.0.0.1:27017"; // Use IP instead of localhost
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("research");
        const users = db.collection("user");

        console.log("Connected to DB...");
        const user = await users.findOne({ email: 'editor@test.com' });

        if (!user) {
            console.error("User not found in DB");
            return;
        }

        console.log("DB User ID:", user._id.toString());
        console.log("DB editorJournals:", user.editorJournals);

        // Now Try to Hit the API
        console.log("Fetching from API...");
        const response = await fetch(`http://localhost:5000/users/${user._id.toString()}`);

        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();
        console.log("API Response editorJournals:", JSON.stringify(data.editorJournals, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();

const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("research");
    const volumes = db.collection("volumes");
    const issues = db.collection("issues");
    const papers = db.collection("papers");

    console.log("Connected to database...");

    // 1. Create Volumes (2023, 2024, 2025)
    const volumeYears = [2025, 2024, 2023];
    const volumeIds = {};

    console.log("Seeding Volumes...");
    for (const year of volumeYears) {
      const existing = await volumes.findOne({ year: year });
      if (!existing) {
        const res = await volumes.insertOne({
          year: year,
          createdAt: new Date(),
          isActive: true
        });
        volumeIds[year] = res.insertedId;
      } else {
        volumeIds[year] = existing._id;
      }
    }

    // 2. Create Issues for each Volume
    console.log("Seeding Issues...");
    const issueIds = [];

    for (const year of volumeYears) {
      const volId = volumeIds[year];
      // Create 2 issues per volume
      for (let i = 1; i <= 2; i++) {
        const issueTitle = year === 2025 ? "AI & Future Tech" : "General Research";
        const existing = await issues.findOne({ volumeId: volId.toString(), issueNumber: i });
        
        let issueId;
        if (!existing) {
          const res = await issues.insertOne({
            volumeId: volId.toString(),
            title: `Vol ${year} Issue ${i}: ${issueTitle}`,
            issueNumber: i,
            coverImageUrl: null,
            isPublished: true,
            publishedAt: new Date(),
            createdAt: new Date()
          });
          issueId = res.insertedId;
        } else {
            issueId = existing._id;
        }
        issueIds.push({ id: issueId, year: year, number: i });
      }
    }

    // 3. Create Papers for these Issues
    console.log("Seeding Papers...");
    
    const demoPapers = [
        {
            title: "Advanced Neural Networks for Climate Prediction",
            abstract: "This paper explores deep learning models for predicting climate patterns...",
            authorName: "Dr. Sarah Connor",
            department: "Computer Science (CSE)",
            type: "Research Article"
        },
        {
            title: "Sustainable Urban Planning in Mega Cities",
            abstract: "Analyzing infrastructure challenges in rapidly growing urban areas...",
            authorName: "James Wright",
            department: "Civil Engineering",
            type: "Case Study"
        },
        {
            title: "Quantum Computing Algorithms: A Review",
            abstract: "A comprehensive survey of current quantum algorithms and their applications...",
            authorName: "Alice Chen",
            department: "Physics",
            type: "Review Paper"
        },
        {
            title: "The Impact of Micro-Plastics on Marine Life",
            abstract: "Investigation into the long-term effects of plastic pollution...",
            authorName: "Robert Miller",
            department: "Environmental Science",
            type: "Research Article"
        },
        {
            title: "Renewable Energy Grid Integration",
            abstract: "Challenges and solutions for specific renewable energy sources...",
            authorName: "Emily Davis",
            department: "Electrical Engineering",
            type: "Research Article"
        }
    ];

    for (const issue of issueIds) {
        // Assign 2 random papers to each issue
        for(let k=0; k<2; k++) {
            const template = demoPapers[Math.floor(Math.random() * demoPapers.length)];
            
            await papers.insertOne({
                manuscriptId: `JRP-${issue.year}-${issue.number}-${k+1}`,
                title: template.title,
                abstract: template.abstract,
                authorName: template.authorName,
                department: template.department || "General",
                type: template.type,
                issueId: issue.id.toString(), // Link to issue
                status: "Published",
                publishedDate: new Date(),
                fileUrl: "/uploads/demo.pdf", // Placeholder
                files: [],
                keywords: ["Demo", "Research"],
                version: 1,
                submissionDate: new Date()
            });
        }
    }

    console.log("Seeding Complete!");

  } catch (error) {
    console.error("Seeding Failed:", error);
  } finally {
    await client.close();
  }
}

run();

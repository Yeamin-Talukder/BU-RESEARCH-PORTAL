const http = require('http');

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data); // In case of non-json
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log("--- DEBUGGING DATA ---");

        // 1. Fetch Journals
        const journals = await get('/journals');
        console.log(`Found ${journals.length} Journals`);
        journals.forEach(j => console.log(`[Journal] ID: ${j._id} | Name: ${j.name}`));

        // 2. Fetch Users
        const users = await get('/users');
        const editor = users.find(u => u.email === 'editor@test.com');
        if (!editor) {
            console.log("ERROR: editor@test.com NOT FOUND");
        } else {
            console.log(`[Editor] editor@test.com | ID: ${editor._id}`);
            console.log(`  - Assigned Journals (editorJournals):`, JSON.stringify(editor.editorJournals));
        }

        // 3. Fetch Papers
        // Note: We need to see ALL papers, so we might need to bypass the filter if possible?
        // My previous change made /papers filtered if params are present. With no params, it SHOULD return all.
        // Let's verify that assumption.
        const papers = await get('/papers');
        console.log(`Found ${papers.length} Papers (via GET /papers)`);

        const riajPaper = papers.find(p => p.authorName && p.authorName.toLowerCase().includes('riaj'));

        if (riajPaper) {
            console.log(`[Paper] Title: ${riajPaper.title} | ID: ${riajPaper._id}`);
            console.log(`  - Journal ID: ${riajPaper.journalId}`);
            console.log(`  - Journal Name: ${riajPaper.journalName}`);
        } else {
            console.log("ERROR: Paper by 'riaj' NOT FOUND in /papers response");
        }

        // ANALYSIS
        if (editor && riajPaper) {
            const paperJId = String(riajPaper.journalId);
            const editorHasIt = editor.editorJournals && editor.editorJournals.some(ej => String(ej.id || ej._id || ej) === paperJId);

            const fs = require('fs');
            const output = `
Paper Journal ID: ${paperJId}
Editor Assignments: ${JSON.stringify(editor.editorJournals)}
Mismatch: ${!editorHasIt}
`;
            fs.writeFileSync('debug_output.txt', output);
            console.log("Wrote to debug_output.txt");
        }

    } catch (e) {
        console.error("Execution Error:", e);
    }
}

run();

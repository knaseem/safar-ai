const fs = require('fs');
const https = require('https');

// Read the file content (simulating reading the TS file as text to extract URLs)
// In a real scenario, we'd compile the TS, but regex is faster for this check.
const fileContent = fs.readFileSync('src/lib/blog-data.ts', 'utf8');

const regex = /image:\s*"(https?:\/\/[^"]+)"/g;
let match;
const urls = [];

while ((match = regex.exec(fileContent)) !== null) {
    urls.push(match[1]);
}

console.log(`Checking ${urls.length} images...`);

async function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            // Unsplash often redirects, so valid statuses are 200-399
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ url, status: res.statusCode, ok: true });
            } else {
                resolve({ url, status: res.statusCode, ok: false });
            }
        }).on('error', (e) => {
            resolve({ url, status: 'ERROR', ok: false });
        });
        req.end();
    });
}

async function run() {
    const results = await Promise.all(urls.map(checkUrl));
    const broken = results.filter(r => !r.ok);

    if (broken.length === 0) {
        console.log("All verify checks passed!");
    } else {
        console.log("Found broken images:");
        broken.forEach(b => console.log(`[${b.status}] ${b.url}`));
    }
}

run();

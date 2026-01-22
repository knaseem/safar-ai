const https = require('https');

const queries = {
    "nyc-halal": "halal,newyork,food,cart",
    "tagine": "morocco,tagine,food",
    "mumbai": "mumbai,street,food",
    "jeddah": "jeddah,saudi,architecture", // "historic" might be too specific, generic jeddah is safer
    "amalfi": "amalfi,coast,positano",
    "milford": "milford,sound,newzealand",
    "sustainable": "hiking,nature,sustainable",
    "sahara": "sahara,desert,tent,camp",
    "train": "luxury,train,interior"
};

async function getRedirectUrl(name, query) {
    return new Promise((resolve) => {
        // Unsplash Source is deprecated/shutdown? 
        // Wait, source.unsplash.com might be down. 
        // Let's check status first. If down, we revert to browsing.
        // Actually, let's try 'https://source.unsplash.com/1600x900/?' + query

        // UPDATE: source.unsplash.com is officially deprecated as of late 2024?
        // Let's try to hit it. If it fails, I'll need another plan.
        // Instead, I'll use the 'https://unsplash.com/napi/search/photos?query=' API endpoint which is public-ish?
        // No, that requires a key or might be protected.

        // Better: Use `https://unsplash.com/s/photos/` + query and parse the HTML? 
        // My previous 'search_web' results showed Unsplash pages.
        // I will try to fetch the HTML of `https://unsplash.com/s/photos/QUERY` and regex extract the first `photo-` ID.

        const searchUrl = `https://unsplash.com/s/photos/${query}`;

        https.get(searchUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Look for pattern: "photos/xxxx-xxxx" or just "photo-xxxx"
                // Unsplash IDs are often alphanumeric.
                // Regex: /photo-([a-zA-Z0-9-]+)/
                const matches = data.match(/photo-([a-zA-Z0-9-]+-[a-zA-Z0-9]+)/g);
                if (matches && matches.length > 0) {
                    // Filter out obviously wrong ones?
                    // Usually the first few are the hits.
                    // unique them
                    const unique = [...new Set(matches)];
                    // Valid Unsplash ID usually starts with "photo-1..." and has 2 dashes?
                    // Example: "photo-1563291074-2bf867700e8e"
                    const valid = unique.find(u => u.length > 20); // rough heuristic
                    resolve({ name, id: valid || unique[0], ok: true });
                } else {
                    resolve({ name, id: null, ok: false });
                }
            });
        }).on('error', () => resolve({ name, id: null, ok: false }));
    });
}

async function run() {
    console.log("Fetching IDs from Unsplash search pages...");
    const results = await Promise.all(Object.entries(queries).map(([k, v]) => getRedirectUrl(k, v)));
    results.forEach(r => console.log(`${r.name}: ${r.id}`));
}

run();

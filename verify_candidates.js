const https = require('https');

const candidates = {
    "nyc-halal": "https://images.unsplash.com/photo-1526367790999-0150786633df?q=80&w=2070&auto=format&fit=crop",
    "tagine": "https://images.unsplash.com/photo-1511690656952-34342d2c2aaa?q=80&w=2070&auto=format&fit=crop",
    "mumbai": "https://images.unsplash.com/photo-1601050690597-2faf52945c3b?q=80&w=2070&auto=format&fit=crop",
    "beirut": "https://images.unsplash.com/photo-1598514986289-485295c91ce8?q=80&w=2070&auto=format&fit=crop",
    "jeddah": "https://images.unsplash.com/photo-1590523741831-ab08819409f4?q=80&w=2070&auto=format&fit=crop",
    "amalfi": "https://images.unsplash.com/photo-1520190283996-71f4360d23ca?q=80&w=2070&auto=format&fit=crop",
    "milford": "https://images.unsplash.com/photo-1479662058309-8d77d13b56a1?q=80&w=2070&auto=format&fit=crop",
    "packing": "https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=2070&auto=format&fit=crop",
    "sustainable": "https://images.unsplash.com/photo-1518548419234-58a44d0fd0c3?q=80&w=2070&auto=format&fit=crop",
    "sahara": "https://images.unsplash.com/photo-1539659392126-724d45d7d32f?q=80&w=2070&auto=format&fit=crop",
    "underwater": "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=2070&auto=format&fit=crop",
    "train": "https://images.unsplash.com/photo-1585292415176-69273c524021?q=80&w=2070&auto=format&fit=crop"
};

async function checkUrl(name, url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ name, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        }).on('error', () => resolve({ name, status: 'ERR', ok: false }));
    });
}

async function run() {
    console.log("Verifying candidates...");
    const results = await Promise.all(Object.entries(candidates).map(([k, v]) => checkUrl(k, v)));
    results.forEach(r => console.log(`${r.name}: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`));
}

run();

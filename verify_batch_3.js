const https = require('https');

const candidates3 = {
    "nyc-halal": "https://images.unsplash.com/photo-1567129937268-d80a3c9f803c?q=80&w=2070&auto=format&fit=crop",
    "tagine": "https://images.unsplash.com/photo-1511690656952-34342d2c2aaa?q=80&w=2070&auto=format&fit=crop", // Trying again... if fail, use generic food
    "mumbai": "https://images.unsplash.com/photo-1530785602389-07594beb8b73?q=80&w=2070&auto=format&fit=crop", // From GitHub
    "beirut": "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop", // Works
    "jeddah": "https://images.unsplash.com/photo-1663900108404-a05e8bf82cda?q=80&w=2070&auto=format&fit=crop", // From GitHub
    "amalfi": "https://images.unsplash.com/photo-1533904812316-015e1975e11e?q=80&w=2070&auto=format&fit=crop",
    "milford": "https://images.unsplash.com/photo-1479662058309-8d77d13b56a1?q=80&w=2070&auto=format&fit=crop",
    "sustainable": "https://images.unsplash.com/photo-1502082553048-f009c371b9b5?q=80&w=2070&auto=format&fit=crop",
    "sahara": "https://images.unsplash.com/photo-1479888229846-9a2d82939912?q=80&w=2070&auto=format&fit=crop",
    "train": "https://images.unsplash.com/photo-1520188748366-02e07802c65a?q=80&w=2070&auto=format&fit=crop",
    "packing": "https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=2070&auto=format&fit=crop", // Works
    "underwater": "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=2070&auto=format&fit=crop" // Works
};

async function checkUrl(name, url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ name, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        }).on('error', () => resolve({ name, status: 'ERR', ok: false }));
    });
}

async function run() {
    console.log("Verifying batch 3 candidates...");
    const results = await Promise.all(Object.entries(candidates3).map(([k, v]) => checkUrl(k, v)));
    results.forEach(r => console.log(`${r.name}: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`));
}

run();

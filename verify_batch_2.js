const https = require('https');

const candidates2 = {
    "nyc-halal": "https://images.unsplash.com/photo-1512411984252-019d675b8712?q=80&w=2070&auto=format&fit=crop",
    "tagine": "https://images.unsplash.com/photo-1598514986289-485295c91ce8?q=80&w=2070&auto=format&fit=crop",
    "mumbai": "https://images.unsplash.com/photo-1506458539166-34079f9e9d7a?q=80&w=2070&auto=format&fit=crop", // Replaced with a generic India street
    "beirut": "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop", // Middle east food
    "jeddah": "https://images.unsplash.com/photo-1595188814717-3844a56a627c?q=80&w=2070&auto=format&fit=crop", // Saudi general
    "amalfi": "https://images.unsplash.com/photo-1530735606451-8f55290f4354?q=80&w=2070&auto=format&fit=crop",
    "milford": "https://images.unsplash.com/photo-1505312926838-89585a9a8360?q=80&w=2070&auto=format&fit=crop",
    "sustainable": "https://images.unsplash.com/photo-1534353473926-47a3e798dc6d?q=80&w=2070&auto=format&fit=crop",
    "sahara": "https://images.unsplash.com/photo-1539050989396-037145b20b70?q=80&w=2070&auto=format&fit=crop",
    "train": "https://images.unsplash.com/photo-1535496660126-5d66044733eb?q=80&w=2070&auto=format&fit=crop",
    "packing": "https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=2070&auto=format&fit=crop", // Confirmed working
    "underwater": "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=2070&auto=format&fit=crop" // Confirmed working
};

async function checkUrl(name, url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ name, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        }).on('error', () => resolve({ name, status: 'ERR', ok: false }));
    });
}

async function run() {
    console.log("Verifying batch 2 candidates...");
    const results = await Promise.all(Object.entries(candidates2).map(([k, v]) => checkUrl(k, v)));
    results.forEach(r => console.log(`${r.name}: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`));
}

run();

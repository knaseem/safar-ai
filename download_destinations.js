const fs = require('fs');
const https = require('https');
const path = require('path');

const destinations = [
    { id: 1, name: "kyoto", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" },
    { id: 2, name: "bali", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop" },
    { id: 5, name: "maldives", url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop" },
    { id: 6, name: "petra", url: "https://images.unsplash.com/photo-1579705745811-a32bef7856a3?q=80&w=2070&auto=format&fit=crop" },
    { id: 31, name: "tokyo", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop" },
    { id: 32, name: "phuket", url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=2001&auto=format&fit=crop" },
    { id: 3, name: "amalfi", url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2066&auto=format&fit=crop" },
    { id: 4, name: "reykjavik", url: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop" },
    { id: 8, name: "santorini", url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2079&auto=format&fit=crop" },
    { id: 9, name: "paris", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop" },
    { id: 10, name: "swiss_alps", url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop" },
    { id: 26, name: "barcelona", url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070&auto=format&fit=crop" },
    { id: 11, name: "machu_picchu", url: "https://images.unsplash.com/photo-1588665792942-ed011aaab0b3?q=80&w=2076&auto=format&fit=crop" },
    { id: 12, name: "tulum", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop" },
    { id: 13, name: "banff", url: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=2070&auto=format&fit=crop" },
    { id: 14, name: "nyc", url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop" },
    { id: 35, name: "patagonia", url: "https://images.unsplash.com/photo-1550993806-38f321df75e3?q=80&w=2102&auto=format&fit=crop" },
    { id: 36, name: "dubai", url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2009&auto=format&fit=crop" },
    { id: 15, name: "marrakech", url: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop" },
    { id: 16, name: "cape_town", url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=2071&auto=format&fit=crop" },
    { id: 17, name: "serengeti", url: "https://images.unsplash.com/photo-1547471080-7fc2caa6f17f?q=80&w=2068&auto=format&fit=crop" },
    { id: 29, name: "cairo", url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=2070&auto=format&fit=crop" },
    { id: 18, name: "queenstown", url: "https://images.unsplash.com/photo-1507699622177-388898d9903d?q=80&w=2070&auto=format&fit=crop" },
    { id: 30, name: "sydney", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop" },
    { id: 19, name: "bora_bora", url: "https://images.unsplash.com/photo-1589979481223-deb893043163?q=80&w=2070&auto=format&fit=crop" }
];

const destDir = path.join(__dirname, 'public', 'images', 'destinations');
if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

function fetchWithRedirect(url, resolve, reject, filepath) {
    https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
             console.log(`Following redirect for ${url} -> ${res.headers.location}`);
             fetchWithRedirect(res.headers.location, resolve, reject, filepath);
             return;
        }

        if (res.statusCode !== 200) {
            reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            return;
        }

        const file = fs.createWriteStream(filepath);
        res.pipe(file);

        file.on('finish', () => {
             file.close();
             resolve();
        });

        file.on('error', (err) => {
             fs.unlink(filepath, () => {});
             reject(err);
        });
    }).on('error', (err) => {
         reject(err);
    });
}


async function downloadImage(dest) {
    const filename = `${dest.name}.jpg`;
    const filepath = path.join(destDir, filename);
    
    console.log(`Downloading ${filename}...`);
    
    return new Promise((resolve, reject) => {
        fetchWithRedirect(dest.url, resolve, reject, filepath);
    });
}

async function run() {
    for (const dest of destinations) {
        try {
            await downloadImage(dest);
            console.log(`✅ Success: ${dest.name}.jpg`);
            // Add a small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.error(`❌ Error downloading ${dest.name}: ${error.message}`);
        }
    }
    console.log("Finished downloading all images.");
}

run();

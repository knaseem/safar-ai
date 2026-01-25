const https = require('https');

const HERO_IMAGES = [
    // Islamabad (User provided Pexels)
    "https://images.pexels.com/photos/27698081/pexels-photo-27698081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
];

function checkUrl(url, index) {
    https.get(url, (res) => {
        console.log(`[${index}] Status: ${res.statusCode} - ${url.substring(0, 50)}...`);
        if (res.statusCode !== 200) {
            console.error(`--> BROKEN: ${url}`);
        }
    }).on('error', (e) => {
        console.error(`[${index}] Error: ${e.message}`);
    });
}

console.log("Checking " + HERO_IMAGES.length + " images...");
HERO_IMAGES.forEach((url, i) => checkUrl(url, i));

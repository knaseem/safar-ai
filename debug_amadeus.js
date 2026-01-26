const Amadeus = require('amadeus');
require('dotenv').config({ path: '.env.local' });

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname: process.env.AMADEUS_HOSTNAME || 'test'
});

async function test() {
    const keywords = ['DUBAI', 'DXB', 'LONDON', 'dubai', 'PARIS'];

    for (const keyword of keywords) {
        console.log(`\nTesting Keyword: ${keyword}`);
        try {
            console.log('Trying with string "CITY"...');
            const res1 = await amadeus.referenceData.locations.get({
                keyword,
                subType: 'CITY'
            });
            console.log(`Success with "CITY"! Results:`, res1.data.length);
        } catch (e) {
            console.log('Failed with "CITY":', e.code);
        }

        try {
            console.log('Trying with string "CITY,AIRPORT"...');
            const res2 = await amadeus.referenceData.locations.get({
                keyword,
                subType: 'CITY,AIRPORT'
            });
            console.log(`Success with "CITY,AIRPORT"! Results:`, res2.data.length);
        } catch (e) {
            console.log('Failed with "CITY,AIRPORT":', e.code);
        }
    }

    try {
        console.log('\nTesting Flight Offer Search for SYD -> DXB...');
        const flights = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: 'SYD',
            destinationLocationCode: 'DXB',
            departureDate: '2026-06-01',
            adults: 1
        });
        console.log('Success! Flights found:', flights.data.length);
    } catch (e) {
        console.log('Failed flights:', e.code);
    }

    try {
        console.log('\nTesting Hotel Search for DXB...');
        const hotels = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: 'DXB'
        });
        console.log('Success! Hotels found:', hotels.data.length);
    } catch (e) {
        console.log('Failed hotels:', e.code);
    }
}

test();


import { createLinkSession } from '../src/lib/duffel';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verify() {
    console.log("🧪 Verifying Duffel Link Session Payload Logic...");

    // Mock search params similar to what the user is doing
    const mockParams = {
        reference: "TEST-REF-123",
        travellerCurrency: "USD",
        enableFlights: true,
        searchParams: {
            origin: "JFK",
            destination: "LON",
            departureDate: "2026-03-10",
            adults: 1
        },
        offerId: "off_real_airline_123" // Real-looking ID
    };

    try {
        // We expect this to fail network call (no API key, or invalid ID), 
        // BUT we valid to catch the console.log of the PAYLOAD before it sends.
        // Since we can't capture console.log easily from the child process, 
        // we will inspect the logic in duffel.ts which we know logs it.
        // Wait... I can't see the console log of the running server.
        // I will rely on reading the object constructed if I mock the Duffel Client?
        // Actually, duffel.ts imports Duffel.

        // Let's just run it and see what happens. 
        // If duffel.ts has console.log, it will print here!
        await createLinkSession(mockParams);

    } catch (e) {
        // Expected because we don't have a real matching offer ID probably, 
        // or network failure. We just want to see the PRE-FLIGHT logs.
        console.log("Finished execution (errors expected from API call).");
    }
}

verify();


/**
 * SIMULATE DUFFEL WEBHOOK
 * 
 * Usage: 
 * npx tsx scripts/simulate-webhook.ts <USER_ID>
 * 
 * Example:
 * npx tsx scripts/simulate-webhook.ts 12345-abcde
 */

async function main() {
    const userId = process.argv[2] || 'test-user-id';
    const appUrl = 'http://localhost:3000/api/webhooks/duffel';

    console.log(`🚀 Simulating Duffel Webhook for User: ${userId}`);
    console.log(`Target: ${appUrl}`);

    const mockOrder = {
        id: `ord_sim_${Date.now()}`,
        booking_reference: `SIM${Math.floor(Math.random() * 1000)}`,
        total_amount: "500.00",
        total_currency: "USD",
        created_at: new Date().toISOString(),
        passengers: [
            { given_name: "Test", family_name: "Traveler", type: "adult" }
        ],
        metadata: {
            user_id: userId,
            source: "simulation"
        }
    };

    const webhookEvent = {
        type: "order.created",
        data: {
            object: mockOrder
        },
        id: `evt_${Date.now()}`
    };

    try {
        const response = await fetch(appUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Duffel-Signature': 'simulated_signature'
            },
            body: JSON.stringify(webhookEvent)
        });

        if (response.ok) {
            console.log("✅ Webhook sent successfully!");
            const data = await response.json();
            console.log("Response:", data);
        } else {
            console.error("❌ Webhook failed:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
        }

    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

main();

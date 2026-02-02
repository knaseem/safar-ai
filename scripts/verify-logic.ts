
import { applyMarkup } from '../src/lib/pricing';

async function runTests() {
    console.log("🧪 Starting Logic Verification...\n");
    let passed = 0;
    let failed = 0;

    function assert(desc: string, actual: any, expected: any) {
        if (actual === expected) {
            console.log(`✅ [PASS] ${desc}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${desc}`);
            console.error(`   Expected: ${expected}`);
            console.error(`   Actual:   ${actual}`);
            failed++;
        }
    }

    // 1. Verify Flight Markup (Default 5%)
    // Mock ENV if needed, or assume default
    const flightBase = 100;
    const flightExpected = 105;
    assert("Flight Markup (5%)", applyMarkup(flightBase, 'flight'), flightExpected);

    // 2. Verify Hotel Markup (Default 10%)
    const hotelBase = 200;
    const hotelExpected = 220; // 200 * 1.10
    assert("Hotel Markup (10%)", applyMarkup(hotelBase, 'hotel'), hotelExpected);

    // 3. Verify Ancillary Fee (Default $15)
    const ancillaryBase = 50;
    const ancillaryExpected = 65;
    assert("Ancillary Fee ($15)", applyMarkup(ancillaryBase, 'ancillary'), ancillaryExpected);

    // 4. Verify Rounding
    const oddBase = 123.45;
    const oddMarkup = oddBase * 1.10; // 135.795
    const expectedRounded = 135.80;
    assert("Rounding Logic", applyMarkup(oddBase, 'hotel'), expectedRounded);

    // 5. Verify String Input Handling
    assert("String Input Handling", applyMarkup("100", 'hotel'), 110);

    console.log(`\n🎉 Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);

import { test, expect } from '@playwright/test';

test.describe('Activities Search Flow', () => {
    test('should search for activities and open Viator with affiliate ID', async ({ page, context }) => {
        // 1. Navigate to activities page
        await page.goto('/activities');

        // 2. Wait for the page to load
        await expect(page.locator('text=Find Unforgettable')).toBeVisible();

        // 3. Fill the search input
        const searchInput = page.locator('input[type="text"]').first();
        await searchInput.fill('Tokyo');

        // 4. Submit the search
        const searchBtn = page.locator('button:has-text("Search"), button[aria-label="Search"]');
        await searchBtn.click();

        // 5. Wait for the activity cards to load directly in the DOM
        // Looking for the "Browse All Tokyo Activities on Viator" link at the bottom of the section
        const viatorLink = page.locator('text=Browse All Tokyo Activities on Viator').first();
        await expect(viatorLink).toBeVisible();

        // 6. Click it and catch the new page (popup)
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            viatorLink.click()
        ]);

        // 7. Verify the new page URL is Viator and has the affiliate ID
        await newPage.waitForLoadState();
        const url = newPage.url();

        expect(url).toContain('viator.com');
        // This confirms the affiliate tracking is present
        expect(url).toContain('pid=P');
    });
});

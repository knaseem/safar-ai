import { test, expect } from '@playwright/test';

test.describe('Homepage E2E', () => {
    test('should render hero section correctly', async ({ page }) => {
        // 1. Navigate to homepage
        await page.goto('/');

        // 2. Verify title
        await expect(page).toHaveTitle(/SafarAI/);

        // 3. Verify main heading exists
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
        await expect(heading).toContainText(/Experience the World/i);

        // 4. Verify AI Planner tab is visible
        const plannerTab = page.locator('text=AI Planner').first();
        await expect(plannerTab).toBeVisible();

        // 5. Verify Call to Action button exists
        const startPlanningBtn = page.locator('text=Go').first();
        await expect(startPlanningBtn).toBeVisible();
    });
});

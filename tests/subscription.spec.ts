import { test, expect } from '@playwright/test'

test.describe('Subscription / Checkout Flow', () => {
    test('subscription page loads and shows pricing', async ({ page }) => {
        await page.goto('/subscription')
        await expect(page.getByText('$14.99')).toBeVisible()
        await expect(page.getByText('$69.99')).toBeVisible()
    })

    test('billing toggle switches between monthly and yearly', async ({ page }) => {
        await page.goto('/subscription')
        // Default is yearly
        await expect(page.getByText('$69.99')).toBeVisible()
        // Click Monthly toggle
        const monthlyBtn = page.getByRole('button', { name: /monthly/i })
        if (await monthlyBtn.isVisible()) {
            await monthlyBtn.click()
            await expect(page.getByText('$14.99')).toBeVisible()
        }
    })

    test('clicking upgrade when logged out opens auth modal', async ({ page }) => {
        await page.goto('/subscription')
        // Click the Pro upgrade button
        const upgradeBtn = page.getByRole('button', { name: /go pro|claim founder/i }).first()
        if (await upgradeBtn.isVisible()) {
            await upgradeBtn.click()
            // Should prompt sign in, not redirect to Stripe
            const modal = page.getByRole('dialog')
            await expect(modal).toBeVisible()
        }
    })

    test('checkout page with no offer ID shows error for flights', async ({ page }) => {
        await page.goto('/checkout?type=flight')
        await expect(page.getByText(/no flight offer selected/i)).toBeVisible({ timeout: 5000 })
    })

    test('checkout page with offer ID shows loading state', async ({ page }) => {
        await page.goto('/checkout?type=flight&offer_id=test-offer-123')
        // Should show loading/checkout UI, not the error
        await expect(page.getByText(/secure checkout|preparing|redirecting/i)).toBeVisible({ timeout: 5000 })
    })
})

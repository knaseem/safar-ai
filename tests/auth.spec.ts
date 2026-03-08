import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
    test('homepage shows Sign In button when logged out', async ({ page }) => {
        await page.goto('/')
        // Sign In button should be visible in the navbar for desktop
        const signInBtn = page.getByRole('button', { name: /sign in/i })
        await expect(signInBtn.first()).toBeVisible()
    })

    test('homepage shows hamburger menu on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 })
        await page.goto('/')
        // Mobile hamburger button should be visible
        const hamburger = page.getByRole('button', { name: /open menu/i })
        await expect(hamburger).toBeVisible()
    })

    test('mobile menu opens and shows Sign In', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 })
        await page.goto('/')
        await page.getByRole('button', { name: /open menu/i }).click()
        // Sign In should appear inside the mobile drawer
        const signIn = page.getByRole('button', { name: /sign in/i })
        await expect(signIn.first()).toBeVisible()
    })

    test('auth modal opens when Sign In is clicked', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: /sign in/i }).first().click()
        // Auth modal should appear
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
    })

    test('auth callback rejects external redirect in next param', async ({ page }) => {
        // The open redirect should be blocked — should redirect to / instead
        const res = await page.request.get('/auth/callback?next=https://evil.com')
        // Should redirect to / not to evil.com
        expect(res.url()).not.toContain('evil.com')
    })
})

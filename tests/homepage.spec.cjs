const { test, expect } = require('@playwright/test');

test('kanban board loads with three columns', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Kanban Board');
    await expect(page.locator('.column')).toHaveCount(3);
});
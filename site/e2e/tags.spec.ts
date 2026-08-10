import { expect, test } from '@playwright/test';

test('标签列表页可访问', async ({ page }) => {
	await page.goto('/blog/tags');
	await expect(page).toHaveURL(/\/blog\/tags\/?/);
	await expect(page).toHaveTitle(/QuincySnow|标签|Tags/);
});

test('标签页有标签标题', async ({ page }) => {
	await page.goto('/blog/tags');
	await expect(page.locator('main h1')).toBeVisible();
	await expect(page.locator('main h1')).toHaveText(/标签|Tags/);
});

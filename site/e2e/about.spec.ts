import { expect, test } from '@playwright/test';

test('关于页可访问且标题正确', async ({ page }) => {
	await page.goto('/blog/about');
	await expect(page).toHaveURL(/\/blog\/about\/?/);
	await expect(page).toHaveTitle(/QuincySnow|关于/);
});

test('关于页包含作品集标题', async ({ page }) => {
	await page.goto('/blog/about');
	await expect(page.locator('main').getByText(/Open source projects|开源作品集/).first()).toBeVisible();
});

test('关于页包含 GitHub 链接', async ({ page }) => {
	await page.goto('/blog/about');
	await expect(page.locator('main').getByRole('link', { name: /GitHub/i }).first()).toBeVisible();
});

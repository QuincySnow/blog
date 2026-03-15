import { expect, test } from '@playwright/test';

test('关于页可访问且标题正确', async ({ page }) => {
	await page.goto('/about');
	await expect(page).toHaveURL(/\/blog\/about\/?$/);
	await expect(page).toHaveTitle(/QuincySnow|关于/);
});

test('关于页包含作品集标题', async ({ page }) => {
	await page.goto('/about');
	await expect(
		page.getByRole('heading', { name: /Open source projects|开源作品集/ }),
	).toBeVisible();
});

test('关于页包含 GitHub 链接', async ({ page }) => {
	await page.goto('/about');
	await expect(page.getByRole('link', { name: /GitHub/i })).toBeVisible();
});

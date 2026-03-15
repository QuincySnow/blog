import { expect, test } from '@playwright/test';

test('文章详情页可访问且含标题', async ({ page }) => {
	await page.goto('/blog/2025-03-01-zsh/');
	await expect(page).toHaveURL(/\/blog\/blog\/2025-03-01-zsh/);
	await expect(page).toHaveTitle(/QuincySnow|zsh/);
	await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: /zsh|Zsh/ })).toBeVisible();
});

test('文章页有目录或正文', async ({ page }) => {
	await page.goto('/blog/2025-03-01-zsh/');
	const toc = page.getByText(/Table of contents|文章目录/);
	const main = page.locator('main');
	await expect(toc.or(main)).toBeVisible();
});

test('文章页可返回博客列表', async ({ page }) => {
	await page.goto('/blog/2025-03-01-zsh/');
	await page.getByRole('link', { name: /Articles|文章/ }).click();
	await expect(page).toHaveURL(/\/blog\/?$/);
});

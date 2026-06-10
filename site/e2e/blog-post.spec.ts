import { expect, test } from '@playwright/test';

test('文章详情页可访问且含标题', async ({ page }) => {
	await page.goto('/blog/blog/2025-03-01-zsh/');
	await expect(page).toHaveURL(/blog\/2025-03-01-zsh/);
	await expect(page).toHaveTitle(/QuincySnow|zsh/);
	await expect(page.locator('main').locator('h1').filter({ hasText: /zsh|Zsh/ }).first()).toBeVisible();
});

test('文章页有目录或正文', async ({ page }) => {
	await page.goto('/blog/blog/2025-03-01-zsh/');
	await expect(page.locator('main .prose-content')).toBeVisible();
});

test('文章页可返回博客列表', async ({ page }) => {
	await page.goto('/blog/blog/2025-03-01-zsh/');
	await page.locator('nav .internal-links a').filter({ hasText: /Articles|文章/ }).click();
	await expect(page).toHaveURL(/\/blog\/blog\/?$/);
});

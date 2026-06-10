import { expect, test } from '@playwright/test';

test('博客首页可访问且标题正确', async ({ page }) => {
	await page.goto('/blog/');
	await expect(page).toHaveTitle(/QuincySnow/);
});

test('博客首页包含导航链接', async ({ page }) => {
	await page.goto('/blog/');
	const nav = page.locator('nav .internal-links');
	await expect(nav.locator('a')).toHaveCount(4);
	await expect(nav.getByText(/Home|首页/)).toBeVisible();
	await expect(nav.getByText(/Articles|文章/)).toBeVisible();
	await expect(nav.getByText(/Tags|标签/)).toBeVisible();
	await expect(nav.getByText(/About|关于/)).toBeVisible();
});

test('首页导航链接带 base 前缀', async ({ page }) => {
	await page.goto('/blog/');
	const aboutLink = page.locator('nav .internal-links a').filter({ hasText: /About|关于/ });
	await expect(aboutLink.first()).toHaveAttribute('href', /\/blog\/about/);
});

test('主题切换与语言切换按钮存在', async ({ page }) => {
	await page.goto('/blog/');
	await expect(page.locator('.theme-toggle')).toBeVisible();
	await expect(page.locator('.lang-toggle')).toBeVisible();
});

test('文章列表页可访问', async ({ page }) => {
	await page.goto('/blog/blog');
	await expect(page).toHaveURL(/\/blog\/blog\/?$/);
	await expect(page).toHaveTitle(/QuincySnow|文章/);
});

import { expect, test } from '@playwright/test';

test('博客首页可访问且标题正确', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/QuincySnow/);
});

test('博客首页包含导航链接', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Articles' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Tags' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
});

test('首页导航链接带 base 前缀', async ({ page }) => {
	await page.goto('/');
	const aboutLink = page.getByRole('link', { name: 'About' }).first();
	await expect(aboutLink).toHaveAttribute('href', /\/blog\/about/);
});

test('主题切换与语言切换按钮存在', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('button', { name: /Toggle light\/dark theme|切换浅色\/深色主题/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /EN|中文/ })).toBeVisible();
});

test('文章列表页可访问', async ({ page }) => {
	await page.goto('/blog');
	await expect(page).toHaveURL(/\/blog\/?$/);
	await expect(page).toHaveTitle(/QuincySnow|文章/);
});

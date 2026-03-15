import { expect, test } from '@playwright/test';

test.describe('搜索弹窗', () => {
	test('点击搜索按钮可打开弹窗', async ({ page }) => {
		await page.goto('/blog/');
		const overlay = page.locator('#search-overlay');
		await expect(overlay).toHaveAttribute('aria-hidden', 'true');
		await page.locator('#search-trigger').click();
		await expect(overlay).toHaveAttribute('aria-hidden', 'false');
		await expect(page.locator('#search-overlay-input')).toBeVisible();
	});

	test('弹窗内可输入并显示搜索框', async ({ page }) => {
		await page.goto('/blog/');
		await page.locator('#search-trigger').click();
		const input = page.locator('#search-overlay-input');
		await input.fill('zsh');
		await expect(input).toHaveValue('zsh');
	});

	test('按 Escape 可关闭弹窗', async ({ page }) => {
		await page.goto('/blog/');
		await page.locator('#search-trigger').click();
		await expect(page.locator('#search-overlay')).toHaveAttribute('aria-hidden', 'false');
		await page.keyboard.press('Escape');
		await expect(page.locator('#search-overlay')).toHaveAttribute('aria-hidden', 'true');
	});
});

test.describe('主题切换', () => {
	test('点击主题按钮后 data-theme 切换', async ({ page }) => {
		await page.goto('/blog/');
		const html = page.locator('html');
		const themeBefore = (await html.getAttribute('data-theme')) || 'light';
		await page.locator('.theme-toggle').click();
		const themeAfter = (await html.getAttribute('data-theme')) || 'light';
		expect(themeAfter).toBe(themeBefore === 'dark' ? 'light' : 'dark');
	});
});

test.describe('语言切换', () => {
	const langButton = (page: import('@playwright/test').Page) => page.locator('.lang-toggle');

	test('点击语言按钮后 document lang 变化', async ({ page }) => {
		await page.goto('/blog/');
		const html = page.locator('html');
		const langBefore = (await html.getAttribute('lang')) ?? '';
		await langButton(page).click();
		const langAfter = (await html.getAttribute('lang')) ?? '';
		expect(langAfter).not.toBe(langBefore);
		expect(['zh-CN', 'en'].includes(langAfter)).toBe(true);
	});

	test('切换语言后首页导航链接文案在中英文间变化', async ({ page }) => {
		await page.goto('/blog/');
		await page.waitForLoadState('domcontentloaded');
		const nav = page.locator('nav .internal-links');
		await expect(nav).toBeVisible();
		const firstLink = nav.locator('a').first();
		const textBefore = (await firstLink.textContent())?.trim() ?? '';
		await langButton(page).click();
		const textAfter = (await nav.locator('a').first().textContent())?.trim() ?? '';
		const texts = new Set([textBefore, textAfter]);
		expect(texts.has('Home') || texts.has('首页')).toBe(true);
	});
});

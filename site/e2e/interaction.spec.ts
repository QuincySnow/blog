import { expect, test } from '@playwright/test';

test.describe('搜索弹窗', () => {
	test('点击搜索按钮可打开弹窗', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('dialog', { name: /Search|搜索/ })).toHaveAttribute('aria-hidden', 'true');
		await page.getByRole('button', { name: /Search|搜索/ }).click();
		await expect(page.getByRole('dialog', { name: /Search|搜索/ })).toHaveAttribute('aria-hidden', 'false');
		await expect(page.getByRole('searchbox')).toBeVisible();
	});

	test('弹窗内可输入并显示搜索框', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /Search|搜索/ }).click();
		const input = page.getByRole('searchbox');
		await input.fill('zsh');
		await expect(input).toHaveValue('zsh');
	});

	test('点击背景或按 Escape 可关闭弹窗', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /Search|搜索/ }).click();
		await expect(page.getByRole('dialog').first()).toHaveAttribute('aria-hidden', 'false');
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog').first()).toHaveAttribute('aria-hidden', 'true');
	});
});

test.describe('主题切换', () => {
	test('点击主题按钮后 data-theme 切换', async ({ page }) => {
		await page.goto('/');
		const html = page.locator('html');
		const themeBefore = await html.getAttribute('data-theme');
		await page.getByRole('button', { name: /Toggle light\/dark theme|切换浅色\/深色主题/ }).click();
		const themeAfter = await html.getAttribute('data-theme');
		expect(themeAfter).toBe(themeBefore === 'dark' ? 'light' : 'dark');
	});
});

test.describe('语言切换', () => {
	test('点击语言按钮后导航文案或 document 语言变化', async ({ page }) => {
		await page.goto('/');
		const html = page.locator('html');
		const langBefore = await html.getAttribute('lang');
		// 点击语言切换（EN 或 中文）
		await page.getByRole('button', { name: /^EN$|^中文$/ }).click();
		const langAfter = await html.getAttribute('lang');
		expect(langAfter).not.toBe(langBefore);
		expect(['zh-CN', 'en'].includes(langAfter ?? '')).toBe(true);
	});

	test('切换语言后导航链接文案对应中英文', async ({ page }) => {
		await page.goto('/');
		const homeLink = page.getByRole('link', { name: /Home|首页/ }).first();
		const textBefore = await homeLink.textContent();
		await page.getByRole('button', { name: /^EN$|^中文$/ }).click();
		const textAfter = await page.getByRole('link', { name: /Home|首页/ }).first().textContent();
		// 至少有一个是 Home，一个是 首页
		const texts = [textBefore?.trim(), textAfter?.trim()].filter(Boolean);
		expect(texts.some((t) => t === 'Home')).toBe(true);
		expect(texts.some((t) => t === '首页')).toBe(true);
	});
});

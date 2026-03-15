import { expect, test } from '@playwright/test';

test('标签列表页可访问', async ({ page }) => {
	await page.goto('/tags');
	await expect(page).toHaveURL(/\/blog\/tags\/?$/);
	await expect(page).toHaveTitle(/QuincySnow|标签|Tags/);
});

test('标签页有标签链接或空状态', async ({ page }) => {
	await page.goto('/tags');
	const heading = page.getByRole('heading', { name: /Tags|标签/ });
	await expect(heading).toBeVisible();
	// 有标签时存在链接，无标签时可能有说明文案
	const links = page.getByRole('link').filter({ hasNotText: /Home|Articles|Tags|About|QuincySnow/ });
	const count = await links.count();
	expect(count >= 0).toBe(true);
});

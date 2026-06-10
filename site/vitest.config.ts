/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

// 不使用 getViteConfig(astro)，避免 Astro 插件在 Vitest 中依赖 dev server 上下文导致报错。
// 仅跑纯 TS/JS 单元测试（如 consts）；测 .astro 组件可用 Playwright E2E 或后续用 Container API。
export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
		env: {
			BASE_URL: '/blog/',
		},
	},
	define: {
		'import.meta.env.BASE_URL': JSON.stringify('/blog/'),
	},
});

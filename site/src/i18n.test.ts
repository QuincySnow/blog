import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_LANG,
	getStoredLang,
	getStoredTheme,
	i18n,
	setStoredLang,
	setStoredTheme,
} from './i18n';

describe('i18n', () => {
	it('exports DEFAULT_LANG as zh', () => {
		expect(DEFAULT_LANG).toBe('zh');
	});

	it('has en and zh top-level keys with nav, blog, theme, etc.', () => {
		expect(i18n.en).toBeDefined();
		expect(i18n.zh).toBeDefined();
		expect(i18n.en.nav.home).toBe('Home');
		expect(i18n.zh.nav.home).toBe('首页');
		expect(i18n.en.theme.dark).toBe('Dark');
		expect(i18n.zh.theme.dark).toBe('深色');
		expect(i18n.en.blog.documentTitle).toContain('QuincySnow');
		expect(i18n.zh.dateLocale).toBe('zh-CN');
		expect(i18n.en.dateLocale).toBe('en-US');
	});

	it('has same top-level keys for en and zh', () => {
		const enKeys = Object.keys(i18n.en).sort();
		const zhKeys = Object.keys(i18n.zh).sort();
		expect(enKeys).toEqual(zhKeys);
	});
});

describe('getStoredLang / setStoredLang', () => {
	const store: Record<string, string> = {};
	let originalWindow: typeof globalThis.window;

	beforeEach(() => {
		originalWindow = globalThis.window;
		// @ts-expect-error minimal mock
		globalThis.window = {};
		vi.stubGlobal(
			'localStorage',
			{
				getItem: (key: string) => store[key] ?? null,
				setItem: (key: string, value: string) => {
					store[key] = value;
				},
			},
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		globalThis.window = originalWindow;
		store.lang = undefined;
	});

	it('returns DEFAULT_LANG when window is undefined (SSR)', () => {
		// @ts-expect-error simulate SSR
		globalThis.window = undefined;
		expect(getStoredLang()).toBe(DEFAULT_LANG);
	});

	it('returns stored lang when valid', () => {
		store.lang = 'en';
		expect(getStoredLang()).toBe('en');
		store.lang = 'zh';
		expect(getStoredLang()).toBe('zh');
	});

	it('returns DEFAULT_LANG when stored value is invalid', () => {
		store.lang = 'fr';
		expect(getStoredLang()).toBe(DEFAULT_LANG);
		store.lang = '';
		expect(getStoredLang()).toBe(DEFAULT_LANG);
	});

	it('setStoredLang writes to localStorage', () => {
		setStoredLang('en');
		expect(store.lang).toBe('en');
		setStoredLang('zh');
		expect(store.lang).toBe('zh');
	});
});

describe('getStoredTheme / setStoredTheme', () => {
	const store: Record<string, string> = {};
	let originalWindow: typeof globalThis.window;

	beforeEach(() => {
		originalWindow = globalThis.window;
		// @ts-expect-error minimal mock
		globalThis.window = {};
		vi.stubGlobal(
			'localStorage',
			{
				getItem: (key: string) => store[key] ?? null,
				setItem: (key: string, value: string) => {
					store[key] = value;
				},
			},
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		globalThis.window = originalWindow;
		store.theme = undefined;
	});

	it('returns light when window is undefined (SSR)', () => {
		// @ts-expect-error simulate SSR
		globalThis.window = undefined;
		expect(getStoredTheme()).toBe('light');
	});

	it('returns stored theme when valid', () => {
		store.theme = 'dark';
		expect(getStoredTheme()).toBe('dark');
		store.theme = 'light';
		expect(getStoredTheme()).toBe('light');
	});

	it('returns light when stored value is invalid', () => {
		store.theme = 'system';
		expect(getStoredTheme()).toBe('light');
		store.theme = '';
		expect(getStoredTheme()).toBe('light');
	});

	it('setStoredTheme writes to localStorage', () => {
		setStoredTheme('dark');
		expect(store.theme).toBe('dark');
		setStoredTheme('light');
		expect(store.theme).toBe('light');
	});
});

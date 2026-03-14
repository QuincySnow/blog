export type Lang = 'zh' | 'en';

export const i18n = {
	en: {
		nav: {
			home: 'Home',
			blog: 'Articles',
			tags: 'Tags',
			about: 'About',
			search: 'Search',
		},
		theme: {
			light: 'Light',
			dark: 'Dark',
			aria: 'Toggle light/dark theme',
		},
		lang: {
			aria: 'Switch language',
			zh: '中文',
			en: 'EN',
		},
		home: {
			intro: 'Tech notes & code sharing.',
			recentTitle: 'Recent posts',
			morePosts: 'All posts →',
		},
		search: {
			title: 'Search',
			label: 'Search posts',
			placeholder: 'Search by title or tags…',
			noResults: 'No matching posts.',
			pageTitle: 'Search',
			pageDescription: 'Search posts',
			documentTitle: 'Search - QuincySnow',
		},
		tags: {
			title: 'Tags',
			documentTitle: 'Tags - QuincySnow',
		},
		about: {
			title: 'About',
			description: 'About me',
			documentTitle: 'About - QuincySnow',
		},
		post: {
			lastUpdated: 'Last updated on',
			tocTitle: 'Table of contents',
		},
		code: {
			copy: 'Copy',
			copied: 'Copied!',
		},
		footer: {
			copyright: 'All rights reserved.',
		},
		site: {
			title: 'QuincySnow',
		},
	},
	zh: {
		nav: {
			home: '首页',
			blog: '文章',
			tags: '标签',
			about: '关于',
			search: '搜索',
		},
		theme: {
			light: '浅色',
			dark: '深色',
			aria: '切换浅色/深色主题',
		},
		lang: {
			aria: '切换语言',
			zh: '中文',
			en: 'EN',
		},
		home: {
			intro: '技术笔记与代码分享。',
			recentTitle: '最近文章',
			morePosts: '全部文章 →',
		},
		search: {
			title: '搜索',
			label: '搜索文章',
			placeholder: '按标题、标签搜索…',
			noResults: '没有匹配的文章',
			pageTitle: '搜索',
			pageDescription: '搜索文章',
			documentTitle: '搜索 - QuincySnow',
		},
		tags: {
			title: '标签',
			documentTitle: '标签 - QuincySnow',
		},
		about: {
			title: '关于',
			description: '关于我',
			documentTitle: '关于 - QuincySnow',
		},
		post: {
			lastUpdated: '更新于',
			tocTitle: '文章目录',
		},
		code: {
			copy: '复制',
			copied: '已复制!',
		},
		footer: {
			copyright: '版权所有。',
		},
		site: {
			title: 'QuincySnow',
		},
	},
} as const;

export const DEFAULT_LANG: Lang = 'zh';

export function getStoredLang(): Lang {
	if (typeof window === 'undefined') return DEFAULT_LANG;
	const s = localStorage.getItem('lang');
	return s === 'en' || s === 'zh' ? s : DEFAULT_LANG;
}

export function setStoredLang(lang: Lang): void {
	localStorage.setItem('lang', lang);
}

export function getStoredTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	const s = localStorage.getItem('theme');
	return s === 'dark' || s === 'light' ? s : 'light';
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
	localStorage.setItem('theme', theme);
}

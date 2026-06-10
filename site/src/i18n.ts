export type Lang = 'zh' | 'en';

export const i18n = {
	en: {
		nav: {
			home: 'Home',
			posts: 'Articles',
			tags: 'Tags',
			about: 'About',
			search: 'Search',
		},
		posts: {
			documentTitle: 'Articles - QuincySnow',
			description: 'All posts',
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
			moreResults: 'more…',
			pageTitle: 'Search',
			pageDescription: 'Search posts',
			documentTitle: 'Search - QuincySnow',
		},
		tags: {
			title: 'Tags',
			description: 'Browse posts by tag',
			documentTitle: 'Tags - QuincySnow',
			moreResults: 'more…',
			back: '← All tags',
			postCountSuffix: 'post(s)',
		},
		about: {
			title: 'About',
			description: 'About me',
			documentTitle: 'About - QuincySnow',
			placeholder: '— · —',
			portfolioTitle: 'Open source projects',
			portfolioIntro: 'A few projects I built independently, covering DevOps, front-end, and full-stack.',
			linkGitHub: 'GitHub',
			linkDemo: 'Demo',
			devSetupName: 'dev-setup',
			devSetupDesc: 'One-click dev environment bootstrapper: Shell scripts for macOS/Linux (Fish/Zsh, uv, Docker, etc.).',
			devSetupTech: 'Shell, GitHub Actions',
			devSetupDemo: 'One-line curl command in README',
			focusFlowName: 'FocusFlow',
			focusFlowDesc: 'SvelteKit full-stack login/productivity starter with dark mode and DaisyUI.',
			focusFlowTech: 'SvelteKit, DaisyUI, Tailwind',
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
		dateLocale: 'en-US',
	},
	zh: {
		nav: {
			home: '首页',
			posts: '文章',
			tags: '标签',
			about: '关于',
			search: '搜索',
		},
		posts: {
			documentTitle: '文章 - QuincySnow',
			description: '全部文章',
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
			moreResults: '篇更多…',
			pageTitle: '搜索',
			pageDescription: '搜索文章',
			documentTitle: '搜索 - QuincySnow',
		},
		tags: {
			title: '标签',
			description: '按标签浏览文章',
			documentTitle: '标签 - QuincySnow',
			moreResults: '篇更多…',
			back: '← 全部标签',
			postCountSuffix: '篇文章',
		},
		about: {
			title: '关于',
			description: '关于我',
			documentTitle: '关于 - QuincySnow',
			placeholder: '— · —',
			portfolioTitle: '我的开源作品集',
			portfolioIntro: '这里展示我独立开发的几个项目，覆盖 DevOps、Web 前端、全栈等方向。每个项目都有 GitHub 仓库和在线 Demo。',
			linkGitHub: 'GitHub',
			linkDemo: 'Demo',
			devSetupName: 'dev-setup',
			devSetupDesc: '一键开发环境 bootstrapper：Shell 脚本自动化安装 macOS/Linux 开发环境（Fish/Zsh 美化、uv、Docker 等）。',
			devSetupTech: 'Shell, GitHub Actions',
			devSetupDemo: 'README 中的一键 curl 命令',
			focusFlowName: 'FocusFlow',
			focusFlowDesc: 'SvelteKit 全栈登录/生产力起点，支持暗黑模式、DaisyUI。',
			focusFlowTech: 'SvelteKit, DaisyUI, Tailwind',
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
		dateLocale: 'zh-CN',
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

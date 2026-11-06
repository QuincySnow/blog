// @ts-check

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
	site: 'https://quincysnow.github.io',
	base: '/blog',
	integrations: [mdx(), sitemap(), pagefind()],
	markdown: {
		rehypePlugins: [
			rehypeCallouts,
			[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
		],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});

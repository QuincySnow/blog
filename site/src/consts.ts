// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'QuincySnow';
export const SITE_DESCRIPTION = 'QuincySnow 的博客';

/** Base path from astro.config base (e.g. '/blog'). All internal links must start with this. */
export const BASE_PATH = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '') || '';

/** Prefix path with BASE_PATH so links work when site is served under a subpath. */
export function withBase(path: string): string {
	if (!path || path === '/') return BASE_PATH || '/';
	return BASE_PATH + (path.startsWith('/') ? path : '/' + path);
}

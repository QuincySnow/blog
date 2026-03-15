import { describe, expect, it } from 'vitest';
import { BASE_PATH, SITE_TITLE, SITE_DESCRIPTION, withBase } from './consts';

describe('consts', () => {
	it('exports SITE_TITLE and SITE_DESCRIPTION', () => {
		expect(SITE_TITLE).toBe('QuincySnow');
		expect(SITE_DESCRIPTION).toContain('博客');
	});

	it('BASE_PATH is /blog in this project', () => {
		expect(BASE_PATH).toBe('/blog');
	});
});

describe('withBase', () => {
	it('prefixes absolute path with BASE_PATH', () => {
		expect(withBase('/about')).toBe(BASE_PATH + '/about');
		expect(withBase('/tags')).toBe(BASE_PATH + '/tags');
		expect(withBase('/blog/2025-03-01-zsh')).toBe(BASE_PATH + '/blog/2025-03-01-zsh');
	});

	it('handles root path', () => {
		expect(withBase('/')).toBe(BASE_PATH || '/');
	});

	it('adds leading slash for relative path', () => {
		expect(withBase('about')).toBe(BASE_PATH + '/about');
		expect(withBase('blog')).toBe(BASE_PATH + '/blog');
	});

	it('handles empty path as root', () => {
		expect(withBase('')).toBe(BASE_PATH || '/');
	});

	it('does not double slash when path already has leading slash', () => {
		expect(withBase('/about')).toBe('/blog/about');
		expect(withBase('/')).toBe('/blog');
	});

	it('preserves path with trailing slash', () => {
		expect(withBase('/about/')).toBe(BASE_PATH + '/about/');
	});

	it('returns a string and does not mutate input', () => {
		const path = '/foo';
		const out = withBase(path);
		expect(typeof out).toBe('string');
		expect(path).toBe('/foo');
	});
});

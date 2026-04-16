import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '{zh,en}/**/*.{md,mdx}' }),
		schema: ({ image }) =>
			z
				.object({
					title: z.string(),
					description: z.string(),
					pubDatetime: z.coerce.date(),
					modDatetime: z.coerce.date().optional(),
					draft: z.boolean().optional(),
					tags: z.array(z.string()).optional(),
					heroImage: z.optional(image()),
					lang: z.enum(['zh', 'en']).optional(),
				})
			.transform((data) => ({
				...data,
				pubDate: data.pubDatetime,
				updatedDate: data.modDatetime,
			})),
});

export const collections = { blog };

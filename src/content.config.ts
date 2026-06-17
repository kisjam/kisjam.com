import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const taxonomy = z.object({ name: z.string(), slug: z.string() });

const blog = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		date: z.coerce.date(),
		modified: z.coerce.date(),
		emoji: z.string().default(""),
		excerpt: z.string().default(""),
		categories: z.array(taxonomy).default([]),
		tags: z.array(taxonomy).default([]),
	}),
});

export const collections = { blog };

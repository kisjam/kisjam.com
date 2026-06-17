import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export function postUri(post: BlogPost): string {
	return `/blog/${post.data.slug}/`;
}

export async function getSortedPosts(): Promise<BlogPost[]> {
	const posts = await getCollection("blog");
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getCategories(): Promise<{ name: string; slug: string }[]> {
	const posts = await getCollection("blog");
	const map = new Map<string, string>();
	for (const p of posts) for (const c of p.data.categories) map.set(c.slug, c.name);
	return [...map].map(([slug, name]) => ({ name, slug }));
}

export async function getArchives(): Promise<string[]> {
	const posts = await getCollection("blog");
	const set = new Set<string>();
	for (const p of posts) {
		const [y, m] = jstParts(p.data.date);
		set.add(`${y}/${Number(m)}`);
	}
	return [...set];
}

export function jstParts(d: Date): [string, string, string] {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(d);
	const get = (t: string) => parts.find((p) => p.type === t)!.value;
	return [get("year"), get("month"), get("day")];
}

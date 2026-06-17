import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

// 記事URL（旧WPの uri と同じ /blog/<slug>/ を維持）
export function postUri(post: BlogPost): string {
	return `/blog/${post.data.slug}/`;
}

// 公開日の新しい順
export async function getSortedPosts(): Promise<BlogPost[]> {
	const posts = await getCollection("blog");
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// 全カテゴリ（重複排除、出現順）
export async function getCategories(): Promise<{ name: string; slug: string }[]> {
	const posts = await getCollection("blog");
	const map = new Map<string, string>(); // slug -> name
	for (const p of posts) for (const c of p.data.categories) map.set(c.slug, c.name);
	return [...map].map(([slug, name]) => ({ name, slug }));
}

// 全アーカイブ（YYYY/M、JST基準）
export async function getArchives(): Promise<string[]> {
	const posts = await getCollection("blog");
	const set = new Set<string>();
	for (const p of posts) {
		const [y, m] = jstParts(p.data.date);
		set.add(`${y}/${Number(m)}`);
	}
	return [...set];
}

// Date を JST(Asia/Tokyo) の [年, 月, 日] 文字列に。ビルド環境のTZに依存しない。
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

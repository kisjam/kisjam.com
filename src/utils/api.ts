type Category = { name: string; slug?: string; uri?: string };
type Tag = { name: string };

export type PostMeta = {
	id: string;
	title: string;
	date: string;
	modified: string;
	uri: string;
	slug: string;
	acfEmoji: string;
	categories: { nodes: Category[] };
	tags: { nodes: Tag[] };
};

export type Post = PostMeta & {
	content: string;
};

type CategoryWithPosts = {
	id: string;
	name: string;
	slug: string;
	posts: { nodes: PostMeta[] };
};

const API_URL = import.meta.env.WORDPRESS_API_URL;

async function gql(query: string): Promise<any> {
	const response = await fetch(API_URL, {
		method: "post",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query }),
	});
	const { data } = await response.json();
	return data;
}

// キャッシュ
let cachedAllPosts: Post[] | null = null;
let cachedAllPostsMeta: PostMeta[] | null = null;
let cachedCategories: Category[] | null = null;
let cachedArchives: string[] | null = null;
let cachedAllPostsByCategory: CategoryWithPosts[] | null = null;

export async function getAllPosts(): Promise<Post[]> {
	if (cachedAllPosts) return cachedAllPosts;
	const data = await gql(`
		query {
			posts(first: 1000) {
				nodes {
					id title date modified uri slug content acfEmoji
					categories { nodes { name } }
					tags { nodes { name } }
				}
			}
		}
	`);
	cachedAllPosts = data.posts.nodes;
	return cachedAllPosts!;
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
	if (cachedAllPostsMeta) return cachedAllPostsMeta;
	const data = await gql(`
		query {
			posts(first: 1000) {
				nodes {
					id title date modified uri slug acfEmoji
					categories { nodes { name } }
					tags { nodes { name } }
				}
			}
		}
	`);
	cachedAllPostsMeta = data.posts.nodes;
	return cachedAllPostsMeta!;
}

export async function getLatestPosts(): Promise<{ posts: { nodes: PostMeta[] } }> {
	const data = await gql(`
		query {
			posts(first: 5) {
				nodes {
					id title date modified uri slug acfEmoji
					categories { nodes { name } }
					tags { nodes { name } }
				}
			}
		}
	`);
	return data;
}

export async function getCategories(): Promise<Category[]> {
	if (cachedCategories) return cachedCategories;
	const data = await gql(`
		query {
			categories {
				nodes { name slug }
			}
		}
	`);
	cachedCategories = data.categories.nodes;
	return cachedCategories!;
}

export async function getArchives(): Promise<string[]> {
	if (cachedArchives) return cachedArchives;
	const data = await gql(`
		query {
			posts(first: 10000) {
				nodes { date }
			}
		}
	`);
	const archives: string[] = [];
	for (const post of data.posts.nodes) {
		const date = new Date(post.date);
		const slug = `${date.getFullYear()}/${date.getMonth() + 1}`;
		if (!archives.includes(slug)) archives.push(slug);
	}
	cachedArchives = archives;
	return cachedArchives;
}

export async function getAllPostsByCategory(): Promise<CategoryWithPosts[]> {
	if (cachedAllPostsByCategory) return cachedAllPostsByCategory;
	const data = await gql(`
		query {
			categories {
				nodes {
					id name slug
					posts(first: 10000) {
						nodes {
							id title date modified uri slug acfEmoji
							categories { nodes { name uri } }
							tags { nodes { name } }
						}
					}
				}
			}
		}
	`);
	cachedAllPostsByCategory = data.categories.nodes;
	return cachedAllPostsByCategory!;
}

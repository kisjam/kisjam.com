import rss from "@astrojs/rss";
import { getSortedPosts, postUri } from "../utils/posts";

export async function GET(context) {
	const posts = await getSortedPosts();
	return rss({
		title: "kisjam.com",
		description: "Hello, I am Akihiro Takaoka, a freelance front-end engineer.",
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.excerpt,
			link: postUri(post),
		})),
	});
}

import { c as createAstro, a as createComponent, r as renderTemplate, b as renderHead, d as addAttribute } from '../astro.bbd08310.mjs';
import 'html-escaper';

async function getAllPosts() {
	const response = await fetch("https://blog.kisjam.com/graphql", {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
          query: `query GetAllUris {
            posts(first: 10000) {
              nodes {
                id
				title
				date
				uri
				slug
				excerpt
				content
				categories {
					nodes {
						name
						uri
					}
				}
				featuredImage {
					node {
					srcSet
					sourceUrl
					altText
					mediaDetails {
						height
						width
					}
					}
				}
              }
            }
          }
          `
      })
  });
  const { data } = await response.json();

  return data.posts.nodes;
}

async function getAllPostsPath() {
	const response = await fetch("https://blog.kisjam.com/graphql", {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
          query: `query GetAllUris {
            posts(first: 10000) {
              nodes {
                id
				title
				date
				uri
				slug
				excerpt
				content
				categories {
					nodes {
						name
						uri
					}
				}
				featuredImage {
					node {
					srcSet
					sourceUrl
					altText
					mediaDetails {
						height
						width
					}
					}
				}
              }
            }
          }
          `
      })
  });
  const { data } = await response.json();
  const posts = Object.values(data)
    .reduce(function(acc, currentValue){
	  return acc.concat(currentValue.nodes)
	}, [])
	.filter(node => node.uri !== null)
	.map(node => {
		return {
			params: {
				slug: node.slug
			},
			props: {
				post: node
			}
		}
	});

  return posts;
}

const $$Astro = createAstro("https://kisjam.com");
async function getStaticPaths({ paginate }) {
  const allPosts = await getAllPosts();
  const page = paginate(allPosts, {
    pageSize: 10
  });
  console.log(page);
  return;
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { page } = Astro2.props;
  Astro2.params;
  return renderTemplate`<html lang="ja">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="format-detection" content="telephone=no">
		<meta name="keywords" content="">
		<meta name="description" content="">
		<meta property="og:title" content="">
		<meta property="og:description" content="">
		<meta property="og:image" content="">
		<meta property="og:type" content="">
		<meta property="og:url" content="">
		<meta property="og:locate" content="ja_JP">
		<meta property="og:site_name" content="">
		<title>kisjam.com</title>
	${renderHead()}</head>
	<body>
		<div class="site-container">
			<header class="site-header">
				<h1>
					<a href="/">
						<span><img src="/assets/images/common/logo.svg" alt="" width="60" height="60"></span>
						<span>kisjam.com</span>
					</a>
				</h1>
				<nav>
					<ul>
						<li><a href="/about/">About</a></li>
						<li><a href="/contact/">Contact</a></li>
					</ul>
				</nav>
			</header>
			<main class="site-main">
				<div class="two-columns">
					<div class="two-columns__main">
						<h1>${page.currentPage}ページ</h1>
						<ul>
							${page.data.map((post) => renderTemplate`<li>${post.title}</li>`)}
						</ul>
						${page.url.prev ? renderTemplate`<a${addAttribute(page.url.prev, "href")}>Previous</a>` : null}
						${page.url.next ? renderTemplate`<a${addAttribute(page.url.next, "href")}>Next</a>` : null}
					</div>
					<div class="two-columns__sidebar"></div>
				</div>
			</main>
			<footer class="site-footer">
				<p><small>© kisjam.com</small></p>
			</footer>
		</div>
	</body></html>`;
}, "/Users/kisjam/GnomeFactory Dropbox/takaoka akihiro/\u500B\u4EBA/htdocs/kisjam.com/src/pages/blog/[...page].astro", void 0);

const $$file = "/Users/kisjam/GnomeFactory Dropbox/takaoka akihiro/個人/htdocs/kisjam.com/src/pages/blog/[...page].astro";
const $$url = "/blog/[...page]";

const ____page_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$,
	file: $$file,
	getStaticPaths,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { ____page_ as _, getAllPostsPath as g };

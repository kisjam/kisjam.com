import { c as createAstro, a as createComponent, r as renderTemplate, b as renderHead } from '../astro.bbd08310.mjs';
import 'html-escaper';
import { g as getAllPostsPath } from './_...page_.astro.c819ade0.mjs';

const $$Astro = createAstro("https://kisjam.com");
async function getStaticPaths() {
  return getAllPostsPath();
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { post } = Astro2.props;
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
						<article>
							<header>
								<h1>${post.title}</h1>
								<p>${post.date}</p>
							</header>
						</article>
					</div>
					<div class="two-columns__sidebar"></div>
				</div>
			</main>
			<footer class="site-footer">
				<p><small>© kisjam.com</small></p>
			</footer>
		</div>
	</body></html>`;
}, "/Users/kisjam/GnomeFactory Dropbox/takaoka akihiro/\u500B\u4EBA/htdocs/kisjam.com/src/pages/blog/[slug].astro", void 0);

const $$file = "/Users/kisjam/GnomeFactory Dropbox/takaoka akihiro/個人/htdocs/kisjam.com/src/pages/blog/[slug].astro";
const $$url = "/blog/[slug]";

export { $$slug as default, $$file as file, getStaticPaths, $$url as url };

/**
 * WordPress(WPGraphQL) → Markdown 完全移行スクリプト
 *
 *  - 公開済みの全記事を取得し、本文HTMLをMarkdownへ変換
 *  - 記事内の画像を public/uploads/ にローカル取り込みし、参照を /uploads/... に書き換え
 *  - 各種埋め込み(YouTube/Twitter/oEmbed等)はWP固有の壊れるマークアップを捨て、URLリンクへ変換
 *  - src/content/blog/<slug>.md として frontmatter 付きで出力
 *
 *  使い方:  WORDPRESS_API_URL=... node scripts/migrate-wp.mjs
 *           (未指定時は .env を読まないので環境変数で渡すか、下の DEFAULT_API を使う)
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/content/blog");
const PUBLIC_DIR = join(ROOT, "public");

// .env から WORDPRESS_API_URL を拾う（簡易パース）
async function resolveApiUrl() {
	if (process.env.WORDPRESS_API_URL) return process.env.WORDPRESS_API_URL.trim();
	try {
		const env = await readFile(join(ROOT, ".env"), "utf8");
		const m = env.match(/WORDPRESS_API_URL\s*=\s*(.+)/);
		if (m) return m[1].trim();
	} catch {}
	throw new Error("WORDPRESS_API_URL が見つかりません（環境変数 or .env で指定してください）");
}

// ---- GraphQL ---------------------------------------------------------------
async function gql(API_URL, query) {
	const res = await fetch(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query }),
	});
	const json = await res.json();
	if (json.errors) throw new Error("GraphQL error: " + JSON.stringify(json.errors));
	return json.data;
}

async function fetchAllPosts(API_URL) {
	const data = await gql(
		API_URL,
		`query {
			posts(first: 1000, where: { status: PUBLISH }) {
				nodes {
					databaseId title slug date modified uri acfEmoji content excerpt
					categories { nodes { name slug } }
					tags { nodes { name slug } }
				}
			}
		}`
	);
	return data.posts.nodes;
}

// ---- 画像のローカルパス算出 -------------------------------------------------
// https://blog.kisjam.com/wp-content/uploads/2025/03/foo.jpg -> /uploads/2025/03/foo.jpg
function toLocalImagePath(remoteUrl) {
	try {
		const u = new URL(remoteUrl);
		const idx = u.pathname.indexOf("/wp-content/uploads/");
		if (idx !== -1) {
			return "/uploads/" + decodeURIComponent(u.pathname.slice(idx + "/wp-content/uploads/".length));
		}
		// uploads 配下でない画像はホスト名込みで退避
		return "/uploads/_external/" + u.host + decodeURIComponent(u.pathname);
	} catch {
		return null;
	}
}

// URLとして安全な形（日本語ファイル名対策）
function encodePath(localPath) {
	return localPath.split("/").map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg))).join("/");
}

async function downloadImage(remoteUrl, localPath) {
	const dest = join(PUBLIC_DIR, localPath.replace(/^\//, ""));
	if (existsSync(dest)) return true; // 既に取得済み
	const res = await fetch(remoteUrl);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	await mkdir(dirname(dest), { recursive: true });
	await writeFile(dest, buf);
	return true;
}

// ---- Turndown 設定 ----------------------------------------------------------
function createTurndown(imageMap, droppedSrcs, stats) {
	const td = new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced",
		bulletListMarker: "-",
		emDelimiter: "*",
	});
	td.use(gfm);

	// wp-block-preformatted (<pre> に <code> が無い) を fenced code block 化。
	// 放置すると中の <VirtualHost> 等がデコードされ生HTML扱いになり描画が壊れる。
	td.addRule("wpPreformatted", {
		filter: (node) => node.nodeName === "PRE" && !node.querySelector("code"),
		replacement: (_content, node) => {
			const text = (node.textContent || "").replace(/\n+$/, "");
			return `\n\n\`\`\`\n${text}\n\`\`\`\n\n`;
		},
	});

	// 取得できた画像→ローカルパス / DL失敗(404等)→null(画像記法ごと削除)
	const mapSrc = (src) => {
		if (!src) return src;
		if (droppedSrcs.has(src)) return null;
		const local = imageMap.get(src);
		return local ? encodePath(local) : src;
	};

	// YouTube embed URL を watch URL に正規化
	const normalizeUrl = (url) => {
		if (!url) return url;
		const m = url.match(/youtube\.com\/embed\/([\w-]+)/);
		if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
		return url;
	};

	// 埋め込み figure → リンク化
	td.addRule("wpEmbed", {
		filter: (node) =>
			node.nodeName === "FIGURE" && /wp-block-embed/.test(node.getAttribute("class") || ""),
		replacement: (_content, node) => {
			const iframe = node.querySelector("iframe");
			const anchor = node.querySelector("a[href]");
			let url =
				(iframe && iframe.getAttribute("src")) ||
				(anchor && anchor.getAttribute("href")) ||
				(node.textContent || "").trim().split(/\s+/)[0];
			url = normalizeUrl((url || "").trim());
			if (!url) return "";
			stats.embeds++;
			return `\n\n<${url}>\n\n`;
		},
	});

	// 画像figure(キャプション対応)。ギャラリー(直下が図)は素通しして内側で個別処理
	td.addRule("wpImageFigure", {
		filter: (node) =>
			node.nodeName === "FIGURE" &&
			Array.from(node.childNodes).some((c) => c.nodeName === "IMG"),
		replacement: (_content, node) => {
			const img = Array.from(node.childNodes).find((c) => c.nodeName === "IMG");
			const src = mapSrc(img.getAttribute("src"));
			if (!src) return ""; // 404画像は削除
			const alt = (img.getAttribute("alt") || "").trim();
			const cap = node.querySelector("figcaption");
			const caption = cap ? cap.textContent.trim() : "";
			let out = `![${alt}](${src})`;
			if (caption) out += `\n\n*${caption}*`;
			return `\n\n${out}\n\n`;
		},
	});

	// 単独img / ギャラリー内img
	td.addRule("wpImage", {
		filter: "img",
		replacement: (_content, node) => {
			const src = mapSrc(node.getAttribute("src"));
			if (!src) return ""; // 404画像は削除
			const alt = (node.getAttribute("alt") || "").trim();
			return `![${alt}](${src})`;
		},
	});

	return td;
}

// ---- frontmatter ------------------------------------------------------------
const q = (s) => '"' + String(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

// 変換後Markdown本文から綺麗なexcerptを生成（WPの二重エンコードなexcerptは使わない）
function bodyToExcerpt(body) {
	const text = (body || "")
		.replace(/```[\s\S]*?```/g, " ") // コードブロック
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 画像
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク→テキスト
		.replace(/<[^>]+>/g, " ") // 生HTML
		.replace(/[#>*_`~]/g, " ") // 記号
		.replace(/\s+/g, " ")
		.trim();
	if (text.length <= 120) return text;
	return text.slice(0, 120).trim() + "…";
}

// WP日時(オフセット無し)にJSTを付与。UTCビルド環境で日付がズレるのを防ぐ
function withTz(dt) {
	if (!dt) return dt;
	return /[Zz]|[+-]\d{2}:?\d{2}$/.test(dt) ? dt : dt + "+09:00";
}

// 本文中の内部記事リンク(WPドメイン)を相対 /blog/<slug>/ に書き換える。
// 既知スラッグに一致するものだけ対象（wp-json等の例示URL・外部リンクは温存）。
function rewriteInternalLinks(body, slugSet) {
	const tail = "(?:embed[^>)\\s]*)?"; // /embed/#?secret=... 等を吸収
	const known = (slug) => slugSet.has(slug);
	// 1) オートリンク <URL> → 正しいMarkdownリンクに
	body = body.replace(
		new RegExp(`<https?://(?:blog|www)\\.kisjam\\.com/blog/([a-z0-9_-]+)/${tail}>`, "gi"),
		(m, slug) => (known(slug) ? `[/blog/${slug}/](/blog/${slug}/)` : m)
	);
	// 2) Markdownリンクのターゲット ](URL) → 相対に
	body = body.replace(
		new RegExp(`\\]\\(https?://(?:blog|www)\\.kisjam\\.com/blog/([a-z0-9_-]+)/${tail}\\)`, "gi"),
		(m, slug) => (known(slug) ? `](/blog/${slug}/)` : m)
	);
	// 3) 残った裸URL → 正しいMarkdownリンクに
	body = body.replace(
		new RegExp(`https?://(?:blog|www)\\.kisjam\\.com/blog/([a-z0-9_-]+)/${tail}`, "gi"),
		(m, slug) => (known(slug) ? `[/blog/${slug}/](/blog/${slug}/)` : m)
	);
	return body;
}

// 見出しテキスト内の <tag> をエスケープ（描画時にHTMLタグ扱いされて消えるのを防ぐ）
function escapeHtmlInHeadings(body) {
	return body
		.split("\n")
		.map((line) => {
			if (!/^#{1,6}\s/.test(line) || /<https?:/i.test(line)) return line;
			return line.replace(/<(\/?[a-zA-Z][a-zA-Z0-9]*)>/g, "\\<$1\\>");
		})
		.join("\n");
}

function buildFrontmatter(post, excerpt) {
	const lines = ["---"];
	lines.push(`title: ${q(post.title)}`);
	lines.push(`slug: ${q(post.slug)}`);
	lines.push(`date: ${q(withTz(post.date))}`);
	lines.push(`modified: ${q(withTz(post.modified))}`);
	lines.push(`emoji: ${q(post.acfEmoji || "")}`);
	lines.push(`excerpt: ${q(excerpt)}`);

	const cats = post.categories?.nodes || [];
	if (cats.length) {
		lines.push("categories:");
		for (const c of cats) lines.push(`  - name: ${q(c.name)}\n    slug: ${q(c.slug)}`);
	} else {
		lines.push("categories: []");
	}

	const tags = post.tags?.nodes || [];
	if (tags.length) {
		lines.push("tags:");
		for (const t of tags) lines.push(`  - name: ${q(t.name)}\n    slug: ${q(t.slug)}`);
	} else {
		lines.push("tags: []");
	}

	lines.push("---");
	return lines.join("\n");
}

// ---- main -------------------------------------------------------------------
async function main() {
	const API_URL = await resolveApiUrl();
	console.log("API:", API_URL);
	await mkdir(OUT_DIR, { recursive: true });

	const posts = await fetchAllPosts(API_URL);
	console.log(`取得: ${posts.length} 記事`);

	// 1) 画像URLを全収集 → ダウンロード → マップ作成
	const imageMap = new Map(); // remoteUrl -> localPath
	const droppedSrcs = new Set(); // DL失敗(404等) → 本文から削除
	const reImg = /<img[^>]*\bsrc=["']([^"']+)["']/gi;
	const allSrcs = new Set();
	for (const p of posts) {
		let m;
		while ((m = reImg.exec(p.content || ""))) allSrcs.add(m[1]);
	}
	console.log(`画像: ${allSrcs.size} 件をダウンロード`);
	let imgOk = 0,
		imgFail = 0;
	for (const src of allSrcs) {
		const local = toLocalImagePath(src);
		if (!local) {
			console.warn("  パス算出不可 → 削除:", src);
			droppedSrcs.add(src);
			imgFail++;
			continue;
		}
		try {
			await downloadImage(src, local);
			imageMap.set(src, local);
			imgOk++;
		} catch (e) {
			console.warn(`  DL失敗(${e.message}) → 本文から削除:`, src);
			droppedSrcs.add(src);
			imgFail++;
		}
	}

	// 2) 本文変換 → 書き出し
	const stats = { embeds: 0 };
	const td = createTurndown(imageMap, droppedSrcs, stats);
	const slugSet = new Set(posts.map((p) => p.slug));
	let written = 0,
		shortBodies = 0;
	const slugSeen = new Set();
	for (const post of posts) {
		let slug = post.slug;
		if (slugSeen.has(slug)) {
			slug = `${slug}-${post.databaseId}`;
			console.warn("  slug重複 → 改名:", post.slug, "->", slug);
		}
		slugSeen.add(slug);

		let body = td.turndown(post.content || "").trim();
		body = rewriteInternalLinks(body, slugSet);
		body = escapeHtmlInHeadings(body);
		if (body.replace(/\s/g, "").length < 20) {
			console.warn(`  本文が極端に短い(${body.length}字):`, slug);
			shortBodies++;
		}
		const fm = buildFrontmatter(post, bodyToExcerpt(body));
		const md = `${fm}\n\n${body}\n`;
		await writeFile(join(OUT_DIR, `${slug}.md`), md, "utf8");
		written++;
	}

	console.log("\n=== 完了 ===");
	console.log(`記事:   ${written} 件 → src/content/blog/`);
	console.log(`画像:   成功 ${imgOk} / 失敗 ${imgFail} → public/uploads/`);
	console.log(`埋め込み: ${stats.embeds} 件をリンク変換`);
	if (shortBodies) console.log(`⚠ 本文が短い記事: ${shortBodies} 件（要確認）`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

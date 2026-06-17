# kisjam.com

[Astro](https://astro.build/) 製のポートフォリオ / ブログサイト（静的サイト生成）。
記事は `src/content/blog/` の Markdown（Astro Content Collections）で管理。

## 開発

```sh
npm install
npm run dev      # 開発サーバー
npm run build    # astro build && pagefind --site dist → dist/ に出力
```

- Node: `.node-version`（24.16.0）
- 検索: [Pagefind](https://pagefind.app/)（ビルド時に `dist/pagefind/` を生成）

## デプロイ

**Cloudflare Pages の Git連携ビルド**。`main` への push を Cloudflare が検知し、
`npm run build` を実行して `dist/` を自動公開する（wrangler / GitHub Actions 不要）。

- Build command: `npm run build`
- Output directory: `dist`
- `public/_headers` でキャッシュ／セキュリティヘッダを指定
- `kisjam.com`(apex) は Cloudflare Pages、`blog.kisjam.com` 等サブドメインは別ホスト

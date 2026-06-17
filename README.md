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

**Cloudflare Workers (Static Assets) の Git連携ビルド**。`main` への push を Cloudflare が
検知し、`npm run build` を実行して `dist/` を自動公開する。ローカルで wrangler を叩く必要はない。

- 設定: `wrangler.jsonc`（`assets.directory: ./dist`）
- Build command: `npm run build` / Deploy command: `npx wrangler deploy`（Cloudflare側で自動実行）
- `public/_headers` でキャッシュ／セキュリティヘッダを指定
- `kisjam.com`(apex) は Cloudflare、`blog.kisjam.com` 等サブドメインは別ホスト
- 静的アセット配信は無料・無制限（Workers無料枠の10万req/日にはカウントされない）

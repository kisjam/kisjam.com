---
title: "WordPress Tips"
slug: "wordpress-tips"
date: "2017-12-10T18:13:40+09:00"
modified: "2024-02-02T01:17:55+09:00"
emoji: "📕"
excerpt: "特定の投稿タイプを対象に検索する form要素内に下記のinput要素を挿入すると、カスタム投稿タイプ「report」を対象とした検索になります。 ログイン時のみコンテンツを表示する ログアウトURLの出力"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

## 特定の投稿タイプを対象に検索する

form要素内に下記のinput要素を挿入すると、カスタム投稿タイプ「report」を対象とした検索になります。

```
<input type="hidden" name="post_type[]" value="report" />
```

## ログイン時のみコンテンツを表示する

```
<?php if ( is_user_logged_in() ): ?>
// ユーザーがログインしている場合のみ表示されるコンテンツ
<?php endif; ?>
```

## ログアウトURLの出力

```
<a href="<?php echo wp_logout_url(); ?>">ログアウト</a>
```

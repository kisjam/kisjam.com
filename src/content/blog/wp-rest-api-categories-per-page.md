---
title: "WP REST APIでカテゴリーを全件取得できない"
slug: "wp-rest-api-categories-per-page"
date: "2017-07-09T03:56:53+09:00"
modified: "2024-02-02T01:28:31+09:00"
emoji: "🐥"
excerpt: "WP REST APIでカテゴリーを取得する時一部しか返って来なかったので気になって調べてみました。 どうやら1回の取得件数は10件なので注意が必要です。 https://www.kisjam.com/blog/wp-json/wp/v2/…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

WP REST APIでカテゴリーを取得する時一部しか返って来なかったので気になって調べてみました。

どうやら1回の取得件数は10件なので注意が必要です。

https://www.kisjam.com/blog/wp-json/wp/v2/categories/  
※こちらから確認できます。

https://www.kisjam.com/blog/wp-json/wp/v2/categories/?per\_page=100

per\_pageが1〜100の範囲で設定できるので適当な値を入れておきましょう。

> [http://ja.wp-api.org/reference/categories/](http://ja.wp-api.org/reference/categories/)

---
title: "3回以上ググったjavascriptメモ"
slug: "javascript-memo"
date: "2017-10-18T14:46:18+09:00"
modified: "2024-02-02T01:25:50+09:00"
emoji: "🐥"
excerpt: "$(‘.className’)的なやつ .scrollTop()的なやつ .height()的なやつ"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

$(‘.className’)的なやつ

```
element = document.querySelector(selector); //マッチした最初の要素
elementList = document.querySelectorAll(selectors);　//マッチした要素すべて
```

.scrollTop()的なやつ

```
var _wy = document.documentElement.scrollTop || document.body.scrollTop
```

.height()的なやつ

```
_wh = window.innerHeight;
```

> <https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference>

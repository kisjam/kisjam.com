---
title: "見出しに水平線を使う方法"
slug: "howto-css-horizontal-line"
date: "2015-01-28T06:40:39+09:00"
modified: "2024-02-02T00:42:39+09:00"
emoji: "🐣"
excerpt: "IE8まで確認しました。 下記最小限。 ただこれだと複数行には対応してないので注意"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

IE8まで確認しました。

下記最小限。

```
h1 {    border-top: 1px #000 solid;    font-size: 22px;}h1 span {    background: #fff;    padding: 0 20px;    position: relative;    top: -15px;}
```

ただこれだと複数行には対応してないので注意

---
title: "jQueryの.onでreadyが動かない"
slug: "on-ready-dont-work-jquery"
date: "2016-03-02T21:05:09+09:00"
modified: "2024-02-02T00:48:29+09:00"
emoji: "🐣"
excerpt: "jQueryの.onでイベントを登録する際にいつもの感じでreadyイベント（DOM操作の準備が出来たタイミングで発火）を登録したら動かず。 DOMContentLoaded で登録したら動きました。 動かない 動く"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

jQueryの.onでイベントを登録する際にいつもの感じでreadyイベント（DOM操作の準備が出来たタイミングで発火）を登録したら動かず。

`DOMContentLoaded`で登録したら動きました。

## 動かない

```
$('hoge').on('ready', function() {...})
```

## 動く

```
$('hoge').on('DOMContentLoaded', function() {...})
```

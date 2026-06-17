---
title: "querySelectorAllで取得したオブジェクトをeachで処理する方法"
slug: "how-to-queryselectorall-each"
date: "2019-01-14T08:53:55+09:00"
modified: "2024-02-02T01:11:59+09:00"
emoji: "🐣"
excerpt: "JavaScriptのquerySelectorAllで帰ってくる値が配列じゃないのでArray.prototype.forEachが使えません。 下記のように配列のprototype.forEachを呼び出してあげるやつよく使います。"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

JavaScriptのquerySelectorAllで帰ってくる値が配列じゃないのでArray.prototype.forEachが使えません。  
下記のように配列のprototype.forEachを呼び出してあげるやつよく使います。

```
let items = document.querySelectorAll('.foo');
Array.prototype.forEach.call(items, function(item) {
　　console.log(item);
});
```

---
title: "addEventListenerで登録したイベントを1回だけ発火させて削除する"
slug: "addeventlistener-once"
date: "2018-02-02T12:14:27+09:00"
modified: "2024-02-02T01:15:35+09:00"
emoji: "🐥"
excerpt: "上記の言い方であってるかわかりませんが一回だけイベント動いて欲しい時ありますよね、スクロールで任意の位置になったときに要素動かしたりとかボタンクリックしたら一回だけ発動したいとか。 jQueryだと.oneが便利でしたがjavascript…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

上記の言い方であってるかわかりませんが一回だけイベント動いて欲しい時ありますよね、スクロールで任意の位置になったときに要素動かしたりとかボタンクリックしたら一回だけ発動したいとか。

jQueryだと.oneが便利でしたがjavascriptだとどうやって書くんやと思った次第です。

まず、addEventListenerにオプションが用意されています。

> once: listener が追加後にたかだか1回しか実行されないことを Boolean 値で指定します。true を指定すると、listener は一度実行された時に自動的に削除されます。
> 
> <https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener>

```
window.addEventListener('click', function () {
  // hogehoge
}, {
  once: true
})
```

こんな感じです。短くかけるのがとても良いのですがIEが対応していません・・・

下記が対応版。

```
window.addEventListener('click', function clickEvent(event) {
  //hogehoge
  event.currentTarget.removeEventListener(event.type, clickEvent);
});
```

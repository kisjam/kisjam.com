---
title: "classListを使ってクラスの追加と削除をする"
slug: "add-and-remove-css-class-with-classlist"
date: "2017-07-22T16:14:20+09:00"
modified: "2024-02-02T01:27:42+09:00"
emoji: "🐥"
excerpt: "JavaScriptでクラスの追加削除をする時、今まではjQueryならaddClass()、生で書く時はclassName()で追加と削除をしていましたが便利なclassListというのがあるみたいです、IE10以上なら大体動きます。 追…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

JavaScriptでクラスの追加削除をする時、今まではjQueryならaddClass()、生で書く時はclassName()で追加と削除をしていましたが便利なclassListというのがあるみたいです、IE10以上なら大体動きます。

追加や削除が容易にできる他、クラスの切り替え（toggle）や特定のクラスを含むかどうか判定できるhasClassっぽいことも出来ます。

```
let logo = document.getElementsByClassName('header__logo');
logo[0].classList.add('header__logo--loaded'); //クラスの追加
```

-   add: クラスの追加、jQueryでいうところのaddClass()
-   remove: クラスの削除、jQueryでいうところのremoveClass()
-   toggle: クラスの切替、jQueryでいうところのtoggleClass()
-   contains: 特定のクラスを含むか否かの確認、jQueryでいうところのhasClass()

「.header\_\_logo」が「.header\_\_logo–loaded」を含むかどうか判定するサンプル

```
let logo = document.getElementsByClassName('header__logo');
logo[0].classList.add('header__logo--loaded');

if (logo[0].classList.contains('header__logo--loaded')) {//.header__logo--loadedが含まれていればtrue.
  console.log('クラス付与済み');
} else {
  console.log('クラス無い');
}
```

> <https://developer.mozilla.org/ja/docs/Web/API/Element/classList>

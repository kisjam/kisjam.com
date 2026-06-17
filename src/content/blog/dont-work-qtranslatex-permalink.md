---
title: "qTranslateXが勝手にリダイレクトしリンクが機能しない場合"
slug: "dont-work-qtranslatex-permalink"
date: "2015-09-28T07:05:10+09:00"
modified: "2024-02-02T00:44:49+09:00"
emoji: "🔧"
excerpt: "hoge.com/ – 日本語サイト hoge.com/en/ 英語サイト で運用していました。 mqTranslateからqTranslateXに移行したのですが、日本語サイトへのリンクが上手く機能せずに英語サイトへリダイレクトしてしまう…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

hoge.com/ – 日本語サイト  
hoge.com/en/ 英語サイト

で運用していました。  
mqTranslateからqTranslateXに移行したのですが、日本語サイトへのリンクが上手く機能せずに英語サイトへリダイレクトしてしまう現象にあたりました。

Cookie等が上手く機能していないかとおもいきや、qTranslateになってからはデフォルトの言語へのリンクの場合も言語ディレクトリを参照する必要がありました。

## Before

```
<a href=“/”>日本語サイト（デフォルトの言語）へのリンク</a>
```

## After

```
<a href=“/ja/”>日本語サイト（デフォルトの言語）へのリンク</a>
```

これで上手くリンクが機能するようになりました。

---
title: "nodenv で Node.js の任意のバージョンが見当たらない時"
slug: "notfound-version-by-nodejs-with-nodenv"
date: "2023-09-23T02:47:19+09:00"
modified: "2024-02-02T01:08:59+09:00"
emoji: "🐥"
excerpt: "でインストール可能なNode.jsのバージョンを表示できますが、新しいバージョンの場合見当たらないことがあります。 リストが古くなっている可能性があり、nodenv本体のアップグレードが必要です、下記コマンドで更新できます（Homebrew…"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

```
$ nodenv install --list
```

でインストール可能なNode.jsのバージョンを表示できますが、新しいバージョンの場合見当たらないことがあります。

リストが古くなっている可能性があり、nodenv本体のアップグレードが必要です、下記コマンドで更新できます（Homebrewでnodenvをインストールしている場合）

```
$ brew upgrade nodenv node-build
```

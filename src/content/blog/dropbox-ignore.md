---
title: "Dropboxでnode_modulesを同期対象から外す"
slug: "dropbox-ignore"
date: "2023-07-04T03:54:36+09:00"
modified: "2024-02-02T01:09:43+09:00"
emoji: "🗃"
excerpt: "Dropboxの同期処理でmacbookが定期的に激重になる原因として、雑に同期していた案件ごとのnode\\ modulesが怪しいと思ったのでこいつらを同期の対象から外せないかな〜と思った次第です。 要は.gitignore的な感じでこの…"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

Dropboxの同期処理でmacbookが定期的に激重になる原因として、雑に同期していた案件ごとのnode\_modulesが怪しいと思ったのでこいつらを同期の対象から外せないかな〜と思った次第です。

要は.gitignore的な感じでこのファイル・フォルダ名は同期しないでね！ってしたかったので調べました、その備忘録。

ざっくり調べた感じ、対象ファイル・フォルダを

-   エイリアス設定して別ディレクトリに置く
-   カスタム属性（com.dropbox.ignored）を設定する

の2択でした。  
前者は、今回除外したいフォルダが既に多い&定期的に増えていく手前ちょっと煩雑になりそうだったので後者を採用しました。

既存のnode\_modulesに`com.dropbox.ignored 1`を設定してきます。不安なので一旦対象ファイルが抽出できているか確認するためにxattrを除いた状態で実行します。下記を実行するとDropbox以下の`/node_modules/`がリストアップされます。

```
find "$HOME/Dropbox/" -type d | grep 'node_modules$' | grep -v '/node_modules/' 
```

問題なければ下記のコードでカスタム属性を設定していきます。

```
find "$HOME/Dropbox/" -type d | grep 'node_modules$' | grep -v '/node_modules/' | xargs -I {} -t -L 1 xattr -w com.dropbox.ignored 1 "{}"
```

下記はプロジェクトが増えた場合の単発処理

```
xattr -w com.dropbox.ignored 1 "./node_modules"
```

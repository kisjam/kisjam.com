---
title: "Gitにプッシュ済みのファイルを.gitignoreする"
slug: "gitignore-a-file"
date: "2024-02-14T12:53:42+09:00"
modified: "2024-03-09T01:33:14+09:00"
emoji: "🚧"
excerpt: "例）XXX（dist/ , node\\ modules/ 等）をプッシュしちゃった、でもGitで管理しなくて良いファイルだった .gitignoreに追記 Git上から削除（手元のファイルは削除しない） -r が再帰的な削除、この場合は d…"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

例）XXX（dist/ , node\_modules/ 等）をプッシュしちゃった、でもGitで管理しなくて良いファイルだった

## .gitignoreに追記

```
# .gitignore

dist/
```

## Git上から削除（手元のファイルは削除しない）

```
$ git rm -r --cached dist/
```

`-r` が再帰的な削除、この場合は`dist/` だけではなく、以下のフォルダ・ファイルも削除

`--chached` がファイルは消さずにGitからのみ削除

## 上記変更をコミット・プッシュ！

ファイルは残っていて、Gitからは削除されていますね。この状態でコミットしてプッシュしました。

![](/uploads/2024/02/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88-2024-02-13-22.42.02.png)

解決しました。

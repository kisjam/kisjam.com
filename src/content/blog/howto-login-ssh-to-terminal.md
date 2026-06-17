---
title: "ターミナルからSSHでログイン"
slug: "howto-login-ssh-to-terminal"
date: "2014-11-05T06:05:00+09:00"
modified: "2024-02-02T01:00:38+09:00"
emoji: "🖥"
excerpt: "備忘録として。 vimでファイルを編集し更新する作業だったが、readonlyのため保存できなかったため、 上記で上書き可能、% は現在のファイルの意味でした。"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

備忘録として。

```
ssh -p ポート番号 アカウント名@ホスト
```

vimでファイルを編集し更新する作業だったが、readonlyのため保存できなかったため、

```
:w sudo tee %
```

上記で上書き可能、% は現在のファイルの意味でした。

---
title: "MAMP PRO でPHPを.html拡張子で実行したい"
slug: "run-php-on-mamp-pro"
date: "2024-08-17T11:46:08+09:00"
modified: "2026-03-09T11:26:15+09:00"
emoji: "🔰"
excerpt: "結論 Fast CGIでPHPが実行されていたのでApacheの設定に下記を加えました。 モジュール版じゃなかったっけ？"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

## 結論

Fast CGIでPHPが実行されていたのでApacheの設定に下記を加えました。

```
AddHandler php-fastcgi .html .htm
```

モジュール版じゃなかったっけ？

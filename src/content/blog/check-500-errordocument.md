---
title: "500 ErrorDocumentの表示確認"
slug: "check-500-errordocument"
date: "2025-07-28T16:29:38+09:00"
modified: "2026-03-09T11:25:04+09:00"
emoji: "😣"
excerpt: "LAMP環境（Zenlogic ビジネス100）で下記の設定を加えたものの、PHPのエラーだと恐らくApacheの処理は正常に完了しているタイミングでトリガーされず、動作確認に手こずったのでメモ /test.php にアクセスし、 /500…"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

LAMP環境（Zenlogic ビジネス100）で下記の設定を加えたものの、PHPのエラーだと恐らくApacheの処理は正常に完了しているタイミングでトリガーされず、動作確認に手こずったのでメモ

```
ErrorDocument 500 /500/

RewriteEngine On
RewriteRule ^test.php$ - [R=500,L]
```

`/test.php` にアクセスし、`/500/` の内容が表示されればOK

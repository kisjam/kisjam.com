---
title: "IEでオフィスファイル（.doc, .xls）をダウンロードする時にダイアログを表示させる。（または、ファイルを開くと画面が白くなる場合の解決策）"
slug: "whiteout-officefile"
date: "2015-11-17T09:43:13+09:00"
modified: "2024-02-02T00:46:21+09:00"
emoji: "🖥"
excerpt: "- IEでPDFやオフィスファイルのリンクを開く際に画面が白くなってしまう - 通知バーではなくダイアログボックスを表示させたい .htaccess内に下記コードを記述する。"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

-   IEでPDFやオフィスファイルのリンクを開く際に画面が白くなってしまう
-   通知バーではなくダイアログボックスを表示させたい

.htaccess内に下記コードを記述する。

```
<FilesMatch “.(docx|xls)$”>Header set Content-Disposition attachment</FilesMatch>
```

<https://hebikuzure.wordpress.com/2011/05/27/ie9-%e3%81%a7%e3%83%80%e3%82%a6%e3%83%b3%e3%83%ad%e3%83%bc%e3%83%89%e3%81%ae%e9%9a%9b%e3%81%ab%e9%80%9a%e7%9f%a5%e3%83%90%e3%83%bc%e3%81%a7%e3%81%af%e3%81%aa%e3%81%8f%e3%83%80%e3%82%a4%e3%82%a2/embed/#?secret=jcx3C0bSKh#?secret=ruCWRdrW23>

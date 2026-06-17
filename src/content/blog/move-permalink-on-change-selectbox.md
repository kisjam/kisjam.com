---
title: "select要素を選択すると任意のページに遷移するJavaScript"
slug: "move-permalink-on-change-selectbox"
date: "2014-12-03T02:32:00+09:00"
modified: "2024-02-02T00:42:04+09:00"
emoji: "🐣"
excerpt: "直書きVer. selectの内容が変わった時（onChange）にvalueのURLに遷移する。"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

直書きVer.

```
<select name=“navLang” id=“navLang” onchange=“location.href=this.value;”><option value=“https://kisjam.com/”>日本語</option><option value=“https://kisjam.com/en/”>English</option></select>
```

selectの内容が変わった時（onChange）にvalueのURLに遷移する。

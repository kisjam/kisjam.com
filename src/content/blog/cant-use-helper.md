---
title: "[Rails5] helperがViewで使えない時はサーバー再起動しましょう"
slug: "cant-use-helper"
date: "2017-08-29T14:23:56+09:00"
modified: "2024-02-02T01:27:03+09:00"
emoji: "🛤"
excerpt: "結論： serverを再起動したら直りました。 技術的なTipsでも何でもないですが小一時間調べ回って試行錯誤した挙句解決したので備忘録的に残しておきます。 RailsのViewでHelperを使用する場合は特にincludeする必要はあり…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

結論：**serverを再起動したら直りました。**

技術的なTipsでも何でもないですが小一時間調べ回って試行錯誤した挙句解決したので備忘録的に残しておきます。

RailsのViewでHelperを使用する場合は特にincludeする必要はありません。controllerやModelで使用する場合には読み込む必要がありますが今回はそもそもViewで使っているだけなのに「 undefined local variable or method…」とエラーが出てしまう人向けです。

```
module ApplicationHelper
  def hoge
  end
end
```

```
<%= hoge %>
```

こんな最小限の構成で動かなくてもしかしてincludeされてないのか？！と色々勘ぐりましたが今日はもう寝ようと諦めたところで直りました。

---
title: "LINEスタンプページへのアクセスを測定する"
slug: "analyze-access-to-line-stickers"
date: "2017-05-24T19:54:16+09:00"
modified: "2024-02-02T01:35:15+09:00"
emoji: "📈"
excerpt: "LINEスタンプはどれだけ売れたかはわかるのですが - 自分のページのアクセス数 - 流入元（Twitter/ Facebook/ Instagram/ etc…） はわかりません。 各SNS毎にインサイト（アクセス解析）が付いていますが投…"
categories:
  - name: "LINEスタンプ"
    slug: "line-stickers"
tags: []
---

LINEスタンプはどれだけ売れたかはわかるのですが

-   自分のページのアクセス数
-   流入元（Twitter/ Facebook/ Instagram/ etc…）

はわかりません。  
各SNS毎にインサイト（アクセス解析）が付いていますが投稿やプロフィールなどにスタンプページのURLを掲載しても具体的なアクセス数は取ることが出来ません。

特にどの媒体からのアクセスが多いかは気になるところです、計測してみましょう。といってもスタンプページが外部サイトである以上とれる数値は限られています。

今回は

-   各流入元（Twitter・Instagram等）からどれくらいアクセスがあるのか

を計測したいと思います。

ジャンプページを自サイトに用意しました、中身はmeta refreshとgoogle analyticsのみのシンプルなページです。読み込み1秒後にスタンプページに遷移します。

[https://www.kisjam.com/line-stickers/](https://www.kisjam.com/line-stickers/)

```
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>LINE STOREに移動中...</title>
<script>
// ここにGoogle analyticsのコードをいれる
</script>
<meta http-equiv="refresh" content="1;URL=（ここにスタンプページのURLを入れる）">
</head>
<body>Now loading...（移動しない場合は<a href="（ここにスタンプページのURLを入れる）">こちら</a>をクリック）</body>
</html>
```

SNS等に今までスタンプページを貼っていましたが一旦この自前のページを経由させて後はAnalyticsに計測してもらいます。

これでどれだけの人がこのページを経由してスタンプページに行ったか、それはどこから来たか、がわかります。

LINE STOREからの訪問や、他ユーザーからアクセスなどは測ることが出来ませんが少なくとも自分が運用しているSNSアカウントのつぶやきやプロフィールに掲載したアドレスからの流入は計測でき、どのSNSやメディアが効果的か把握することができます。

全てのアクセスを網羅することは出来ませんがやっておいて損はないでしょう！結果はまた報告します。

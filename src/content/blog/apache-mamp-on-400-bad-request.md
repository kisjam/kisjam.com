---
title: "Apache（MAMP）で400 Bad requestが表示される場合"
slug: "apache-mamp-on-400-bad-request"
date: "2017-10-01T21:45:42+09:00"
modified: "2024-02-02T01:26:10+09:00"
emoji: "🖥"
excerpt: "表題の通り。いつも通りローカルに開発環境を整えようとhtdocsにファイルを追加し、Virtual Hostの設定を加えてMAMP上でApacheを再起動してアクセス。が、何故か400エラー。心当たり全くなしのところどうやらServerNa…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

表題の通り。いつも通りローカルに開発環境を整えようとhtdocsにファイルを追加し、Virtual Hostの設定を加えてMAMP上でApacheを再起動してアクセス。が、何故か400エラー。心当たり全くなしのところどうやらServerNameにハイフン、ピリオド、英数字以外を使用するとエラーが出るそうで・・・。

Virtual hostの設定でServer Nameにアンダースコア（\_）を使用しているのが原因でした。（修正前）

```
<VirtualHost *:80>
    DocumentRoot "/Applications/MAMP/htdocs/hogehoge_foo"
    ServerName hogehoge_foo
</VirtualHost>
```

ハイフンに変更したところ無事アクセスできました、DocumentRootにはアンダースコア使えます。（修正後）

```
<VirtualHost *:80>
    DocumentRoot "/Applications/MAMP/htdocs/hogehoge_foo"
    ServerName hogehoge-foo
</VirtualHost>
```

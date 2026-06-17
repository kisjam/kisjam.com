---
title: "MAMPのMySQLが起動しない場合の対処法"
slug: "what-to-do-if-mysql-in-mamp-does-not-start"
date: "2019-01-28T11:02:31+09:00"
modified: "2024-02-02T01:11:46+09:00"
emoji: "🐥"
excerpt: "大体MAMPが正しく終了していない時に発生します。 MAMP/conf/ にmy.cnf 作成して下記を記述します。 後はMAMPを再起動するとMySQLが起動するので起動が確認できたら my.cnf を削除かリネームしておきましょう。"
categories:
  - name: "雑記"
    slug: "scribble"
tags: []
---

大体MAMPが正しく終了していない時に発生します。

MAMP/conf/ にmy.cnf 作成して下記を記述します。

```
[mysqld]
default-storage-engine = InnoDB
innodb
innodb_force_recovery = 1
```

後はMAMPを再起動するとMySQLが起動するので起動が確認できたら my.cnf を削除かリネームしておきましょう。

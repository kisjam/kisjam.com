---
title: "MovableTypeの予約投稿（日時指定投稿）が動かない場合"
slug: "run-periodic-tasks-not-working"
date: "2025-03-28T15:47:14+09:00"
modified: "2026-03-09T11:25:25+09:00"
emoji: "🗓️"
excerpt: "表題の通り、レンタルサーバーの癖にやられたので備忘録。 環境 bit-drive ホスティング ベーシックアルファ 結論 ‘mt-config.cgi’ の ‘TempDir’ を絶対パスで記述しよう 経緯 予約投稿が動いてないので設定する…"
categories:
  - name: "雑記"
    slug: "scribble"
tags: []
---

表題の通り、レンタルサーバーの癖にやられたので備忘録。

<table class="has-fixed-layout"><tbody><tr><td>環境</td><td>bit-drive ホスティング ベーシックアルファ</td></tr></tbody></table>

## 結論

‘mt-config.cgi’ の ‘TempDir’ を絶対パスで記述しよう

## 経緯

予約投稿が動いてないので設定するか〜と思い、いつものようにcronを設定しようとしました。  
管理画面から設定するタイプのサーバーだったので、スケジュールとスクリプトを設定します。  
ただ、スクリプトがコマンドパスのみ指定できる仕様だったため、MTのドキュメントにあるような ‘cd ~’ から書くことが出来ず、絶対パスで直接 ‘run-periodic-tasks’ を指定しました。

これによって相対パスで設定されていた TempDir がズレて権限がなくなっていた、という具合でした。

TempDir を絶対パスで指定し解決。

ちなみにスケジュールされたタスクのログは管理画面の「システム」のログを見ないと確認できないので注意

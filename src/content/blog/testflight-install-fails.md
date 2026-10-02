---
title: "テストフライトでアプリのインストールが失敗する"
slug: "testflight-install-fails"
date: "2026-10-02T14:30:04+09:00"
emoji: "🛫"
excerpt: "表題の通り、TestFlight でアプリのインストールが失敗するようになり、原因の切り分けに手こずったので備忘録。 TestFlight アプリにはアプリもビルドも表示されているのに、「インストール」を押すと次のエラーで弾かれます。 新しく作ったアプリだけでなく…"
categories:
  - name: "備忘録"
    slug: "memo"
tags: []
---

表題の通り、TestFlight でアプリのインストールが失敗するようになり、原因の切り分けに手こずったので備忘録。

<table class="has-fixed-layout"><tbody><tr><td>環境</td><td>iPhone（iOS 26）／ TestFlight の内部テスト（テスターはアカウント所有者本人）</td></tr></tbody></table>

## 症状

TestFlight アプリにはアプリもビルドも表示されているのに、「インストール」を押すと次のエラーで弾かれます。

> ○○をインストールできませんでした。<br>要求されたアプリは利用できないか存在しません。

新しく作ったアプリだけでなく、以前は普通にインストールできていたアプリも含めて、アカウント内のどのアプリも入りませんでした。

## 結論（暫定）

フォーラムに同様の報告があったので恐らくApple 側の問題になります。
Feedback Assistant で報告し、Developer Support に問い合わせを送りました。現在返事待ちの状態です。

> [Apple Developer Forums - TestFlight の期限切れとインストール失敗のスレッド](https://developer.apple.com/forums/thread/813703)

## 見分け方

インストールできなくなる直前に、**アカウントの全アプリの TestFlight ビルドが、同じ秒で一斉に期限切れ**になっていました。数時間前にアップロードしたばかりのビルドも含めてです。
その後に上げ直したビルドは、処理済み（`VALID`）・内部テスト中（`IN_BETA_TESTING`）になり、TestFlight アプリにも並びます。それでもインストールで同じエラーになります。

## やったこと

### Feedback Assistant で報告する

Mac の「フィードバックアシスタント」（Spotlight で検索すると出てきます）を開き、開発者の Apple ID でサインインして新規フィードバックを作ります。種類は App Store Connect の TestFlight を選び、症状と、期限切れになった時刻・エラー文・インストール失敗の画面のスクリーンショットを付けて送ります。

フォーラムでは「情報不足で診断できない」で閉じられた報告もあったので、iPhone の診断ログ（sysdiagnose）も付けておくと良さそうです。
送ると「FB」で始まる受付番号がもらえます。

### Developer Support に問い合わせる

[developer.apple.com/contact](https://developer.apple.com/contact/) から TestFlight について問い合わせます。期限切れになった時刻、アプリとビルド、エラー文に加えて、Feedback の受付番号も書いておくと話が早いはずです。

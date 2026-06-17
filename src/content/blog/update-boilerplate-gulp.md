---
title: "【Gulp】サイト制作でよく使うBoilerplateを更新しました。"
slug: "update-boilerplate-gulp"
date: "2022-10-26T17:16:05+09:00"
modified: "2024-02-02T01:10:06+09:00"
emoji: "🥤"
excerpt: "気づけば最後にgulpfile.jsを更新したのは数年前・・・ということになっていたので久々にメンテするかと思い立ち、諸々触った備忘録。 結果 https://github.com/kisjam/boilerplate-gulp/ 主に静的…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

気づけば最後にgulpfile.jsを更新したのは数年前・・・ということになっていたので久々にメンテするかと思い立ち、諸々触った備忘録。

## 結果

[https://github.com/kisjam/boilerplate-gulp/](https://github.com/kisjam/boilerplate-gulp/)

主に静的Webサイトを構築する際に使用しています。  
アプデしたはいいもののGulpのメンテが止まっているのでnpm-scriptsに移行します（後述）

## ざっくり手順

node.jsとnpmのバージョンアップ

node.js – v16.17.1  
npm – v8.19.2

それに伴い古くなってたパッケージが動かなくなったのでそちらもアップデート。

### Babelの削除

IEがお亡くなりになったのでgulpfileは.mjs形式に変更、Webpackでバンドル・Babelでトランスパイルしていたフロント用のjsは引き続きWebpackでバンドルして中身をTypescriptに変更しました。

### Sassの対応

@importが非推奨になったのでその辺も@use、@fowardに移行しました。

本末転倒感あるけどmixinだったり変数は制作の都合上個別に読み込むのが億劫なので、/global/を用意してそこからまとめて読むようにしました。が、glob系のプラグインはエントリーポイントから遡ってglobしてくれないので/global/index.scss等一部手動で更新する必要があり、この辺りは次回の更新でなんとかしたいです。色々見た中では「[https://www.npmjs.com/package/drygen](https://www.npmjs.com/package/drygen)」のアプローチが良さそうでした。

### Typescriptの対応

コーポレートサイト等向けに使用するこのBoilerplateでは正直いらんな・・・と思ったのですが勉強がてら普段使ってるjsをtsに置き換えていきました。

型定義したからどうなんねん！って気持ちで書き始めましたが書いてる最中に都度VSCodeが「ここはこうするんや」って言ってくれるので結果きれいなコードになるし実行時のエラー減るので非常に良い開発体験になりました。導入のメリットは十分にあると思います。

### 所感と今後

大きく変更したのはそんなところですが意外と時間がかかりました。IE11の対応が不要になったことで結構足かせが外れた感あります。

アプデしている最中に知ったのですがGulpのメンテが数年前で止まったこともあり、どうやら世の中のフロントエンドにおけるタスクランナーはnpm-scriptsに変わっていました。

[https://roadmap.sh/frontend](https://roadmap.sh/frontend)

Viteや11tyでビルドするのが今っぽいようなのでGulpアプデしたばかりですが順次npm-scriptに移行しようと思います。

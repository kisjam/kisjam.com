---
title: "vccwでWordPressの開発環境を作る。"
slug: "developed-wordpress-theme-with-vccw"
date: "2017-07-28T05:00:28+09:00"
modified: "2024-02-02T01:27:25+09:00"
emoji: "🛠"
excerpt: "まえおき WordPressのテーマでも作ろうと思ったある日、先日うきうきでローカル開発環境を整えた俺はWordPressをインストールしようと試みました。 さて、気づいたらXAMPPでMysql+WPインスコなんてのは過去の産物になってい…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

## まえおき

WordPressのテーマでも作ろうと思ったある日、先日うきうきでローカル開発環境を整えた俺はWordPressをインストールしようと試みました。

さて、気づいたらXAMPPでMysql+WPインスコなんてのは過去の産物になっていたようなのでモダンな開発環境を手に入れるべく調査をすすめるとそこには「vccw」なるものがあるとのこと。

## がいよう

vccwとはローカル環境でWordPressを開発する際に開発環境として使えるものらしく動作条件はVagrantが必要とのこと。Vagrantに関しては先日使ってみたばかりなのでここぞとばかりに使ってみることにしました。まだの人はVirtual boxを入れるところから始めましょう

[/blog/setup-vagrant/](/blog/setup-vagrant/)

VirtualBoxを使うところを察するにホストOS型のWP開発環境が手に入る感じでしょうか、既存のモジュールやバージョン違いによる個々人の微妙な差異に悩まないよう統一された開発環境が手に入る予感がします。

## インストール手順

http://vccw.cc/

早速公式のガイドに沿ってインストールしていきます。

### 1\. Install VirtualBox.

VirtualBoxをインストールしましょう、私は先日インストール済みです！！！

<https://www.virtualbox.org/>

### 2\. Install Vagrant.

Vagrantも入れましょう、例によって既に入っているのでここは飛ばします、わからない方は上の記事を読むかドットインストールを見ましょう

### 3\. Install the vagrant-hostsupdater plugin. (Optional)

vagrantのプラグインをインストールします。

このプラグインはVagrant を起動するときに、ホスト（ローカル）のhostsファイルをVagrantfileに記述したものによしなに設定してくれる良いやつです。

Vagrantをインストールしたディレクリに作業ディレクトリを作ります、

```
$ mkdir kisjam_vccw
$ cd kisjam_vccw
$kisjam_vccw vagrant plugin install vagrant-hostsupdater
```

### 4\. Download vagrant box

本題です、VagrantのBoxをインストールします。

```
$kisjam_vccw vagrant box add vccw-team/xenial64
```

しばし待ちましょう。

### 5\. Please download .zip.

該当リンクからZipファイルをダウンロードしましょう。

### 6\. Change into a new directory.

先程ダウンロードしたファイルを解凍して作業用ディレクトリに突っ込みましょう、私の場合だと「kisjam\_vccw」に突っ込みます。

その後に

```
$kisjam_vccw cd vccw/
```

で先程突っ込んだフォルダに移動します。

### 7\. Start a Vagrant environment.

はい、準備が整いました。便利かて・・・

Vagrantを起動しましょう。

```
$ vagrant up
```

### 8\. Visit WordPress on the Vagrant in your browser

しばらくすると起動が完了するので下記のIPにアクセス出来るようになります。

http://vccw.dev/ or http://192.168.33.10/

いかがでしたでしょうか？一瞬でしたね。いままでwordpress.orgから逐一ダウンロードしてローカルに突っ込んでとしていた身としては非常に便利です。

準備が出来たのでテーマ開発に勤しみたいと思います。

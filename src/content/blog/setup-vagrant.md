---
title: "Vagrantでローカル環境を作る。導入編"
slug: "setup-vagrant"
date: "2017-06-27T21:23:05+09:00"
modified: "2024-02-02T01:31:25+09:00"
emoji: "🌳"
excerpt: "ローカル開発環境を見直すにあたりVagrantを採用したいなと。 今回の目標はwebサーバー立ち上げて表示まで。 とりあえず概要を掴むためにざっとドットインストールに目を通す。 http://dotinstall.com/lessons/b…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

ローカル開発環境を見直すにあたりVagrantを採用したいなと。

今回の目標はwebサーバー立ち上げて表示まで。

とりあえず概要を掴むためにざっとドットインストールに目を通す。

[http://dotinstall.com/lessons/basic\_localdev\_mac\_v2](http://dotinstall.com/lessons/basic_localdev_mac_v2)

## Virtualboxのインストール

OSの仮想環境を作ってくれるソフト、IEの検証用でもともと入っていたので省略。持っていない方は下記のサイトからダウンロードしてインストール。

<https://www.virtualbox.org/>

インストール時に特に設定は必要ないので次へ次へでインストール完了です。

## Vagrantのインストール

これとVirtualBoxをセットで使います、複数人での作業時にローカル開発環境に差異がでないよう共通の開発環境を用意したり本番環境と仕様を合わせるために使います。

<https://www.vagrantup.com/>

こちらも同様に次へ次へと進めばインストール完了です。

## Vagrantの設定。

vagrant-vbguestのインストール

フォルダ共有をする際にboxとVagrantのバージョンに違いがあるとエラーが出るようでそれを解消するプラグイン。

```
$ vagrant plugin install vagrant-vbguest
```

```
Installing the 'vagrant-vbguest' plugin. This can take a few minutes...
Fetching: micromachine-2.0.0.gem (100%)
Fetching: vagrant-vbguest-0.14.2.gem (100%)
Installed the plugin 'vagrant-vbguest (0.14.2)'!
```

```
$ cd ~/Vagrant/MyProject/
```

Vagrantfileを作る。

```
$ vagrant init bento/centos-6.8
```

仮想マシンのIPアドレスを192.168.33.10にする

```
$ sed -i '' -e 's/# config.vm.network "private_network", ip: "192.168.33.10"/config.vm.network "private_network", ip: "192.168.33.10"/' Vagrantfile
```

仮想マシンの起動

```
$ vagrant up
```

状態を確認。RunningならOK。

```
$ vagrant status
```

OSを最新状態にアップデート

```
sudo yum -y update
```

Gitのインストール

```
sudo yum -y install git
```

アプリケーション設定用のスクリプトをダウンロード

```
git clone https://github.com/dotinstallres/centos6.git
```

```
cd centos6
```

gitから取得したスクリプトの実行

```
./run.sh
```

設定の反映

```
exec $SHELL -l
```

よし！！一通り完了。

FTPソフトで先程設定したIPに接続します、ユーザーとパスワードはどちらも「vagrant」

下記のindex.phpを設置。

```
<?php echo 'hello world!'; ?>
```

webサーバーを起動。これでようやくブラウザで確認できるようになりました。

```
php -S 192.168.33.10:8000
```

「http://192.168.33.10:8000」を入力。

できたーー。

Vagrantを終了するには一回exitで抜けてから下記のコマンド

```
$ exit
$ vagrant suspend
```

hostsに下記のように追記することでドメインでアクセスもできる。

```
192.168.33.10 sample.com
```

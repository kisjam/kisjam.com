---
title: "Vagrantでローカル環境を作る。バーチャルホスト編"
slug: "vagrant-virtual-host-setting"
date: "2017-06-28T18:35:13+09:00"
modified: "2024-02-02T01:30:28+09:00"
emoji: "🌲"
excerpt: "前回ドットインストールを参考にVagrantを入れてwebサーバー立ち上げる所まで触りました。 実際にローカルで開発するにあたって今までXAMPPで行っていたように案件毎に仮想ドメインを割り当てたい。Qiitaにいい感じの記事が合ったので参…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

前回ドットインストールを参考にVagrantを入れてwebサーバー立ち上げる所まで触りました。

実際にローカルで開発するにあたって今までXAMPPで行っていたように案件毎に仮想ドメインを割り当てたい。Qiitaにいい感じの記事が合ったので参考に設定してみる。

## LAMP環境を整える

```
$ mkdir Works #仮想マシンを入れるディレクトリを作成
$ cd Works
$ vagrant box add centOS https://github.com/CommanderK5/packer-centos-template/releases/download/0.6.7/vagrant-centos-6.7.box #URLは「http://www.vagrantbox.es/」から選びました
$ vagrant init centOS
$ vi Vagrantfile
#「config.vm.network "private_network", ip: "192.168.33.10"」のコメントを解除、このIPで今後アクセスできるようになります。
$ vagrant up
```

Vagrantの立ち上げが完了。続いてsshの設定をします。

```
$ vagrant ssh
[vagrant@localhost ~]$ chmod 0700 /home/vagrant/.ssh
[vagrant@localhost ~]$ chmod 0600 /home/vagrant/.ssh/authorized_keys
[vagrant@localhost ~]$ chown -R vagrant /home/vagrant/.ssh
```

所有者と権限の設定が完了しました。

```
# yumを最新にアップデート
[vagrant@localhost ~]$ sudo yum -y update

# Apacheのインストール
[vagrant@localhost ~]$ sudo yum -y install httpd
[vagrant@localhost ~]$ sudo service httpd start
[vagrant@localhost ~]$ sudo chkconfig httpd on

# MySQLのインストール
[vagrant@localhost ~]$ sudo yum install mysql-server 
[vagrant@localhost ~]$ sudo service mysqld start
[vagrant@localhost ~]$ sudo chkconfig mysqld on

# PHPのインストール
[vagrant@localhost ~]$ sudo yum -y install --enablerepo=remi --enablerepo=remi-php56 php php-mbstring php-mcrypt php-pear php-mysqli
```

PHPのインストールだけコケた、remi リポジトリが見つからないと言われたので追加する。

```
[vagrant@localhost ~]$ sudo rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
```

再度実行したところ無事PHPインストール完了。

## バーチャルホストの設定

```
[vagrant@localhost ~]$ sudo vi /etc/httpd/conf.d/vhosts.conf
```

```
#下記を追記して保存する。
NameVirtualHost *:80
<VirtualHost *:80>
    ServerName vagrant.dev
    DocumentRoot /var/www/html/

    <Directory "/usr/local/vhosts/">
        Options All
        AllowOverride All
        Order Allow,Deny
        Allow from all
    </Directory>
</VirtualHost>

# helloworld
<VirtualHost *:80>
    ServerName helloworld.vagrant.dev
    DocumentRoot /var/www/html/helloworld

    <Directory "/var/www/html/helloworld">
        Options All
        AllowOverride All
        Order Allow,Deny
        Allow from all
    </Directory>
</VirtualHost>
```

```
[vagrant@localhost ~]$ sudo vi /etc/httpd/conf/httpd.conf
```

```
NameVirtualHost *:80 #下の方にあるこの行のコメント外す
```

ここまで終わったらApacheを再起動して設定を反映させましょう。

```
[vagrant@localhost ~]$ sudo service httpd reload
```

Vagrant側の設定はこれでOKです、Vagrantからログアウトしてローカルに移ります。

```
$ sudo vi /etc/hosts
```

```
# 下記を一番下に追記します、今後はvhosts.confと併せて案件が増えたら追記していきます。
# また先頭のIPアドレスはVagrantfileにて設定したものを、
# 「helloworld.vagrant.dev」の箇所はvhosts.confのServerNameと合わせます。

192.168.33.10 helloworld.vagrant.dev
```

ローカル環境の設定もこれで完了です。ブラウザでちゃんと動いているか確認しましょう！

/var/www/html/helloworld/にindex.htmlを設置しています。

無事環境が整いました。

## よく使うコマンド

```
$ service httpd start #Apacheを起動する
```

```
$ service httpd stop #Apacheを停止する
```

```
$ service httpd restart #Apacheを再起動する
```

## 便利な設定

### Vagrantにどのディレクトリからでもssh接続できるようにする

```
$ vagrant ssh-config --host centOSssh >> ~/.ssh/config
$ ssh centOSssh
```

「centOSssh」のところを任意に変更して下さい。これを設定しておくとVagrantfileがあるディレクトリ以外からもsshに一発で接続できるようになります。

### シンボリックリンクを作成する

```
sudo ln -s /vagrant/html /var/www/html
```

厳密に言うと違いますがショートカットみたいなものです。

上記のシンボリックリンクを作成するとVagrant上の/vagrant/html/を参照すると/var/www/html/を見てくれます、そして/vagrant/はローカルと同期するので下記のようにファイルを設置するとVagrant上の/var/www/html/に/helloworld/を置いたのと同じような動きになります。これでバーチャルホスト等と合わせてお手軽にファイル更新→ブラウザで確認ができます。便利！

## 参考サイト

-   [Vagrantでローカル開発環境構築](http://qiita.com/Hanachan48Kh/items/405c11f1e06d2ad4a83c)
-   [vagrantを用いたPHPの環境構築](http://qiita.com/tiwu_official/items/f135e6b6fbbe3ec6aa54)

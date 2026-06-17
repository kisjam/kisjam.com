---
title: "Macに入っているApacheでローカル環境を構築する"
slug: "configure-apache-on-mac"
date: "2017-07-05T19:21:16+09:00"
modified: "2024-02-02T01:28:57+09:00"
emoji: "🖥"
excerpt: "XAMPPやMANPを今まで使っていましたがMacにはもともとApacheが入っているので上記を使わずにローカル環境を作ってみることにしました。 案件毎にバーチャルホストを設定して「hogehoge.com.dev」のような形で確認できるよ…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

XAMPPやMANPを今まで使っていましたがMacにはもともとApacheが入っているので上記を使わずにローカル環境を作ってみることにしました。

案件毎にバーチャルホストを設定して「hogehoge.com.dev」のような形で確認できるように設定します。細かい設定はおいといてこれで最低限動くようになります。

## Apacheの起動・停止・再起動

よく使うので覚えておきましょう。起動するとブラウザから「[http://localhost/](http://localhost/)」でアクセス出来るようになります。

```
# 起動
$ sudo apachectl start

#　停止
$ sudo apachectl stop

# 再起動
$ sudo apachectl restart
```

### 初期の作業ディレクトリ

/Library/WebServer/Documents

### 各種ファイルの場所

/private/etc/apache2/httpd.conf

/private/etc/apache2/extra/httpd-vhosts.conf

/private/etc/hosts

## httpd.conf の設定

作業フォルダの変更とバーチャルホストの設定を有効にします。

### 作業ディレクトリの変更

```
$ sudo vi /private/etc/apache2/httpd.conf
```

```
#下記の記述を任意のディレクトリに設定。今回はDropbox上のフォルダを指定しています。

DocumentRoot "/Users/kisjam/Dropbox/works/www"
<Directory "/Users/kisjam/Dropbox/works/www">
```

### バーチャルホストの設定ファイルを読み込む

```
# コメントアウトを外す
Include /private/etc/apache2/extra/httpd-vhosts.conf
```

これでhttpd.confの設定は完了です。最後にDropboxのアクセス権を変更します。

```
# アクセス権の変更
$ chmod 701 ~/Dropbox
```

## バーチャルホストの設定

案件ごとに任意のドメインでアクセスできるようにバーチャルホストを設定します。

```
sudo vi /private/etc/apache2/extra/httpd-vhosts.conf
```

```
NameVirtualHost *:80

<VirtualHost *:80>
    DocumentRoot "/Users/kisjam/Dropbox/works/www"
    ServerName localhost
    <Directory "/Users/kisjam/Dropbox/works/www">
        Require all granted
        DirectoryIndex index.html
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    DocumentRoot "/Users/kisjam/Dropbox/works/www/kisjam.com"
    ServerName kisjam.com.dev
    <Directory "/Users/kisjam/Dropbox/works/www/kisjam.com">
        Require all granted
        DirectoryIndex index.html
    </Directory>
</VirtualHost>
```

DocomentRootにプロジェクトの作業ディレクトリを設定、SercerNameはドメインを設定します。  
また、こちらの１行目と３行目にあるNameVirtualHostはhttpd.conf内の48行目付近にある「Listen」と186行目付近にある「ServerName」の番号と合わせましょう。MAMP初期設定だと「8888」です。

保存したら設定を反映させるためにApacheを再起動します。

```
$ sudo apachectl restart
```

### hosts の設定

```
sudo vi /etc/hosts
```

```
# 案件毎に追記します、ここにはServerNameで設定した名前を設定します。
127.0.0.1       kisjam.com.dev
```

DocumentRoot（/Users/kisjam/Dropbox/works/www/kisjam.com）に適当にindex.htmlを設置して、ブラウザから「kisjam.com.dev」にアクセスすると無事表示されます。

### PHPを.html拡張子でも使用できるようにする。

httpd.confに下記をコードを追記しましょう。

```
AddType application/x-httpd-php .php .html
```

> [http://qiita.com/hrkd/items/2dd624d31292f142efb6](http://qiita.com/hrkd/items/2dd624d31292f142efb6)

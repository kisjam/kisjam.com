---
title: "Vagrant上のApacheでファイルの更新が反映されない時に確認する設定"
slug: "files-on-the-vagrant-are-not-updated"
date: "2017-06-30T17:58:18+09:00"
modified: "2024-02-02T01:29:53+09:00"
emoji: "🐥"
excerpt: "ファイルを置いた時なんかは気づきませんでしたが中身を更新しても画面上に反映されず、ブラウザでソースを確認すると前のまま。 Vagrantやローカルの該当ファイルを確認してみるとこちらは更新されているけれど反映はされない。どうやらVagran…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

ファイルを置いた時なんかは気づきませんでしたが中身を更新しても画面上に反映されず、ブラウザでソースを確認すると前のまま。

Vagrantやローカルの該当ファイルを確認してみるとこちらは更新されているけれど反映はされない。どうやらVagrantの共有フォルダをローカルから弄っているとよく遭遇するバグみたいです。

Vagrantにログインしてhttpd.confを編集します。

```
$ sudo vi /etc/httpd/conf/httpd.conf
```

EnableMMAP off  
EnableSendfile off  
が原因らしいのでコメントを外します。

```
#
# EnableMMAP: Control whether memory-mapping is used to deliver
# files (assuming that the underlying OS supports it).
# The default is on; turn this off if you serve from NFS-mounted
# filesystems.  On some systems, turning it off (regardless of
# filesystem) can improve performance; for details, please see
# http://httpd.apache.org/docs/2.2/mod/core.html#enablemmap
#

EnableMMAP off

#
# EnableSendfile: Control whether the sendfile kernel support is
# used to deliver files (assuming that the OS supports it).
# The default is on; turn this off if you serve from NFS-mounted
# filesystems.  Please see
# http://httpd.apache.org/docs/2.2/mod/core.html#enablesendfile
#

EnableSendfile off
```

Apacheの再起動も忘れずに。

```
$ sudo service httpd reload
```

無事解決しました。

> [Vagrantの共有フォルダをapacheの公開ディレクトリにしていると更新が反映されない問題](http://d.hatena.ne.jp/stealthinu/20160310/p1)

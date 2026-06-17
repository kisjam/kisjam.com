---
title: "Vue.jsとAxiosでWP REST APIを使ってみた。"
slug: "i-tried-using-rest-api-with-vue-js-and-axios"
date: "2017-07-19T08:22:33+09:00"
modified: "2024-02-02T01:28:19+09:00"
emoji: "🐥"
excerpt: "「REST API」はWordPressの投稿データ等をHTTPリクエストで取得できる便利な仕組みです、既存の記事を更新したり取得したりと色々できます。今回はシンプルにサイトにWordPressの新着記事を任意の数だけ表示させるのが目的です…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

「[REST API](http://ja.wp-api.org/)」はWordPressの投稿データ等をHTTPリクエストで取得できる便利な仕組みです、既存の記事を更新したり取得したりと色々できます。今回はシンプルにサイトにWordPressの新着記事を任意の数だけ表示させるのが目的です、よくある日付+カテゴリ+タイトルの構成です。

ちなみに「[https://www.kisjam.com/](https://www.kisjam.com/#blog)」で実際に動いています、

## 下準備（Vueとaxiosの読み込み）

webpackを使っていたのでnpmでインストールします、サクッと試したい方はCDNを使いましょう。

```
$ npm install -D axios
$ npm install -D vue vue-loader vue-template-compiler
```

webpack.config.jsにvue.jsの設定を追記。

```
module.exports = {
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.common.js'
    }
  },
  entry: {
    'main': './src/js/main.js'
  },
  output: {
    path: __dirname + '/build',
    filename: './[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }

};
```

準備完了。

## REST APIを試してみる

実際に値が返ってくるのかを試してみます、といってもこちらは簡単です。WordPressが入っているサイトで「\*\*\*.com/wp-json/wp/v2/posts/」といった具合にURLを叩くだけです。

このブログだと「[https://www.kisjam.com/blog/wp-json/wp/v2/posts/](https://www.kisjam.com/blog/wp-json/wp/v2/posts/)」ですね、投稿データが10件返ってきます。後はこのデータをaxiosで処理してVueを使ってサイトに表示させます。

## axios + Vue

続いてjsファイルの先頭で今回使うVueとaxiosを読み込みます、CDNで読み込んでいる場合は省略しましょう。

```
import Vue from 'vue';
import axios from 'axios';
```

```
const vue_entry = new Vue({
  el: '#entry',
  data: {
    url: 'https://www.kisjam.com/blog/',
    posts: [],
    categories: [],
    errors: []
  },
  created(){
    let arr_categories = [];
    axios.get(this.url+'wp-json/wp/v2/categories/?per_page=30')
    .then(response => {
      this.categories = response.data
      for (var item of this.categories) {
        arr_categories[item.id] = item.name;
      }
    })
    .catch(e => {
      this.errors.push(e)
    });

    axios.get(this.url+'wp-json/wp/v2/posts/?per_page=5')
    .then(response => {
      this.posts = response.data
      for (var post of this.posts) {
        let date = new Date(post.date);
        let date_year = date.getFullYear();
        let date_month = date.getMonth()
        let date_day = date.getDate();
        let date_publish = date_year + '.' + date_month + '.' + date_day;
        post.categories.name = arr_categories[post.categories[0]];
        post.pubdate = date_publish;
      }
    })
    .catch(e => {
      this.errors.push(e)
    });
  }
});
```

```
<ul class="entry" id="entry" v-if=" posts && posts.length">
  <li class="entry__item" v-for="post of posts">
    <a v-bind:href="post.link">
      <p class="entry__item__date"><time v-bind:datatime="post.date">{{ post.pubdate }}</time></p>
      <p class="entry__item__cat"><i class="icon-tag"></i> {{ post.categories.name }}</p>
      <p class="entry__item__ttl">{{ post.title.rendered }}</p>
    </a>
  </li>
</ul>
```

記事のカテゴリを取得するのにややごちゃっとしましたが最小限の構成だと下記のコードで記事のタイトルやら本文は取得できます。

```
const vue_entry = new Vue({
  el: '#entry',
  data: {
    url: 'https://www.kisjam.com/blog/',
    posts: [],
    errors: []
  },
  created(){
    axios.get(this.url+'wp-json/wp/v2/posts/?per_page=5')
    .then(response => {
      this.posts = response.data
    })
    .catch(e => {
      this.errors.push(e)
    });
  }
});
```

初めて触ってみましたが簡単そうに思えてもやはり躓きながらの実装でした、、勉強になります。

## 参考サイト

<https://www.webprofessional.jp/fetching-data-third-party-api-vue-axios/>

[http://qiita.com/rsooo/items/0a9caf9ee804874eac03](http://qiita.com/rsooo/items/0a9caf9ee804874eac03)

[http://www.webopixel.net/develop/1221.html](http://www.webopixel.net/develop/1221.html)

<https://aloerina01.github.io/javascript/vue/2017/03/08/1.html>

[http://qiita.com/sygnas/items/c0228eabbb3157766d5c](http://qiita.com/sygnas/items/c0228eabbb3157766d5c)

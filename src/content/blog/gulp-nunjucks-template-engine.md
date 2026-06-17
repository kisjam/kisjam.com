---
title: "gulp + Nunjucksで快適な静的HTMLの開発環境を整える"
slug: "gulp-nunjucks-template-engine"
date: "2017-11-28T22:53:18+09:00"
modified: "2024-02-02T01:20:35+09:00"
emoji: "🥤"
excerpt: "快適なコーディング環境を求めてテンプレを作ったのでその備忘録です。 以前はphpでヘッダーなどの共通ファイルのインクルードを行っていましたが静的ファイルで完結するシンプルさとサーバー側を気にしなくて良いのでGulpと組み合わせて静的ファイル…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

快適なコーディング環境を求めてテンプレを作ったのでその備忘録です。

以前はphpでヘッダーなどの共通ファイルのインクルードを行っていましたが静的ファイルで完結するシンプルさとサーバー側を気にしなくて良いのでGulpと組み合わせて静的ファイルが作れるテンプレートエンジン便利やなーと思っていた次第です。

WordPressとか使う場合は大体のことはWP側でもできるので素直にテーマファイルで実装すれば良いのかなと思っています。

## 前提条件

-   いわゆる普通の企業サイト（1P~数十ページ）のコーディング向け  
    （数百規模でもいけると思うけど試してない・CMSもまだ試してない）
-   複数人で作業する可能性があるので学習コストは低くしたい
-   共通部分の読み込みとmetaやtitleを個別に上書きできる機能が最低限欲しい
-   jsonで大量にページ生成、とかは今のところ必要ない

## Nunjucksとは

<https://mozilla.github.io/nunjucks/>

Mozilla製のテンプレートエンジンです。

シンプルな記述とextends等の一通りの機能が揃っています。

結果的にNunjucksを選びましたが選定にあたってPugとEJSも試してみました、どちらも良かったですしそこまでこの３つのライブラリに差は無かったのですが私がよく使う環境だとNunjucksが向いてるかな、といった感じでした。好みのレベルだと思います。

フォルダ構成などはgithubにあげているのでこちらを御覧ください。

<https://github.com/kisjam/template>

基本的には共通パーツの読み込みです。default.njkをextendsすることでヘッダー・フッターなどが共通で利用できます。

```
{% extends '_layouts/_default.njk' %}
{% set pageTitle = 'ページタイトル｜サイトタイトル' %}
{% set pageDescription = 'ページ固有のディスクリプション' %}
{% set pagekeywords = '' %}

{% block css -%}{% endblock %}

{% block contents -%}

{%- endblock %}

{% block js -%}{% endblock %}
```

個人的に何点かTipsがあるのでその解説を。

### 個別に設定が必要な内容（meta、title等）

Descriptionsやtitleなど、大体の場合でページ毎に設定が必要です。jsonで管理するか迷ったのですがファイル内で完結している方が後々ページのメンテナンスをする際にわかりやすいので先頭にまとめています。未指定の場合はsite.jsonで設定している内容が挿入されます。

```
{
  "data": {
    "sitename": "templete",
		"favicon": "/assets/images/favicon.ico",
    "meta": {
      "description": "desc",
      "keywords": "keywords"
    },
		"og": {
			"image": "http://#"
		}
  }
}
```

### \<body\>へのクラス付与

Topページなら「index」、Aboutページなら「about-index」といった具合に自動でクラスを付与してくれます。

Gulpで現在のディレクトリを取得してドキュメントルートからのフォルダ名を取得し変数で呼び出せるようにしました。  
Nunjucks上でやろうとするとちょっと面倒なのでgulpfile.jsで変数投げています。別途「gulp-data」のインストールが必要です。

このやり方はPugでもEJSでも使えるので便利です。

```
gulp.task('html', function() {
	return gulp.src([
		dir.src.html + '**/*' + config.html.extension
		])
		.pipe(plumber())
		.pipe(data(function() {
			return require(dir.njk.json);
		}))
		.pipe(data(function(file) {　// ここ
			return { 'filename': file.path.split(dir.src.html).pop().replace(config.html.extension, '').split('/') }
		}))
		.pipe(nunjucksRender({
				path: [dir.njk.root]
		}))
		.pipe(htmlbeautify(beautifyOptions))
		.pipe(gulp.dest(dir.build.html))
		.pipe(browserSync.stream());
});
```

### ヘッダー等でのカレントクラスの付与

上記で取得した現在のディレクトリを使用してよくあるヘッダーやローカルナビのカレントも判定できます。

```
<header class="header">
	<div class="header__inner">
		<h1 class="logo"><a href="/">logo</a></h1>
		<nav class="nav">
			<button class="nav__btn"></button>
				<div class="nav__global">
				<ul>
					<li class="nav__global__item{% if filename[0] == 'index' %}--current{% endif %}"><a href="/">HOME</a></li>
					<li class="nav__global__item{% if filename[0] == 'about' %}--current{% endif %}"><a href="/about/">私たちについて</a>
						<ul>
							<li class="nav__global__item{% if filename | join('-') == 'about-summary-index' %}--current{% endif %}"><a href="/about/summary/">私達について>概要</a></li>
						</ul>
					</li>
					<li class="nav__global__item{% if filename[0] == 'company' %}--current{% endif %}"><a href="/company/">会社概要</a></li>
					<li class="nav__global__item{% if filename[0] == 'contact' %}--current{% endif %}"><a href="/contact/">お問い合わせ</a></li>
				</ul>
			</div>
		</nav>
	</div>
</header>
```

### includeの絶対パス指定

gulpfile.jsでルートディレクトリを指定することが出来ます。階層が変わっても逐一includeやextendのパスを変えずに済みます。

```
		.pipe(nunjucksRender({
				path: [dir.njk.root]
		}))
```

こんな感じです。普通のHTML生で書くよりかは楽になればいいな〜と思いながら組みました、後は案件で何回か使ってみて改善していこうと思います。

## 余談

Pugは独特の記法なのでまあ覚えたら圧倒的に楽だと思います、そこまで記法も複雑ではないので普段からhtml書いてる人ならすっと慣れるかなと。

そうなってくると複数人で作業したときの学習コストが気になって敬遠していたのですが試しに触ってみたところ普通のhtmlを書いても問題なく動作してくれました。

なので書き方は普通のHTMLで、includeや変数の機能だけ使うなんてこともできます。これがわかったときおおー便利と思ったのですが個人的にNunjucksがしっくりきたので特に採用はしませんでした。

EJSは初めて使ったテンプレートエンジンで他の２つとくらべて少し自由度が高いです。頑張ったら色々できます。

includeが相対パスというのと<>で囲うのがやや読みにくいという2点を除けば大体問題ありません。

相対パスを解決する方法もあるのでまあEJSも悪くないです。

## 参考サイト

<https://www.evoworx.co.jp/blog/gulp_nunjucks_beginning/>

> [Nunjucks + gulp で静的 HTML をモジュール化する](https://kazu.tv/blog/2017/06/20/modularize-static-html-files-using-nunjucks-and-gulp/)

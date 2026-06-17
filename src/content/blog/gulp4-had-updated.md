---
title: "Gulp v4にアップデートしました。"
slug: "gulp4-had-updated"
date: "2018-09-03T02:17:12+09:00"
modified: "2024-02-02T01:13:36+09:00"
emoji: "🥤"
excerpt: "普段使っているテンプレート、ちょいちょい更新しているんですけど古くなっている感が増していたのでそろそろ見直そうかと。 Gulpをバージョン4に更新しました、それに伴いgulpfileを記述し直したのと4にしたことで記法が少し変わったのでその…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

普段使っているテンプレート、ちょいちょい更新しているんですけど古くなっている感が増していたのでそろそろ見直そうかと。

Gulpをバージョン4に更新しました、それに伴いgulpfileを記述し直したのと4にしたことで記法が少し変わったのでそのあたりを。

## Gulp4のインストール

```
npm i gulp@next -D
```

@nextが付いてないと現状（2018/8/31）だと3系がインストールされます。

続いてgulpfileをES2015で書く都合でbabelでトランスパイルするため.babelrcを作成。

```
{
	"presets": [
		["env", {
			"targets": {
				"browsers": ["last 2 versions"]
			}
		}]
	]
}
```

babel-core, babel-preset-envもインストールしておきましょう。

```
npm i babel-core babel-preset-env -D
```

最後に**gulpfile.jsをgulp.babel.jsに変更**します。（忘れてて全然動かなかった・・・）

## gulpfileの書き換え

task()やwatchの引数が変わっていたのとseries()とparallel()が追加になりました。seriesが直列、parallelが並列処理です。

### task()

gulp 3.x

```
gulp.task('images', function(){
	return gulp.src(dir.src.images + '**/*')
	//処理
});
```

gulp4

```
export const images = () => {
	return gulp.src(dir.src.images + '**/*')
	//処理
}
```

### watch()

gulp 3.x

```
gulp.task('watch' ,function() {
	gulp.watch(dir.src.images + '**/*', ['images']);
}
```

gulp 4

```
export const watch = () => {
	gulp.watch(dir.src.images + '**/*', gulp.series(images));
}
```

### Default

gulp 3.x

```
gulp.task('default', ['run', 'watch']);
```

gulp 4

```
export default gulp.series(run, watch);
```

結果こんな感じになりました、普段コーポレートサイト等を作るときに使ってるSass、Webpack、Nunjucks、Iconfontの変換、画像の圧縮とbrowsersyncでサーバー立ててます。[一式Githubにあげてるので詳しくはそちらをどうぞ](https://github.com/kisjam/template)

参考

<https://github.com/gulpjs/gulp/tree/4.0>

<https://hatenablog-parts.com/embed?url=https%3A%2F%2Fchaika.hatenablog.com%2Fentry%2F2018%2F06%2F04%2F090000#?secret=4MsoZswnso>

---
title: "gulpでの画像圧縮"
slug: "imagemin-pngquant"
date: "2017-10-20T05:20:32+09:00"
modified: "2024-02-02T01:22:27+09:00"
emoji: "🥤"
excerpt: "今までgulp-imageminを使って画像圧縮していましたが、これだけだとpng周りがあまりサイズ変わらないなーと思い別の何かを探していたところ「imagemin-pngquant」なるものを見つけました。 TinyPNGなどでも圧縮エン…"
categories:
  - name: "Develop"
    slug: "develop"
tags: []
---

今まで[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)を使って画像圧縮していましたが、これだけだとpng周りがあまりサイズ変わらないなーと思い別の何かを探していたところ「[imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant)」なるものを見つけました。

TinyPNGなどでも圧縮エンジンとして使われているみたいで、使ってみたところなかなかサイズを削減してくれるのでメモ。結果14MBくらいあった画像ファイル群が4MBくらいになりました、それでも重いんだけどね・・・

```
const dir = {
  src: {
    images: 'src/assets/images/'
  },
  build: {
    images: 'dist/recruit/biz/assets/images/'
  }
}

const gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant');

const optimizationLevel = {
  'optimizationLevel': 5
}
const pngquantConfig = {
  quality: '65-80',
  speed: 1
}

gulp.task('images', function() {
  gulp.src(dir.src.images + '**/*/')
    .pipe(newer(dir.build.images))
    .pipe(imagemin([pngquant(pngquantConfig)]))
    .pipe(imagemin( optimizationLevel )
    .pipe(gulp.dest(dir.build.images))
    .pipe(browserSync.stream());
});
```

こんな感じで使っています。

一括で数十枚を圧縮しようとすると激重になる（環境？）ので公開前に走らせるのでも良いと思います。

今回は「gulp-newer」で更新のあったファイルのみを圧縮しているのでまあそれほどでも無いですがお好みで。

imagemin を2回走らせていますがpngquantのみだとガンマ補正の情報が付加される場合があるらしいのでそれの対策です（知らんけど）

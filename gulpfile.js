var gulp = require("gulp"),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require("browser-sync"),
  plumber = require('gulp-plumber'),
  webpack = require('gulp-webpack'),
  webpackConfig = require('./webpack.config.js'),
  folder = {
    src: 'src/',
    build: 'build/'
  };


gulp.task('images', function() {
  var out = folder.build + 'images/';

  return gulp.src(folder.src + 'images/**/*/')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  gulp.src(folder.src + 'js/**/*')
  .pipe(plumber())
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest(folder.build + 'js/'))
  .pipe(browserSync.stream());

});

gulp.task('css', function() {
  return gulp.src(folder.src + 'scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest(folder.build + 'css/'))
    .pipe(browserSync.stream());

});

gulp.task('html', function() {
  return gulp.src(folder.src + '**/*.html')
    .pipe(gulp.dest(folder.build))
    .pipe(browserSync.stream());

});

gulp.task('server', function() {
  return browserSync.init({
    proxy: 'kisjam.com.dev'
  })
});


gulp.task('watch',['server'] ,function() {
  gulp.watch(folder.src + 'images/**/*', ['images']);
  gulp.watch(folder.src + 'scss/**/*', ['css']);
  gulp.watch(folder.src + 'js/**/*', ['js']);
  gulp.watch(folder.src + '**/*.html', ['html']);
  gulp.watch('*.html').on('change', function() {
    browserSync.reload();
  })
});

gulp.task('run', ['images', 'css', 'js', 'html']);
gulp.task('default', ['run', 'watch']);

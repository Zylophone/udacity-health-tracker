"use strict";

var gulp = require('gulp'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        maps = require('gulp-sourcemaps'),
        minifyCss = require('gulp-minify-css'),
        del = require('del');
 
     

gulp.task("concatScripts", function() {
    return gulp.src([
        'js/jquery-2.1.4.min.js',
        'js/underscore-min.js',
        'js/backbone-min.js',
        'js/app.js'
        ])
    .pipe(maps.init())
    .pipe(concat('app.concat.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('app/js'));
});

gulp.task("minifyScripts", ["concatScripts"], function() {
  return gulp.src("app/js/app.concat.js")
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('app/js'));
});

gulp.task("concatCSS", function() {
    return gulp.src([
        'css/bootstrap.min.css',
        'css/app.css'
        ])
    .pipe(maps.init())
    .pipe(concat('app.concat.css'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('app/css'));
});

gulp.task("minifyCSS", ["concatCSS"], function() {
  return gulp.src("app/css/app.concat.css")
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('app/css'));
});

gulp.task('watchFiles', function() {
  gulp.watch('css/app.css', ['concatCSS']);
  gulp.watch('js/app.js', ['concatScripts']);
});

gulp.task('clean', function() {
  del([ 'app/css/app*.css*', 'app/js/app*.js*']);
});

gulp.task('cleanMin', ["build"], function() {
  del([ 'app/css/app.min.css*', 'app/js/app.min.js*']);
});


gulp.task("build", ['minifyScripts', 'minifyCSS'], function() {
  return gulp.src(["app/css/app.min.css", "app/js/app.min.js", 'app/index.html',
                   "app/js/*.json","app/img/**", "app/fonts/**"], { base: './'})
            .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['watchFiles']);

gulp.task("default", ["clean"], function() {
  gulp.start('cleanMin');
});

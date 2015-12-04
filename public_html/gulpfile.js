"use strict";

var gulp = require('gulp'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        maps = require('gulp-sourcemaps'),
        minifyCss = require('gulp-minify-css'),
        htmlreplace = require('gulp-html-replace'),
        del = require('del');



gulp.task("concatScripts", function () {
    return gulp.src([
        'js/jquery-2.1.4.min.js',
        'js/moment.min.js',
        'js/pikaday.js',
        'js/pikaday.jquery.js',
        'js/underscore-min.js',
        'js/backbone-min.js',
        'js/app.js'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.js'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatScripts"], function () {
    return gulp.src("js/app.concat.js")
            .pipe(uglify())
            .pipe(rename('app.min.js'))
            .pipe(gulp.dest('js'));
});

gulp.task("concatCSS", function () {
    return gulp.src([
        'css/bootstrap.min.css',
        'css/font-awesome.min.css',
        'css/pikaday.css',
        'css/app.css'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.css'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest('css'));
});

gulp.task("minifyCSS", ["concatCSS"], function () {
    return gulp.src("css/app.concat.css")
            .pipe(minifyCss({compatibility: 'ie8'}))
            .pipe(rename('app.min.css'))
            .pipe(gulp.dest('css'));
});




gulp.task("build", ['minifyScripts', 'minifyCSS'], function () {
    return gulp.src(["css/app.min.css", "js/app.min.js", 
        "img/**", "fonts/**", "favicon.ico"], {base: './'})
            .pipe(gulp.dest('dist'));
});

gulp.task('replace', function () {
    gulp.src('index.html')
            .pipe(htmlreplace({
                'css': 'css/app.min.css',
                'js': 'js/app.min.js'
            }))
            .pipe(gulp.dest('dist'));
});

gulp.task('clean', ['replace'], function () {
    del(['css/app.*.css*', 'js/app.*.js*']);
});

gulp.task("default", ['build'], function () {
    gulp.start('clean');
});

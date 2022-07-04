let preprocessor = 'sass'

const { src, dest, parallel, series, watch } = require('gulp'); // определяме константы gulp
const browserSync = require('browser-sync').create(); // подключаем browser sync
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const webp = require('gulp-webp');

// логика работы browser sync

function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/' },
        notify: false,
        online: true
    })
}


function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.min.js',
            'app/script/slick.min.js',
            'app/script/jQuery.paginate.min.js',
            'app/script/main.js',
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/script'))
        .pipe(browserSync.stream())
}


function styles() {
    return src([
            '!app/style/**/media' + preprocessor,
            'app/style/**/reset.css',
            'app/style/**/slick.css',
            'app/style/**/style.css',
            'app/style/**/hystmodal.min.css',
            'app/style/**/slick-theme.css',
            'app/style/**/*' + preprocessor

        ])
        .pipe(eval(preprocessor)()) //преобразование переменной в функцию
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
        .pipe(dest('app/style/'))
        .pipe(browserSync.stream())
}

function images() {
    return src([
            'app/images/src/**/*'
        ])
        .pipe(newer('app/images/dest/'))
        .pipe(imagemin())
        .pipe(dest('app/images/dest/'))
}

function fonts() {
    return src([
            'app/fonts/src/**/*'
        ])
        .pipe(dest('app/fonts/dest'))
}

function cleanimg() {
    return del('app/images/dest/**/*', { force: true })
}


function startwatch() {
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch(['app/**/*.' + preprocessor], styles);
    watch(['app/images/src/**/'], images);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

function buildcopy() {
    return src([
            'app/style/**/*.min.css',
            'app/script/**/*.min.js',
            'app/images/dest/**/*',
            'app/**/*.html',
            'app/fonts/dest/**/*'
        ], { base: 'app' })
        .pipe(dest('dist'))
}

function cleandist() {
    return del('dist/**/*', { force: true })
}


exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.cleanimg = cleanimg;
exports.build = series(cleandist, styles, fonts, scripts, buildcopy);

exports.default = parallel(cleanimg, images, fonts, scripts, styles, browsersync, startwatch);
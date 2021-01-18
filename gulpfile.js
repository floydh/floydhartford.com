const { src, dest, series, parallel, watch } = require('gulp');
const origin = './src';
const destination = './build';
const del = require('del');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const cssmin = require('gulp-cssnano');
const rename = require('gulp-rename');
const jp2 = require('gulp-jpeg-2000');

sass.compiler = require('node-sass');

async function clean(cb) {
	await del(destination);
	cb();
}

// const sassOptions = {outputStyle: 'compressed'};
const sassOptions = {outputStyle: 'expanded'};

function styles(cb) {
	
	src('./src/sass/**/*.scss')
  	.pipe(sourcemaps.init())
  	.pipe(sassGlob())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('styles.css'))
    .pipe(dest('./src/css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest('./build/css'));
    cb();
}

function stylesDev(cb) {
	
	src('./src/sass/**/*.scss')
  	.pipe(sourcemaps.init())
  	.pipe(sassGlob())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('styles.css'))
    .pipe(dest('./src/css'));

    cb();
}

function files(cb) {
	src(['./src/**/*.php', './src/.htaccess','./src/sitemap_index.xml'])
	.pipe(dest('./build/'));

	cb();
}


// Take the JS scripts.js file
function jsVendor(cb) {
	src(['./src/js/vendor/**/*.js'])
	.pipe(dest('./build/js/vendor/'));

	cb();
}

// Babel it and webpack it
function js(cb) {
	// src([
	// 	'node_modules/masonry-layout/dist/masonry.pkgd.js',
	// 	'node_modules/imagesloaded/imagesloaded.pkgd.js',
	// ])
	// .pipe(dest('./src/js/'));

	src(['./src/js/scripts.js'])
	// .pipe(concat('bundledconcat.js'))
	.pipe(sourcemaps.init())
	.pipe(babel({
		  "comments": false,
		  "presets": [
		    [
		      "@babel/env",
		      {
		        "targets": {
		          "edge": "17",
		          "firefox": "60",
		          "chrome": "67",
		          "safari": "11.1",
		        },
		        "useBuiltIns": "usage",
		        "corejs": "3.6.5",
		      }
		    ]
		  ]
		}))
	.pipe(webpack({
		mode: 'development',
		output: {
			'filename': 'build.js'
		}
	}))
	.pipe(sourcemaps.write('.'))
	.pipe(dest('./src/js/'))
	.pipe(webpack({
		mode: 'production',
		output: {
			'filename': 'build.js'
		}
	}))
	.pipe(dest('./build/js/'));
	cb();
}

// Moves the /img/ folder
function img(cb) {
	src('./src/img/**/*')
	.pipe(imagemin())
	.pipe(dest('./build/img/'));

	cb();
}

function imgNextGen(cb) {
	src('./build/img/**/*.{jpg,jpeg,png}')
    .pipe(jp2())
    .pipe(dest('./build/img/'))
}


function watcher(cb) {
	watch(['src/sass/**/*.scss'], stylesDev);
	watch(['src/js/scripts.js'], js);
	watch(['src/*.php']);

	cb();
}

exports.watcher = watcher;
exports.styles = styles;
exports.files = files;
exports.js = js;
exports.jsVendor = jsVendor;
exports.img = img;
exports.imgNextGen = img;
exports.default = series(clean, parallel(files, js, img), series(styles), series(imgNextGen));

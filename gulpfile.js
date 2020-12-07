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

function files(cb) {
	src(['./src/**/*.php', './src/.htaccess','./src/sitemap_index.xml'])
	.pipe(dest('./build/'));

	cb();
}

// Take the JS scripts.js file
// Babel it and webpack it
function js(cb) {
	src('./src/js/scripts.js')
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

exports.styles = styles;
exports.files = files;
exports.js = js;
exports.img = img;
exports.default = series(clean, parallel(files, js, img), series(styles));

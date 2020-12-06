const { src, dest, series, parallel, watch } = require('gulp');
const origin = './src';
const destination = './build';
const del = require('del');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
sass.compiler = require('node-sass');

// Cleans the build directory
async function clean(cb) {
	await del(destination);
	cb();
}

// Compiles the Sass
function scss(cb) {
	var sassOptions = {outputStyle: 'compressed'};
	src('./src/sass/**/*.scss')
  	 .pipe(sassGlob())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(dest('./src/css'));
    cb();
}

// Moves the PHP files from the public root
function php(cb) {
	src('./src/**/*.php')
	.pipe(dest('./build/'));

	cb();
}

// Moves the JS files from the /js/ directory
function js(cb) {
	src('./src/js/**/*.js')
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

// Moves the CSS file(s)
function css(cb) {
	src('./src/css/**/*.css')
	.pipe(autoprefixer({cascade: false}))
	.pipe(dest('./build/css/'));

	cb();
}

exports.php = php;
exports.js = js;
exports.img = img;
exports.scss = scss;

exports.styles = series(scss, css);
exports.default = series(clean, parallel(php, js, css, img));

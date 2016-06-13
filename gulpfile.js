var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var cache = require('gulp-cache');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var del = require('del');
var babel = require("gulp-babel");
var jade = require('gulp-jade');
var plumber = require('gulp-plumber')

function renderJade(evt) {
    return gulp.src(evt.path)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./wwwroot'))
        .pipe(notify({
            message: 'Jade task complete: ' + evt.path.substring(evt.path.lastIndexOf('\\'))
        }))
}


function renderSass(evt) {
    return sass(evt.path,{
            style: 'expanded'
        })
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(evt.path.substring(0, evt.path.lastIndexOf('\\')) + '\\dist'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(evt.path.substring(0, evt.path.lastIndexOf('\\')) + '\\dist'))
        .pipe(notify({
            message: 'Sass task complete: ' + evt.path.substring(evt.path.lastIndexOf('\\'))
        }))
}

function renderJS(evt) {
    gulp.src(evt.path)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(rename({
            suffix: '.babeled'
        }))
        .pipe(babel())
        .pipe(gulp.dest(evt.path.substring(0, evt.path.lastIndexOf('\\')) + '\\dist'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write(evt.path.substring(0, evt.path.lastIndexOf('\\')) + '\\maps'))
        .pipe(gulp.dest(evt.path.substring(0, evt.path.lastIndexOf('\\')) + '\\dist'))
        .pipe(notify({
            message: 'Babel task complete: ' + evt.path.substring(evt.path.lastIndexOf('\\'))
        }))
}

function renderIMG(evt) {
    if (evt.type == 'changed') {
        return gulp.src(evt.path)
            .pipe(cache(imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            })))
            .pipe(gulp.dest(evt.path.substring(0, evt.path.lastIndexOf('\\'))))
            .pipe(notify({
                message: 'Image task complete: ' + evt.path.substring(evt.path.lastIndexOf('\\'))
            }))
    }
}

gulp.task('templates', function() {
    gulp.src('wwwroot/jade/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./wwwroot'))
        .pipe(notify({
            message: 'jade task complete'
        }))
});


gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});

gulp.task('styles', function() {
    return sass('wwwroot/stylesheets/*.sass', {
            style: 'expanded'
        })
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('wwwroot/stylesheets/dist'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssnano())
        .pipe(gulp.dest('wwwroot/stylesheets/dist'))
        .pipe(notify({
            message: 'Styles task complete.'
        }));
});

gulp.task('scripts', function() {
    return gulp.src('wwwroot/javascripts/*.js')
        .pipe(sourcemaps.init())
        .pipe(rename({
            suffix: '.babeled'
        }))
        .pipe(babel())
        .pipe(gulp.dest('wwwroot/javascripts/dist'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('wwwroot/javascripts/dist'))
        .pipe(notify({
            message: 'Scripts task complete.'
        }));
});

gulp.task('images', function() {
    return gulp.src('wwwroot/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('wwwroot/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

gulp.task('clean', function() {
    return del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img']);
});

gulp.task('watch', function() {

    // Watch .jade files
    gulp.watch('wwwroot/jade/*.jade', renderJade);

    // Watch .sass files
    gulp.watch('wwwroot/stylesheets/*.sass', renderSass);

    // Watch .js files
    gulp.watch('wwwroot/javascripts/*.js', renderJS);

    // Watch image files
    gulp.watch('wwwroot/images/*', renderIMG);

});

gulp.task('watch-styles', function() {

    // Watch .scss files
    gulp.watch('wwwroot/stylesheets/*.sass', ['styles']);

});
/*
elixir(function(mix) {
    mix.sass('app.scss');
});
*/

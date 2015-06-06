var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

var uglify = require('gulp-uglify');
var config = require('../config').browserify;

gulp.task('production-node', [], function() {
    return gulp.src(['src/bastlyBase.js',
                'src/node/**'],
            {base: 'src/'})
        .pipe(replace(/\.\.\//g, './'))
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./build/node'));
});

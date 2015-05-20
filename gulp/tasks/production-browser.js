var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var config = require('../config').browserify;


gulp.task('production-browser', ['browserify'], function() {
  return gulp.src(config.bundleConfigs[0].productionFolder + '/' + config.bundleConfigs[0].outputName)
    // This will minify and rename to foo.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(config.bundleConfigs[0].productionFolder));
});

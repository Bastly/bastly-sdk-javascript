var gulp = require('gulp');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');

gulp.task('release-bower-lib', function (cb) {
  runSequence(
    'upgrade-bower-lib',
    'upload-bower-lib',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        gutil.log(gutil.colors.green('Bower release finished successfully'));
      }
      cb(error);
    });
});


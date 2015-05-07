var watching = false;
var gulp = require('gulp');
var gutil = require('gulp-util');
//zmq is here because gulp mocha clears library bindings on reruns expect those before gulp
var zmq = require('zmq');
var mocha = require('gulp-mocha');

function onError(err) {
  console.log(err.toString());
  if (watching) {
    this.emit('end');
  } else {
    // if you want to be really specific
    process.exit(1);
  }
}

gulp.task('test-node', function() {
    return gulp.src(['src/node/test.js'], { read: false })
        .pipe(mocha({reporter: 'nyan'}))
        .on('error', onError);
});

gulp.task('watch-test-node', function() {
    watching = true;
    gulp.watch(['src/**'], ['test-node']);
});

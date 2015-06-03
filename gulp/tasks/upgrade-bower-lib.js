var gulp = require('gulp');
var runSequence = require('run-sequence');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');
var argv = require('yargs').argv;
var config = require('../config').browserify;
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var currentPackage = getBowerJSONversion();

gulp.task('build-dist', ['browserify'], function() {
  return gulp.src(config.bundleConfigs[0].productionFolder + '/' + config.bundleConfigs[0].outputName) 
    .pipe(gulp.dest(config.bundleConfigs[0].distributionFolder))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(config.bundleConfigs[0].distributionFolder))
});

gulp.task('bump-version', function () {

  var bumpType = (argv.major && 'major') ||
                 (argv.minor && 'minor') ||
                 (argv.patch && 'patch');

  if (bumpType === undefined) {
    throw new Error('Bump type argument required but nothing passed');    
  }

  return gulp.src('./src/browser/bower.json')
    .pipe(bump({type: bumpType}).on('error', gutil.log))
    .pipe(gulp.dest('./src/browser'));
});

gulp.task('commit-changes', function () {
  return gulp.src([config.bundleConfigs[0].distributionFolder, './src/browser/bower.json'])
    .pipe(git.add())
    .pipe(git.commit(currentPackage + ' => ' + getBowerJSONversion()));
});

gulp.task('push-changes', function (cb) {
  git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', function (cb) {
  var version = getBowerJSONversion();
  git.tag(version, version, function (error) {
    if (error) {
      return cb(error);
    }
    git.push('origin', 'master', {args: version}, cb);
  });
});

function getBowerJSONversion() {
    //We parse the json file instead of using require because require caches multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./src/browser/bower.json', 'utf8')).version;
};

gulp.task('upgrade-bower-lib', function (cb) {

  runSequence(
    'build-dist',
    'bump-version',
    'commit-changes',
    'push-changes',
    'create-new-tag',
    function (error) {
      if (error) {
        console.log(error.message);
      }
      cb(error);
    });
});
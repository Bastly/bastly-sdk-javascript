var gulp = require('gulp');
var karma = require('karma');

var karmaTask = function(done) {
  karma.server.start({
    configFile: process.cwd() + '/karma.conf.js',
    singleRun: false
  }, done);
};

gulp.task('karma', karmaTask);

module.exports = karmaTask;

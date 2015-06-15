var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var rename = require('gulp-rename');
var fs = require('fs');
 
gulp.task('upload-bower-lib', function() {
 
  // create a new publisher 
  var publisher = awspublish.create({ bucket: "www.bastly.com", region: "eu-central-1" });

  // define custom headers 
  var headers = {
     'Cache-Control': 'max-age=315360000, no-transform, public'
   };

  var releaseVersion = JSON.parse(fs.readFileSync('./bower.json')).version;
 
  return gulp.src('./dist/browser/*.*')
    // Rename files and specify directories
    .pipe(rename(function (path) {
        path.dirname += '/releases/browser';
        path.basename = path.basename.replace('bastly', 'bastly-' + releaseVersion);
    }))
 
    // publisher will add Content-Length, Content-Type and headers specified above 
    // If not specified it will set x-amz-acl to public-read by default 
    .pipe(publisher.publish(headers))
 
    // create a cache file to speed up consecutive uploads 
    .pipe(publisher.cache())
 
     // print upload updates to console 
    .pipe(awspublish.reporter());
});

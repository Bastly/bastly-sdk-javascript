var dest = "./build";
var src = './src';

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  browserify: {
    bundleConfigs: [{
      entries: src + '/javascript/browser.js',
      dest: dest,
      outputName: 'browser.js',
      // list of externally available modules to exclude from the bundle
      external: ['underscore']
    }]
  },
  production: {
    jsSrc: dest + '/*.js',
    dest: dest
  }
};

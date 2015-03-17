var dest = "./build";
var src = './src';

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  markup: {
    src: src + "/htdocs/**",
    dest: dest
  },
  browserify: {
    bundleConfigs: [{
      entries: src + '/javascript/page.js',
      dest: dest,
      outputName: 'browser.js',
      // list of externally available modules to exclude from the bundle
      external: ['lodash']
    }]
  },
  production: {
    jsSrc: dest + '/*.js',
    dest: dest
  }
};

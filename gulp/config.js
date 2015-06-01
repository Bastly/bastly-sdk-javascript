var watchFolderBrowser = "./browser";
var dest = "./build/browser";
var src = './src/browser';

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: watchFolderBrowser 
    }
  },
  markup: {
    src: src + "/htdocs/**",
    dest: watchFolderBrowser 
  },
  browserify: {
    bundleConfigs: [{
      entries: src + '/javascript/bastlyBrowser.js',
      watchFolder: watchFolderBrowser,
      productionFolder: dest,
      outputName: 'bastly.js',
      // list of externally available modules to exclude from the bundle
      external: ['lodash','request']
    }]
  }
};

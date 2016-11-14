module.exports = function(config) {
  config.set({
    basePath: '.',
    logLevel: config.LOG_INFO,
    frameworks: ['jasmine'],
    singleRun: false,
    autoWatch: true,
    files: ['*.js'],
    browsers: ['PhantomJS'],
    reporters: ['spec']    
  });
};

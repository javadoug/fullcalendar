// Karma configuration
// Generated on Sun Sep 08 2013 12:57:43 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [

        /* vendor dependencies */
        'lib/**/*.js',

        /* framework files listed in dependency order */
        'src/**/*.css',

        'src/defaults.js',
        'src/main.js',
        'src/Calendar.js',
        'src/Header.js',
        'src/EventManager.js',
        'src/date_util.js',
        'src/util.js',

        'src/basic/MonthView.js',
        'src/basic/BasicWeekView.js',
        'src/basic/BasicDayView.js',
        'src/basic/BasicView.js',
        'src/basic/BasicEventRenderer.js',

        'src/agenda/AgendaWeekView.js',
        'src/agenda/AgendaDayView.js',
        'src/agenda/AgendaView.js',
        'src/agenda/AgendaEventRenderer.js',

        'src/common/View.js',
        'src/common/DayEventRenderer.js',
        'src/common/SelectionManager.js',
        'src/common/SelectionManagerHelper.js',
        'src/common/OverlayManager.js',
        'src/common/CoordinateGrid.js',
        'src/common/HoverListener.js',
        'src/common/HorizontalPositionCache.js',

        // pickup any new files
        'src/**/*.js',

        /* test framework files */
        'tests/lib/jquery.simulate.js',

        /* spec files listed here */
        'tests/specs/SpecHelper.js',
        'tests/specs/**/*[sS]pec.js'
    ],


    // list of files to exclude
    exclude: [
      'src/**/_*.js',
      'src/intro.js',
      'src/outro.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome', 'Firefox', 'Safari'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};

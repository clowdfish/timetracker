// include gulp
var gulp = require('gulp');
var karma = require('karma').server;

// include core modules
var path  = require("path");

// include gulp plug-ins
var sass 		    = require('gulp-ruby-sass'),
    notify		  = require('gulp-notify');


/****************************************************************************************************/
/* SETTING UP DEVELOPMENT ENVIRONMENT                                                               */
/****************************************************************************************************/

// the title and icon that will be used for notifications
var notifyInfo = {
  title: 'Gulp',
  icon: path.join(__dirname, 'gulp.png')
};

// error notification settings for plumber
var plumberErrorHandler = {
  errorHandler: notify.onError({
    title: notifyInfo.title,
    icon: notifyInfo.icon,
    message: "Error: <%= error.message %>"
  })
};

/****************************************************************************************************/
/* BUILD TASKS                                                                                      */
/****************************************************************************************************/

// copy font awesome and compile styles
gulp.task('styles', function() {

  return sass('styles', { style: 'expanded' })
    .on('error', function (err) {
      console.error('Error during scss compilation: ', err.message);
    })
    .pipe(gulp.dest('styles'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

// gulp task suite
gulp.task('live', ['styles'], function() {

  gulp.watch('styles/**/*.scss', ['styles']);
});
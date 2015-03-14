var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {

  return gulp
  .src('./index.js')
  .pipe(browserify({
    standalone: 'duckie'
  }))
  .pipe(rename('duckie.js'))
  .pipe(gulp.dest('./build'))
  .pipe(uglify())
  .pipe(rename({extname: '.min.js'}))
  .pipe(gulp.dest('./build'));
});

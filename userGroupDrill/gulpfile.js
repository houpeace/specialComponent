var isDebug = false;
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var chmod = require('gulp-chmod');
var minifycss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var needSourcemap = isDebug?true:false;

gulp.task("sass", function() {
  var _pipe=sass(['./sass/*.scss'], {
        sourcemap: needSourcemap,
        emitCompileError: false
      })
     .pipe(autoprefixer({
            browsers: ['Firefox >= 1', 'Chrome >= 1', 'ie >= 7'],
            cascade: true
        }))
     .pipe(chmod(777))
     
  if(isDebug){
    _pipe.pipe(sourcemaps.write())
  }else{
    _pipe.pipe(minifycss());
  }
     
  _pipe.pipe(gulp.dest('./css/'));
  return _pipe;
});

gulp.task('watch', function() {
    gulp.watch('./sass/*.scss', ['sass']);
})

gulp.task('default', ['sass','watch']);

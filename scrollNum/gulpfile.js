var isDebug = true;
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var chmod = require('gulp-chmod');
var minifycss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var babel = require("gulp-babel");

var needSourcemap = isDebug?true:false;

gulp.task("sass", function() {
  var _pipe=sass(['./src/sass/*.scss'], {
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
     
  _pipe.pipe(gulp.dest('./dist/css/'));
  return _pipe;
});

gulp.task("es", function () {
  return gulp.src("./src/es/*.js")// ES6 源码存放的路径
    .pipe(babel()) 
    .pipe(gulp.dest("./dist/js")); //转换成 ES5 存放的路径
});
gulp.task("img", function () {
  return gulp.src(["./src/imgs/*.png","./src/imgs/*.jpg"])// 图片存放的路径
    .pipe(gulp.dest("./dist/imgs")); //图片输出的路径
});

gulp.task('watch', function() {
    gulp.watch(['./src/sass/*.scss','./src/sass/**/*.scss'], ['sass']);
    gulp.watch('./src/es/*.js',["es"])
})

gulp.task('default', ['img','sass','es','watch']);

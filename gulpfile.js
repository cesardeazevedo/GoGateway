var gulp        = require('gulp')
  , nodemon     = require('gulp-nodemon')
  , concat      = require('gulp-concat')
  , fixtures    = require('sequelize-fixtures')
  , mocha       = require('gulp-mocha')
  , browserSync = require('browser-sync');

gulp.task('browser-sync', ['nodemon'], function(){
    browserSync.init(null, {
        proxy: "localhost:3000"
      , port: 9000
      , open: false
    });
});

gulp.task('nodemon', function(){
    nodemon({
        script: 'app.js'
      , env : { 'NODE_ENV': 'development'}
    })
    .on('restart', function(){
        setTimeout(function(){
            browserSync.reload({stream: true});
        }, 500);
    });
});

gulp.task('fixtures', function(){
    fixtures.loadFile("config/data/**.yml", require('./app/models'));
});

gulp.task('script', function(){
    return gulp.src('public/js/**/*.js')
    .pipe(concat('app-build.js'))
    .pipe(gulp.dest('public/dest'));
});

gulp.task('watch', function(){

    //Watch jade files
    gulp.watch(['app/views/**/*.jade', 'public/modules/**/*.jade'], function(){
        browserSync.reload('index.html', { stream: true });
    });
    //Watch sass files
    gulp.watch('public/css/*.sass', function(){
        browserSync.reload('bitvagas.css', { stream: true });
    });
    //Watch js files
    gulp.watch('public/js/**/*.js', ['script'], function(){
        browserSync.reload('app-build.js', { stream: true });
    });
});

gulp.task('test', function(){
    process.env.NODE_ENV = 'test';
    return gulp.src('test/*.test.js', { read: false })
    .pipe(mocha({ timeout: 9000 }))
    .once('error', function(){
        process.exit(1);
    }).once('end', function(){
        process.exit();
    });
});

gulp.task('default', [
    'browser-sync',
    'watch'
]);

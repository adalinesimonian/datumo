/* global process */

var gulp = require('gulp')
var path = require('path')
var watch = require('gulp-watch')
var babel = require('gulp-babel')
var plumber = require('gulp-plumber')
var through = require('through2')
var del = require('del')

var libDir = 'lib/'
var srcDir = 'src/**/*.es6'

function clean () {
  return del(libDir + '**/*.js')
}

function handleBabelError (err) {
  console.log(
    err.message.replace(process.cwd(), '').replace(/^(\/|\\)/, '')
  )
  err.codeFrame && console.log(err.codeFrame)
}

function logBabelOutput () {
  return through.obj(function (file, enc, cb) {
    var filePath = path.relative(file.cwd, file.history[0])
    console.log('Processed ' + filePath)
    cb(null, file)
  })
}

function runBabel (stream) {
  return stream
    .pipe(plumber(handleBabelError))
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(gulp.dest(libDir))
    .pipe(logBabelOutput())
}

function runBabelOnce () {
  return runBabel(gulp.src(srcDir))
}

function watchBabel () {
  return runBabel(gulp.src(srcDir).pipe(watch(srcDir)))
}

gulp.task('clean', clean)
gulp.task('babel', gulp.series(clean, runBabelOnce))
gulp.task('babel-watch', gulp.series(clean, watchBabel))

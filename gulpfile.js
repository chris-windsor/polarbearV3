const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const watchify = require("watchify");
const tsify = require("tsify");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");
const gutil = require("gulp-util");
const babelify = require("babelify");

/*
 * Development task
 * */

const watchedBrowserify = watchify(browserify({
  basedir: ".",
  debug: true,
  entries: ["src/Polarbear.ts"],
  cache: {},
  packageCache: {}
})
  .plugin(tsify)
  .transform(babelify, {extensions: [".ts"]}));

const bundle = () => {
  return watchedBrowserify
    .bundle()
    .pipe(source("bundle.dev.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist"));
};

gulp.task("default", bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);

/*
 * Build task
 * */

gulp.task("build", () =>
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/Polarbear.ts"],
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .transform(babelify, {extensions: [".ts"]})
    .bundle()
    .pipe(source("bundle.min.js"))
    .pipe(buffer())
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest("dist"))
);

import del from "del";
import gulp from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import fs from "fs";
import sass from "gulp-sass";
import htmlmin from "gulp-htmlmin";
import nodeSass from "node-sass";
import browserSync from "browser-sync";

sass.compiler = nodeSass;

const server = browserSync.create();

const paths = {
  styles: {
    src: "src/*.scss",
    dest: "dist/"
  },
  templates: {
    src: "src/*.html",
    dest: "dist/"
  }
};

const clean = () => del(["dist"]);

function styles() {
  return gulp
    .src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(paths.styles.dest));
}

function reload(done) {
  server.reload();
  done();
}

function insertStyles() {
  return gulp
    .src(paths.templates.src)
    .pipe(
      replace(/<link href="index.css"[^>]*>/, function(s) {
        var style = fs.readFileSync("./dist/index.css", "utf8");
        return "<style>\n" + style + "\n</style>";
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      rename({
        suffix: "-min"
      })
    )
    .pipe(gulp.dest(paths.templates.dest));
}

function moveOriginalHtml() {
  return gulp.src(paths.templates.src).pipe(gulp.dest(paths.templates.dest));
}

function serve(done) {
  server.init({
    server: {
      baseDir: "./dist/",
      index: "index-min.html"
    }
  });
  done();
}

const watch = () =>
  gulp.watch(
    [paths.styles.src, paths.templates.src],
    gulp.series(styles, insertStyles, moveOriginalHtml, reload)
  );

const dev = gulp.series(
  clean,
  styles,
  insertStyles,
  moveOriginalHtml,
  serve,
  watch
);
export default dev;

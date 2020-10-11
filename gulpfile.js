var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var fs = require("fs");
var babelify = require("babelify");
var livereload = require("gulp-livereload");
var sass = require("gulp-sass");
var handlebars = require("browserify-handlebars");
var imagemin = require('gulp-imagemin');
var imagesConvert = require('gulp-images-convert');
var gm = require("gulp-gm");
var sprity = require("sprity");
var gulpif = require("gulp-if");
var argv = require("minimist")(process.argv.slice(2));
var rename = require("gulp-rename");
var version = require('gulp-version-number');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
//livereload({start: true});

//fast install
//npm i --save-dev browserify vinyl-source-stream babelify gulp-livereload gulp gulp-sass
const versionConfig = {
  'value': '%MDS%',
  'append': {
    'key': 'v',
    'to': [
      {
        'type'  : 'js',
        'files': ['app.js', 'bgm.js', 'sound.js'] // Array [{String|Regex}] of explicit files to append to
      },
      {
        'type'  : 'css',
        'files': ['app.css', 'cards.css', 'main.css'] // Array [{String|Regex}] of explicit files to append to
      }
    ],
  },
};

gulp.task('browserify', function() {
  return browserify('./client/js/main.js', {standalone: "app", debug: false}) // set false when publish
  .transform(handlebars).on("error", errorHandler)
  .transform(babelify)
  .bundle().on("error", errorHandler)
  .pipe(source('app.js').on("error", errorHandler))
  .pipe(buffer())
  .pipe(uglify())
  .on('error', errorHandler)
  .pipe(gulp.dest('./public/build/').on("error", errorHandler));

});

gulp.task('sass', ["generate ability sprites"], function() {
  return gulp.src('./client/scss/main.scss')
  .pipe(sass({
    outputStyle: 'compressed'
  }).on("error", errorHandler))
  .pipe(gulp.dest('./public/build/').on("error", errorHandler))
  .pipe(livereload().on("error", errorHandler));
});

gulp.task("unit tests", function() {
  return browserify('./test/src/mainSpec.js', {standalone: "app", debug: true})
  .transform(babelify)
  .bundle().on("error", errorHandler)
  .pipe(source('spec.js').on("error", errorHandler))
  .pipe(gulp.dest('./test/spec/').on("error", errorHandler));
})

gulp.task("watch", function(done) {
  if(argv.production) return done();
  gulp.watch("./assets/data/*", ["browserify"]);
  gulp.watch("./client/js/**", ["browserify"]);
  gulp.watch("./client/templates/**", ["browserify"]);
  gulp.watch("./client/scss/*", ["sass"]);
  gulp.watch("./client/*.html", ["index"]);
  gulp.watch("./client/json/**", ["index", "browserify"]);
  gulp.watch("./test/src/*", ["unit tests"]);
})


gulp.task("index", function() {
  var indexHtmlStream = gulp.src("./client/index.html")
  .pipe(version(versionConfig))
  .pipe(gulp.dest("./public/"));

  var jsonStream = gulp.src("./client/json/**")
  .pipe(gulp.dest("./public/json/"));

  var appCssStream = gulp.src("./client/css/app.css")
  .pipe(gulp.dest("./public/build"));

  return merge(indexHtmlStream, jsonStream, appCssStream);
})

gulp.task('resize md', function(done) {
  if(fs.existsSync(__dirname + "/assets/cards/md/kitauji/oumae_kumiko.png")) {
    console.log("skip generating md images");
    return done();
  }
  return gulp.src('./assets/original_cards/**/*.png')
  .pipe(gm(function(gmfile) {
    return gmfile.resize(null, 284);
  }))
  .pipe(imagemin())
  .pipe(gulp.dest('./assets/cards/md/'));
});

gulp.task('resize lg', ["resize md"], function(done) {
  if(fs.existsSync(__dirname + "/assets/cards/lg/kitauji/oumae_kumiko.png")) {
    console.log("skip generating lg images");
    return done();
  }
  return gulp.src('./assets/original_cards/**/*.png')
  .pipe(gm(function(gmfile) {
    return gmfile.resize(null, 450);
  }))
  .pipe(imagemin())
  .pipe(gulp.dest('./assets/cards/lg/'));
});

gulp.task("generate card sprites", ["resize lg"], function(done) {
  if(fs.existsSync(__dirname + "/public/build/cards.css")) {
    console.log("skip card sprites generation");
    return done();
  }


  return sprity.src({
    src: "./assets/cards/**/*.png",
    style: "cards.css",
    //"style-type": "scss",
    processor: "css",
    engine: "gm",
    orientation: "binary-tree",
    split: true,
    cssPath: "../../public/build/",
    prefix: "card",
    name: "cards",
    margin: 0
    //template: "./client/scss/_cards.hbs"
  })
  .pipe(gulpif(function (file) {
    return file.path.match(".*\\.png$") != null;
  }, imagesConvert({
    targetType: 'jpg'
  })))
  .pipe(imagemin())
  .pipe(gulpif(function (file) {
    return file.path.match(".*\\.png$") != null;
  }, rename({
    extname: ".PNG"
  })))
  .pipe(gulp.dest("./public/build/"));
})

gulp.task("generate ability sprites", function(done) {
  if(fs.existsSync(__dirname + "/public/build/_ability.scss")) {
    console.log("skip ability sprites generation");
    return done();
  }

  return sprity.src({
    src: "./assets/texture/ability/**/*.png",
    style: "_ability.scss",
    processor: "css",
    engine: "gm",
    orientation: "binary-tree",
    split: true,
    cssPath: "../../public/build/",
    prefix: "ability",
    name: "abilities",
    margin: 0
  })
  .pipe(imagemin())
  .pipe(gulpif(function (file) {
    return file.path.match(".*\\.png$") != null;
  }, rename({
    extname: ".PNG"
  })))
  .pipe(gulp.dest("./public/build/"));
})


gulp.task("default", ["watch", "browserify", "sass", "unit tests", "index", "resize lg", "resize md", "generate card sprites", "generate ability sprites"]);

function errorHandler (errorMessage) {
  throw new Error(errorMessage);
}

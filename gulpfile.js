var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var fs = require("fs");
var babelify = require("babelify");
var livereload = require("gulp-livereload");
var sass = require("gulp-sass");
var handlebars = require("browserify-handlebars");
var gm = require("gulp-gm");
var sprity = require("sprity");
var argv = require("minimist")(process.argv.slice(2));
var version = require('gulp-version-number');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var path = require('path');
var cssConcat = require('gulp-concat-css');
var gulpIf = require('gulp-if');
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

gulp.task('resize', function(done) {
  if(fs.existsSync(__dirname + "/assets/cards/md/kitauji/oumae_kumiko.png")) {
    console.log("skip image resizing");
    return done();
  }
  return gulp.src('./assets/original_cards/**/*.png')
  .pipe(gm(function(gmfile) {
    return gmfile.resize(null, 450);
  }))
  .pipe(gulp.dest('./assets/cards/lg/'))
  .pipe(gm(function(gmfile) {
    return gmfile.resize(null, 284);
  }))
  .pipe(gulp.dest('./assets/cards/md/'));
});

gulp.task("generate card sprites", ["resize"], function(done) {
  if(fs.existsSync(__dirname + "/public/build/cards.css")) {
    console.log("skip card sprites generation");
    return done();
  }

  return getSpriteStreamFromPngFiles(
    "./assets/cards/",
    "cards.css",
    "cards",
    "card",
    "jpg",
    true
  )
  .pipe(gulp.dest("./public/build/"));
})

gulp.task("generate ability sprites", function(done) {
  if(fs.existsSync(__dirname + "/public/build/_ability.scss")) {
    console.log("skip ability sprites generation");
    return done();
  }

  return getSpriteStreamFromPngFiles(
    "./assets/texture/ability/",
    "_ability.scss",
    "abilities",
    "ability",
    "png",
    false
  )
  .pipe(gulp.dest("./public/build/"));
})


gulp.task("default", ["watch", "browserify", "sass", "unit tests", "index", "resize", "generate card sprites", "generate ability sprites"]);

function errorHandler (errorMessage) {
  throw new Error(errorMessage);
}

// Learned from
//   https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
//
function getFolders (dirPath) {
  return fs.readdirSync(dirPath)
    .filter(function (file) {
      return fs.statSync(path.join(dirPath, file)).isDirectory();
    });
}

function getSpriteStreamFromPngFiles (
  inputImageDirPath,
  outputStyleFileName,
  outputImagefileNamePrefix,
  cssPrefix,
  outputImagefileFormat,
  generateSplitSprites
) {
  var folders = getFolders(inputImageDirPath);
  if (folders.length === 0) {
    errorHandler(`No subdirectory in "${inputImageDirPath}".`);
  }

  var tasks = folders.map(function (folder) {
    var filesGlobPath = path.join(inputImageDirPath, folder, "/**/*.png"); // Attention!
    console.log("source glob path: " + filesGlobPath);

    var imageFileNamePrefix = `${outputImagefileNamePrefix}-${folder}`;
    console.log("imageFileNamePrefix: " + imageFileNamePrefix);

    var cssSpritesheetName = `${cssPrefix}-${folder}`;
    console.log("cssSpritesheetName: " + cssSpritesheetName);

    return sprity.src({
      src: filesGlobPath,
      style: `${imageFileNamePrefix}.css`, // Don't care about 'style', these css files will be concatenated with each other.
      name: imageFileNamePrefix,
      prefix: cssSpritesheetName,
      format: outputImagefileFormat,
      processor: "css",
      engine: "gm",
      orientation: "binary-tree",
      cssPath: "../../public/build/",
      split: generateSplitSprites,
      margin: 0
    });
  });

  return merge(tasks).pipe(gulpIf("*.css", cssConcat(
    outputStyleFileName
  )));
}

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var fs = require("fs");
var babelify = require("babelify");
var livereload = require("gulp-livereload");
var sass = require("gulp-sass");
var handlebars = require("browserify-handlebars");
var argv = require("minimist")(process.argv.slice(2));
var version = require('gulp-version-number');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var path = require('path');
var cssConcat = require('gulp-concat-css');
var gulpIf = require('gulp-if');
var spriteSmithMulti = require('gulp.spritesmith-multi');
var sourcemaps = require('gulp-sourcemaps');
var jimp = require('gulp-jimp-wrapper');

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
        'files': ['cards.css', 'main.css'] // Array [{String|Regex}] of explicit files to append to
      }
    ],
  },
};

const jpegSpriteImageQuality = 82; // GraphicsMagick's default value: 75

function browserifyTask() {
  return browserify('./client/js/main.js', {standalone: "app", debug: false}) // set false when publish
  .transform(handlebars).on("error", errorHandler)
  .transform(babelify)
  .bundle().on("error", errorHandler)
  .pipe(source('app.js').on("error", errorHandler))
  .pipe(buffer())
  .pipe(uglify())
  .on('error', errorHandler)
  .pipe(gulp.dest('./public/build/').on("error", errorHandler));

}

function sassTask() {
  return gulp.src('./client/scss/main.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'compressed'
  }).on("error", errorHandler))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/build/').on("error", errorHandler))
  .pipe(livereload().on("error", errorHandler));
}

function unitTestsTask() {
  return browserify('./test/src/mainSpec.js', {standalone: "app", debug: true})
  .transform(babelify)
  .bundle().on("error", errorHandler)
  .pipe(source('spec.js').on("error", errorHandler))
  .pipe(gulp.dest('./test/spec/').on("error", errorHandler));
}

function watchTask(done) {
  if(argv.production) return done();

  livereload({start: true});
  gulp.watch("./assets/data/*", gulp.series(browserifyTask));
  gulp.watch("./client/js/**", gulp.series(browserifyTask));
  gulp.watch("./client/templates/**", gulp.series(browserifyTask));
  gulp.watch("./client/scss/*", gulp.series(sassTask));
  gulp.watch("./client/*.html", gulp.series(indexTask));
  gulp.watch("./client/css/*.css", gulp.series(indexTask));
  gulp.watch("./client/json/**", gulp.parallel(indexTask, browserifyTask));
  gulp.watch("./test/src/*", gulp.series(unitTestsTask));
}


function indexTask() {
  var indexHtmlStream = gulp.src("./client/index.html")
  .pipe(version(versionConfig))
  .pipe(gulp.dest("./public/"));

  var jsonStream = gulp.src("./client/json/**")
  .pipe(gulp.dest("./public/json/"));

  return merge(indexHtmlStream, jsonStream);
}

function resizeTask(done) {
  if(fs.existsSync(__dirname + "/assets/cards/md/kitauji/oumae_kumiko.png")) {
    console.log("skip image resizing");
    return done();
  }
  return gulp.src('./assets/original_cards/**/*.png')
  .pipe(jimp(image => image.resize(-1, 450))) // The value "-1" is equal to the constant "Jimp.AUTO".
  .pipe(gulp.dest('./assets/cards/lg/'))
  .pipe(jimp(image => image.resize(-1, 284))) // Ditto.
  .pipe(gulp.dest('./assets/cards/md/'));
}

function cardSpritesGenerationTask(done) {
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
}

function abilitySpritesGenerationTask(done) {
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
}


var sassTaskDelegate = gulp.series(abilitySpritesGenerationTask, sassTask);
var cardSpritesGenerationTaskDelegate = gulp.series(resizeTask, cardSpritesGenerationTask);

exports.browserify = browserifyTask;
exports.watch = watchTask;
exports.sass = sassTaskDelegate;
exports.unitTests = unitTestsTask;
exports.index = indexTask;
exports.resize = resizeTask;
exports.cardSpritesGeneration = cardSpritesGenerationTaskDelegate;
exports.abilitySpritesGeneration = abilitySpritesGenerationTask;

exports.default = gulp.parallel(
  watchTask,
  browserifyTask,
  sassTaskDelegate,
  unitTestsTask,
  indexTask,
  cardSpritesGenerationTaskDelegate
);

function errorHandler (errorMessage) {
  throw new Error(errorMessage);
}

function getSpriteStreamFromPngFiles (
  inputImageDirPath,
  outputStyleFileName,
  outputImageFileNamePrefix,
  cssPrefix,
  outputImageFileFormat,
  generateSplitSprites
) {
  var filesGlobPath = path.join(inputImageDirPath, "/**/*.png"); // Attention!
  console.log("source glob path: " + filesGlobPath);

  return gulp.src(filesGlobPath)
  .pipe(spriteSmithMulti({
    to: (!generateSplitSprites ? null : function (filePath) {
      return path.dirname(path.relative(inputImageDirPath, filePath))
          .replace(/[\/\\ ]/g, '-');
    }),
    spritesmith: function (options, sprite, icons) {
      options.imgName = `${outputImageFileNamePrefix}-${sprite}.png`; // The format conversion does not work well on macOS.
      // Don't care about 'cssName', these css files will be concatenated with each other.
      options.imgPath = `../../public/build/${outputImageFileNamePrefix}-${sprite}.${outputImageFileFormat}`;
      options.cssSpritesheetName = `${cssPrefix}-${sprite}`;

      // Use the default engine 'pixelsmith'.
      // The argument 'options.imgOpts.quality' is unnecessary, because the output images are always PNG files.

      return options;
    }
  }))
  .pipe(buffer()) // Streaming not supported by gulp-jimp.
  .pipe(gulpIf("*.css",
      cssConcat(
          outputStyleFileName
      ),
      jimp(
          image => image.quality(jpegSpriteImageQuality),
          {
            extname: outputImageFileFormat
          }
      )
  ));
}

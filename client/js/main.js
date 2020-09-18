
var App = require("./client");
let Backbone = require("backbone");

(function main(){
  var app = new App();
  Backbone.history.start();
})();

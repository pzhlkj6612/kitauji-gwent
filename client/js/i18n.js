let Backbone = require("backbone");
let Handlebars = require('handlebars/runtime').default;
let $ = require("jquery");

let i18n = Backbone.Model.extend({
   initialize: function(args) {
       this.lg = args.lg;
       this.returnLgConstant(args.lg);
       this.registerTplHelper();
   },
   registerTplHelper: function() {
       var t = this;
       Handlebars.registerHelper('i18n', function(key, options) {
           var varSubstitution = $.map(options.hash, function(value, index) {
               return value;
           });
           if (key) {
               return new Handlebars.SafeString(t.getKeyVal(key, varSubstitution));
           } else {
               return new Handlebars.SafeString("");
           }
       });
   },
   returnLgConstant: function(lg) {
       var t = this;
       t.lg = lg;
       $.get("js/json/lg/" + lg + ".json", function(data) {
           t.i18n = data;
       });
   },
   getKeyVal: function(key, varSubstitution) {
       return this.loadAndParseData(key, varSubstitution);
   },
   loadAndParseData: function(key, varSubstitution) {
       var t = this;
       if (!this.isNull(varSubstitution) && varSubstitution.length) {
           return t.replaceWord(varSubstitution, t.i18n[key]);
       } else {
           return t.i18n[key];
       }
   },
   isNull: function(data) {
       var isNotValid = false;
       try {
           if (typeof data === "undefined") {
               isNotValid = true;
           } else if (data === null) {
               isNotValid = true;
           }
       } catch (e) {
           isNotValid = true;
       }
       return isNotValid;
   },
   replaceWord: function(array, string) {
       var i = 0,
           t = this,
           l = array.length,
           value = string;
       for (; i < l; i++) {
           value = value.replace("{" + i + "}", array[i]);
       }
       return value;
   }
});

module.exports = i18n;

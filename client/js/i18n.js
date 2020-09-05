let Backbone = require("backbone");
let Handlebars = require('handlebars/runtime').default;
let $ = require("jquery");
let zh = require("../json/locale/zh.json");

let i18n = Backbone.Model.extend({
  initialize: function(locale) {
    this.loadDict(locale);
    this.registerTplHelper();
  },
  registerTplHelper: function() {
    var t = this;
    Handlebars.registerHelper('i18n', function(key, options) {
      var varSubstitution = $.map(options.hash, function(value) {
        return value;
      });
      if (key) {
        return new Handlebars.SafeString(t.getText(key, varSubstitution));
      } else {
        return new Handlebars.SafeString("");
      }
    });
  },
  loadDict: function(locale, opt_callback) {
    var t = this;
    t.locale = locale;
    if (locale === 'zh') {
      t.dict = zh;
      setTimeout(() => {
        opt_callback && opt_callback();
      }, 0);
      return;
    }
    $.get("/public/json/locale/" + locale + ".json", function(data) {
      t.dict = data;
      opt_callback && opt_callback();
    });
  },
  hasText: function(key) {
    return this.dict && this.dict[key];
  },
  getText: function(key, varSubstitution) {
    var t = this;
    if (!t.dict) {
      console.warn("text resource not loaded");
      return "";
    }
    if (!this.isNull(varSubstitution) && varSubstitution.length) {
      return t.replaceWord(varSubstitution, t.dict[key]);
    } else {
      return t.dict[key] || key;
    }
  },
  isNull: function(data) {
    return data == null;
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

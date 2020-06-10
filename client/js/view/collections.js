let Backbone = require("backbone");
let Handlebars = require('handlebars/runtime').default;

let I18n = require("../i18n");
let cardData = require("../../../assets/data/cards");
let abilityData = require("../../../assets/data/abilities");

let Collections = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../../templates/collections.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
  },
  render: function(){
    this.$el.html(this.template(this.user.attributes));
    return this;
  }
});

module.exports = Collections;

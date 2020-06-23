let Backbone = require("backbone");
let cardData = require("../../../assets/data/cards");

let LuckyDrawModal = Backbone.View.extend({
  template: require("../../templates/luckyDraw.handlebars"),
  events: {
    "click .luckyDraw": "close",
  },
  initialize: function(options) {
    this.app = options.app;
    this.card = options.card;
  },
  close: function() {
    this.$el.find(".luckyDraw-background").removeClass("visible");
    this.$el.find(".card-container").removeClass("visible");
    this.$el.find(".dialog").removeClass("visible");
    setTimeout(() => {
      this.remove();
      this.app.initialize();
    }, 1000);
  },
  render() {
    let cardModel = this.toCardModel(this.card);
    this.$el.html(this.template({
      card: cardModel,
      text: i18n.getText("lucky_draw_text", [cardModel._data.name]),
    }));
    setTimeout(() => {
      this.$el.find(".luckyDraw-background").addClass("visible");
      setTimeout(() => {
        this.$el.find(".card-container").addClass("visible");
        this.$el.find(".dialog").addClass("visible");
      }, 1000);
    }, 500);
    return this;
  },
  toCardModel: function(key, count) {
    if (!key) return null;
    return {
      _key: key,
      _data: cardData[key],
      _count: count || 1,
      _showCount: count ? count > 1 : false,
      large: true,
    };
  },
});

module.exports = LuckyDrawModal;

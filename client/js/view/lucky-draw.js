let Backbone = require("backbone");
let cardData = require("../../../assets/data/cards");
let Util = require("../util");

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
    let text;
    if (cardModel._data.faction !== "neutral") {
      text = i18n.getText("lucky_draw_text", [
        i18n.getText(Util.toFactionText(cardModel._data.faction)),
        cardModel._data.name,
        Util.toRarityText(cardModel._data.rarity),
      ]);
    } else {
      text = i18n.getText("lucky_draw_text2", [
        cardModel._data.name,
        Util.toRarityText(cardModel._data.rarity),
      ]);
    }
    this.$el.html(this.template({
      card: cardModel,
      text: text,
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

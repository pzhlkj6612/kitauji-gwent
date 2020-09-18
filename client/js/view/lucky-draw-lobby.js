let Backbone = require("backbone");
let priceData = require("../../../assets/data/prices");
let Notification = require("./notification");
let LuckyDraw = require("./lucky-draw");

let LuckyDrawLobby = Backbone.View.extend({
  template: require("../../templates/lobby.luckyDraw.handlebars"),
  events: {
    "click .quit": "close",
    "click .btnContest": "onBtnClick",
  },
  initialize: function(options) {
    this.app = options.app;
    this.user = options.user;
    this.app.receive("response:luckyDraw", this.onLuckyDrawResponse.bind(this));
    $(".gwent-battle").html(this.el);
    this.render();
  },
  close: function() {
    this.app.goBack();
  },
  render() {
    this.$el.html(this.template({
      userModel: this.user.get("userModel"),
      kyotoPrice: priceData.LUCKY_DRAW_PRICE["kyoto"],
      kansaiPrice: priceData.LUCKY_DRAW_PRICE["kansai"],
      zenkokuPrice: priceData.LUCKY_DRAW_PRICE["zenkoku"],
    }));
    return this;
  },
  onBtnClick: function(e) {
    let $btn = $(e.target).closest(".btnContest");
    if ($btn.hasClass("disabled")) return;
    let scenario = $btn.data("scenario");
    let price = priceData.LUCKY_DRAW_PRICE[scenario];
    if (!price || price > this.user.get("userModel").wallet) {
      new Notification({msgKey: "fee_not_enough"}).render();
      return;
    }
    this.user.get("userModel").wallet -= price;
    this.app.send("request:luckyDraw", {scenario});
  },
  onLuckyDrawResponse: function(data) {
    if (data.newCard && data.newCard.length) {
      let luckyDraw = new LuckyDraw({
        app: this.app,
        gameResult: data,
      });
      $(".container").prepend(luckyDraw.render().el);
    } else {
      new Notification({msgKey: "empty_draw"}).render();
      this.render();
    }
  },
});

module.exports = LuckyDrawLobby;

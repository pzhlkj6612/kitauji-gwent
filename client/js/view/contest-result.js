let Backbone = require("backbone");
const util = require("../util");
let LuckyDraw = require("./lucky-draw");

let ContestResultModal = Backbone.View.extend({
  template: require("../../templates/contestResult.handlebars"),
  events: {
    "click .contestResult": "close",
  },
  initialize: function(options) {
    this.user = options.user;
    this.app = options.app;
    this.gameResult = options.gameResult;
    this.report = this.gameResult.questState.report;
    this.scenario = this.gameResult.questState.scenario;
  },
  close: function() {
    this.$el.find(".contestResult-background").removeClass("visible");
    this.$el.find(".dialog").removeClass("visible");
    setTimeout(() => {
      this.remove();
      if (this.gameResult.newCard && this.gameResult.newCard.length ||
        this.gameResult.coins) {
        let luckyDraw = new LuckyDraw({
          app: this.app,
          gameResult: this.gameResult,
        });
        $(".container").prepend(luckyDraw.render().el);
      } else {
        this.app.reinitialize();
        this.app.goBack();
      }
    }, 1000);
  },
  render() {
    let scenarioText = i18n.getText("scenario_" + this.scenario);
    this.$el.html(this.template({
      schools: this.toSchoolList(this.report),
      title: i18n.getText("result_of", [scenarioText]),
    }));
    setTimeout(() => {
      this.$el.find(".contestResult-background").addClass("visible");
      setTimeout(() => {
        this.$el.find(".dialog").addClass("visible");
      }, 1000);
    }, 500);
    return this;
  },
  toSchoolList: function(report) {
    let schoolList = [];
    for (let price of Object.keys(report)) {
      for (let school of report[price]) {
        schoolList.push({
          name: school,
          price: i18n.getText(util.toPriceLabel(price)),
          className: util.toPriceClassName(price),
          isMe: this.user.get("userModel") &&
            school === this.user.get("userModel").bandName,
        });
      }
    }
    return schoolList;
  },
});

module.exports = ContestResultModal;

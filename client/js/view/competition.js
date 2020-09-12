let Backbone = require("backbone");

let funDecks = require("../../../assets/data/fun-deck");
const util = require("../util");

let Competition = Backbone.View.extend({
  template: require("../../templates/competition/competition.handlebars"),
  initialize: function(app){
    this.app = app;
    this.user = app.user;
    this._compList = [];
    this._selectedComp = null;
    this.listenTo(this.user, "change:serverStatus", this.renderStatus.bind(this));
    this.app.receive("response:competitions", this.onCompsResponse.bind(this));
    this.app.send("request:competitions");
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .button-quit": "close",
    "click .button-create": "makeComp",
    "click .button-refresh": "refresh",
    "click .one-comp": "onCompClick",
  },
  render: function() {
    this.$el.html(this.template({
      comps: this._compList,
    }));
    this.renderStatus();
    return this;
  },
  renderStatus: function() {
    let data = this.user.get("serverStatus");
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  },
  close: function() {
    this.app.lobbyRoute();
  },
  refresh: function() {
    this.app.send("request:competitions");
  },
  makeComp: function() {
    let model = Backbone.Model.extend({});
    let modal = new MakeCompModal({model: new model({
      app: this.app,
      isCompetition: true,
      funDecks: util.getFunDeckList(),
      initialDeckDesc: (funDecks["minami"] || {}).description,
    })});
    $(".container").prepend(modal.render().el);
  },
  onCompClick: function(e) {
    let tr = $(e.target).closest(".one-comp");
    if (!tr || !tr.length) return;
    let compId = tr.data("id");
    this._selectedComp = compId;
    this.app.send("request:competition", {
      compId,
    });
  },
  onCompsResponse: function(comps) {
    this._compList = [];
    let index = 1;
    for (let comp of comps) {
      comp.index = index++;
      this._compList.push(comp);
    }
    this._compList.sort((a, b) => b.startTime - a.startTime);
    this.render();
  },
});

let MakeCompModal = Backbone.Modal.extend({
  template: require("../../templates/room/modal.makeRoom.handlebars"),
  events: {
    "click #btnConfirm": "onBtnClick",
    "change [name=mode]": "onModeChange",
    "change #funDeck": "onDeckChange",
  },
  onModeChange: function(e) {
    if ($(e.target).val() === "funMode") {
      $("#funDeck").parent().removeClass("hidden");
    } else {
      $("#funDeck").parent().addClass("hidden");
    }
  },
  onDeckChange: function(e) {
    let deck = $(e.target).val();
    $("#funDeckDesc").text((funDecks[deck] || {}).description);
  },
  onBtnClick: function() {
    let compName = this.$el.find("#roomName").val();
    let startTime = this.$el.find("#startTime").val();
    let capacity = this.$el.find("#capacity").val();
    let mode = this.$el.find("input[name=mode]:checked").val();
    let deck = this.$el.find("#funDeck").val();
    this.model.get("app").send("request:makeComp", {
      compName,
      startTime,
      capacity,
      mode,
      deck,
    });
    this.remove();
  }
});

module.exports = Competition;

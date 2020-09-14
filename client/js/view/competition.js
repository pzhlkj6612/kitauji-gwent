let Backbone = require("backbone");

let funDecks = require("../../../assets/data/fun-deck");
const util = require("../util");
const Const = require("../const");

let Competition = Backbone.View.extend({
  template: require("../../templates/competition/competition.handlebars"),
  initialize: function(app){
    this.app = app;
    this.user = app.user;
    this._compList = [];
    this._selectedCompId = null;
    this._currentComp = null;
    this.listenTo(this.user, "change:serverStatus", this.renderStatus.bind(this));
    this.app.receive("response:competitions", this.onCompsResponse.bind(this));
    this.app.receive("response:competition", this.onCompResponse.bind(this));
    this.app.send("request:competitions");
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .button-quit": "close",
    "click .button-create": "makeComp",
    "click .button-refresh": "refresh",
    "click .one-comp": "onCompClick",
    "click .btn-comp-enroll,.btn-comp-quit": "onEnrollClick",
    "click .btn-comp-enter": "onEnterClick",
  },
  render: function() {
    for (let comp of this._compList) {
      comp.selected = (comp.id === this._selectedCompId);
    }
    this.$el.html(this.template({
      comps: this._compList,
      comp: this._currentComp,
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
    this._selectedCompId = compId;
    this.app.send("request:competition", {
      compId,
    });
    this.render();
  },
  onCompsResponse: function(comps) {
    comps = comps || [];
    let index = 1;
    comps.sort((a, b) => b.startTime - a.startTime);
    for (let comp of comps) {
      comp.index = index++;
      comp.modeStr = util.toModeStr(comp.mode, comp.funDeck);
      comp.timeStr = util.toTimeStr(new Date(comp.startTime));
    }
    if (comps[0]) {
      this._selectedCompId = comps[0].id;
      this.app.send("request:competition", {
        compId: this._selectedCompId,
      });
    }
    this._compList = comps;
    this.render();
  },
  onCompResponse: function(comp) {
    comp.modeStr = util.toModeStr(comp.mode, comp.funDeck);
    comp.timeStr = util.toTimeStr(new Date(comp.startTime));
    if (comp.state === Const.COMP_STATE_NOT_STARTED) {
      if (comp.hasMe) comp.canQuit = true;
      else comp.canEnroll = true;
    } else if (comp.state === Const.COMP_STATE_STARTED && comp.hasMe) {
      comp.canEnter = true;
    } else {
      comp.readonly = true;
    }
    comp.infoText = i18n.getText(comp.state);
    this._currentComp = comp;
    this.render();
  },
  onEnrollClick: function() {
    if (!this._currentComp) return;
    if (this._currentComp.state === Const.COMP_STATE_NOT_STARTED) {
      this.app.send("request:compEnroll", {
        compId: this._currentComp.id,
        quit: this._currentComp.hasMe,
      });
    }
  },
  onEnterClick: function() {
    if (!this._currentComp) return;
    if (this._currentComp.state === Const.COMP_STATE_STARTED) {
      this.app.treeRoute(this._currentComp.id);
    }
  }
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
    let name = this.$el.find("#roomName").val();
    let startTime = this.$el.find("#startTime").val();
    let capacity = this.$el.find("#capacity").val();
    let mode = this.$el.find("input[name=mode]:checked").val();
    let funDeck = this.$el.find("#funDeck").val();
    this.model.get("app").send("request:makeCompetition", {
      name,
      startTime: new Date(startTime).getTime(),
      capacity,
      mode,
      funDeck,
    });
    this.remove();
  }
});

module.exports = Competition;

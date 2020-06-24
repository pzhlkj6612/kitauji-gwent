let Backbone = require("backbone");
let Modal = require("./modal");

let Lobby = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../../templates/lobby.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this.serverStatus = {};
    this.questProgress = {};

    this.app.receive("update:playerOnline", this.renderStatus.bind(this));
    this.app.receive("response:ranking", this.onRankingResponse.bind(this));
    this.app.send("request:questProgress");

    this.listenTo(this.app.user, "change:serverOffline", this.render);
    this.listenTo(this.app.user, "change:userModel", this.render);
    this.listenTo(this.app.user, "change:questProgress", this.renderQuestProgress.bind(this));

    bgm.setMode("lobby");
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click #startMatchmaking": "startMatchmaking",
    "click #startMatchmakingWithBot": "startMatchmakingWithBot",
    "click .btnCollection": "goToCollection",
    "click .btnContest": "openMatchModal",
    "click #logout": "logout",
    "click #ranking": "onRankingClick",
    "blur .name-input": "changeName",
    "blur .room-name-input": "changeRoomName",
    "change #deckChoice": "setDeck",
    "click .note": "debugNote"
  },
  render: function(){
    this.$el.html(this.template(this.user.attributes));
    this.$el.find("#deckChoice").val(this.user.get("deck")).attr("selected", true);
    $("#locale").val(this.user.get("locale")).attr("selected", true);
    this.renderStatus(this.serverStatus);
    this.renderQuestProgress(this.questProgress);
    return this;
  },
  goToCollection: function() {
    this.app.collectionsRoute();
  },
  logout: function() {
    this.user.logout();
  },
  onRankingClick: function() {
    this.app.send("request:ranking");
  },
  openMatchModal: function(e) {
    let $btn = $(e.target).closest(".btnContest");
    if ($btn.hasClass("disabled")) return;
    let scenario = $btn.data("scenario");
    let title = i18n.getText("scenario_" + scenario);
    let model = Backbone.Model.extend({});
    let modal = new StartMatchModal({model: new model({
      app: this.app,
      title: title,
      scenario: scenario,
    })});
    this.$el.prepend(modal.render().el);
  },
  startMatchmaking: function(){
    this.$el.find(".image-gif-loader").show();
    let roomName = this.$el.find(".room-name-input").val();
    this.app.trigger("startMatchmaking", {roomName});
  },
  startMatchmakingWithBot: function(){
    this.app.trigger("startMatchmakingWithBot");
  },
  setDeck: function(e){
    let val = $(e.target).val();
    this.$el.find("#deckChoice option[value='" + val + "']").attr("selected", "selected")
    if (val === "custom") {
      this.app.collectionsRoute();
      return;
    }
    this.app.trigger("setDeck", val);
  },
  changeName: function(e){
    let name = $(e.target).val();
    this.app.trigger("changeBandName", name);
  },
  renderStatus: function(data){
    this.serverStatus = data;
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  },
  renderQuestProgress: function() {
    this.questProgress = this.user.get("questProgress") || {};
    for (let task of Object.keys(this.questProgress)) {
      let btn = this.$el.find(`.btnContest[data-scenario="${task}"]`);
      if (!btn.length) continue;
      btn.removeClass("disabled");
      btn.find(".progress-text").html(`${this.questProgress[task]}/5`);
    }
  },
  onRankingResponse: function(response) {
    let model = Backbone.Model.extend({});
    let modal = new RankingModal({model: new model({
      myRank: response.myRank || "+∞",
      ranking: response.ranking,
    })});
    this.$el.prepend(modal.render().el);
  },
});

let StartMatchModal = Modal.extend({
  template: require("../../templates/modal.startMatch.handlebars"),
  events: {
    "click #startMatchmakingWithBot2": "startMatchWithBot",
    "click #startMatchmaking2": "startMatch"
  },
  startMatchWithBot: function(e) {
    this.model.get("app").trigger("startMatchmakingWithBot", {
      scenario: this.model.get("scenario"),
    });
  },
  startMatch: function(e) {
    this.$el.find(".image-gif-loader").show();
    let roomName = this.$el.find(".room-name-input").val();
    this.model.get("app").trigger("startMatchmaking", {
      roomName: roomName,
      scenario: this.model.get("scenario"),
    });
  }
});

let RankingModal = Modal.extend({
  template: require("../../templates/modal.ranking.handlebars"),
});

module.exports = Lobby;

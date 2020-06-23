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

    this.app.receive("update:playerOnline", this.renderStatus.bind(this));
    this.app.receive("response:questProgress", this.onQuestProgressResponse.bind(this));
    this.app.send("request:questProgress");

    this.listenTo(this.app.user, "change:serverOffline", this.render);
    this.listenTo(this.app.user, "change:userModel", this.render);
    this.listenTo(this.app.user, "change:name", this.setName);
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .startMatchmaking": "startMatchmaking",
    "click .startMatchmakingWithBot": "startMatchmakingWithBot",
    "click .btnCollection": "goToCollection",
    "click .btnContest": "openMatchModal",
    "blur .name-input": "changeName",
    "blur .room-name-input": "changeRoomName",
    "change #deckChoice": "setDeck",
    "click .note": "debugNote"
  },
  render: function(){
    this.$el.html(this.template(this.user.attributes));
    this.$el.find("#deckChoice").val(this.user.get("deck")).attr("selected", true);
    $("#locale").val(this.user.get("locale")).attr("selected", true);
    return this;
  },
  goToCollection: function() {
    this.app.collectionsRoute();
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
    this.app.trigger("startMatchmaking", roomName);
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
  setName: function(){
    localStorage["userName"] = this.app.user.get("name");
    this.$el.find(".name-input").val(this.app.user.get("name"));
  },
  changeName: function(e){
    let name = $(e.target).val();
    this.app.trigger("changeBandName", name);
  },
  renderStatus: function(data){
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  },
  onQuestProgressResponse: function(progress) {
    for (let task of Object.keys(progress)) {
      let btn = this.$el.find(`.btnContest[data-scenario="${task}"]`);
      if (!btn.length) continue;
      btn.removeClass("disabled");
      btn.find(".progress-text").html(`${progress[task]}/5`);
    }
  },
});

let StartMatchModal = Modal.extend({
  template: require("../../templates/modal.startMatch.handlebars"),
  events: {
    "click .startMatchmakingWithBot": "startMatchWithBot",
    "click .startMatchmaking": "startMatch"
  },
  startMatchWithBot: function(e) {
    this.model.get("app").trigger("startMatchmakingWithBot", {
      scenario: this.model.get("scenario"),
    });
  },
  startMatch: function(e) {
    this.model.get("app").trigger("startMatchmaking", {
      scenario: this.model.get("scenario"),
    });
  }
});

module.exports = Lobby;

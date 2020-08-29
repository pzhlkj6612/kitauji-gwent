let Backbone = require("backbone");
let Modal = require("./modal");
let Notification = require("./notification");
const util = require("../util");

const KANBAN_CHARACTERS = [
  "kanban-kumiko",
  "kanban-ririka",
  "kanban-mizore",
  "kanban-nozomi",
  "kanban-reina",
  "kanban-kanade",
];

let Lobby = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../../templates/lobby.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this.questProgress = {};

    this.app.receive("response:ranking", this.onRankingResponse.bind(this));
    this.app.receive("response:updateUserInfo", this.onUserInfoResponse.bind(this));
    this.app.send("request:questProgress");

    this.listenTo(this.app.user, "change:serverOffline", this.render);
    this.listenTo(this.app.user, "change:userModel", this.render);
    this.listenTo(this.app.user, "change:questProgress", this.renderQuestProgress.bind(this));
    this.listenTo(this.app.user, "change:serverStatus", this.renderStatus.bind(this));

    bgm.setMode("lobby");
    $(".gwent-battle").html(this.el);
    this.render();
    this.fadeIn();
  },
  events: {
    "click #startMatchmaking": "startMatchmaking",
    "click #startMatchmakingWithBot": "startMatchmakingWithBot",
    "click .btnCollection": "goToCollection",
    "click .btnLuckyDraw": "goToLuckyDraw",
    "click .btnReplay": "onReplayClick",
    "change #gameReplayFile": "openReplay",
    "click .btnContest": "onQuestClick",
    "click #username": "onUserClick",
    "click #logout": "logout",
    "click #ranking": "onRankingClick",
    "blur .name-input": "changeName",
    "blur .room-name-input": "changeRoomName",
    "change #deckChoice": "setDeck",
    "click .note": "debugNote"
  },
  fadeIn: function() {
    $(".overlay").remove();
    $(".container").prepend('<div class="overlay row"/>');
    setTimeout(() => {
      $(".overlay").addClass("anim-invisible");
    }, 0);
    setTimeout(() => {
      $(".overlay").addClass("hidden");
    }, 1000);
  },
  render: function(){
    this.$el.html(this.template(this.user.attributes));
    this.$el.find("#deckChoice").val(this.user.get("deck")).attr("selected", true);
    $("#locale").val(this.user.get("locale")).attr("selected", true);
    this.renderKanban();
    this.renderStatus();
    this.renderQuestProgress(this.questProgress);
    return this;
  },
  goToCollection: function() {
    this.app.collectionsRoute();
  },
  goToLuckyDraw: function() {
    this.app.luckyDrawRoute();
  },
  onReplayClick: function() {
    this.$el.find("#gameReplayFile").click();
  },
  openReplay: function(e) {
    let fileList = e.target.files;
    if (!fileList || !fileList.length) return;
    let file = fileList[0];
    let reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let json = event.target.result;
      let valid = false;
      try {
        let data = JSON.parse(json);
        if (util.validateGameRecords(data)) {
          valid = true;
          this.user.initBattle(data);
        }
      } catch (e) {
      }
      if (!valid) {
        new Notification({
          msgKey: "invalid_game_record",
        }).render();
      }
    });
    reader.readAsText(file);
  },
  logout: function() {
    this.user.logout();
  },
  onRankingClick: function() {
    this.app.send("request:ranking");
  },
  onQuestClick: function(e) {
    let $btn = $(e.target).closest(".btnContest");
    if ($btn.hasClass("disabled")) return;
    let scenario = $btn.data("scenario");
    // if the reset button is clicked
    let $reset = $(e.target).closest(".quest-reset");
    let title = i18n.getText("scenario_" + scenario);
    if ($reset.length) {
      this.app.send("request:resetQuest", {scenario: scenario});
      new Notification({
        msgKey: "reset_quest",
        values: [title],
      }).render();
      return;
    }
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
  renderStatus: function(){
    let data = this.app.user.get("serverStatus");
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
      if (this.questProgress[task] > 0) {
        btn.find(".quest-reset").removeClass("hidden");
      } else {
        btn.find(".quest-reset").addClass("hidden");
      }
    }
  },
  renderKanban: function() {
    let character = KANBAN_CHARACTERS[(Math.random() * KANBAN_CHARACTERS.length) | 0];
    this.$el.find(".kanban").addClass(character);
  },
  onRankingResponse: function(response) {
    let userModel = this.app.user.get("userModel");
    let ranking = response.ranking;
    let hasMe = false;
    ranking.forEach(r => {
      if (r.username === userModel.username) {
        hasMe = true;
        r.isMe = true;
      }
    });
    let me = JSON.parse(JSON.stringify(userModel));
    me.rank = response.myRank == null ? "+∞" : response.myRank + 1;
    let model = Backbone.Model.extend({});
    let modal = new RankingModal({model: new model({
      ranking,
      noMe: !hasMe,
      me: me,
    })});
    this.$el.prepend(modal.render().el);
  },
  onUserClick: function() {
    let modal = new UserInfoModal({model: this.app.user});
    this.$el.prepend(modal.render().el);
  },
  onUserInfoResponse: function(response) {
    if (response.user) {
      this.app.user.set("userModel", response.user);
    }
    this.app.getCurrentView().render();
  }
});

let StartMatchModal = Modal.extend({
  template: require("../../templates/modal.startMatch.handlebars"),
  events: {
    "click #startMatchmakingWithBot2": "startMatchWithBot",
    "click #startMatchmaking2": "startMatch"
  },
  cancel: function() {
    this.model.get("app").send("request:matchmaking", {
      cancel: true,
    });
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

let UserInfoModal = Modal.extend({
  template: require("../../templates/modal.user.handlebars"),
  events: {
    "click #btnSave": "saveUserInfo",
  },
  initialize: function() {
    setTimeout(() => {
      this.$el.find("#initialDeck").val(this.model.get("userModel").initialDeck);
    }, 0);
  },
  saveUserInfo: function() {
    let bandName = this.$el.find("#bandName").val();
    if (!bandName || !bandName.length) return;
    this.model.get("app").send("request:updateUserInfo", {
      bandName,
    });
  }
});

module.exports = Lobby;

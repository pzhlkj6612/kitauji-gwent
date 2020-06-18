let Backbone = require("backbone");

let Lobby = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../templates/lobby.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;

    this.app.receive("update:playerOnline", this.renderStatus.bind(this));

    this.listenTo(this.app.user, "change:serverOffline", this.render);
    this.listenTo(this.app.user, "change:name", this.setName);
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .startMatchmaking": "startMatchmaking",
    "click .startMatchmakingWithBot": "startMatchmakingWithBot",
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
  }
});

module.exports = Lobby;

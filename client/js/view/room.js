let Backbone = require("backbone");

let Const = require("../const");
let Util = require("../util");
let funDecks = require("../../../assets/data/fun-deck");

let Room = Backbone.View.extend({
  template: require("../../templates/room/room.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this._roomList = [];
    this.app.receive("response:rooms", this.onRoomsResponse.bind(this));
    this.app.send("request:rooms");
    // this.app.send("request:userCollections");
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .button-quit": "close",
    "click .button-create": "makeRoom",
    "click .button-refresh": "refresh",
    "click .one-room .button-join": "onRoomClick",
  },
  render: function() {
    this.$el.html(this.template({
      rooms: this._roomList,
    }));
    return this;
  },
  close: function() {
    this.app.send("request:matchmaking", {
      cancel: true,
    });
    this.app.lobbyRoute();
  },
  refresh: function() {
    this.app.send("request:rooms");
  },
  makeRoom: function() {
    let model = Backbone.Model.extend({});
    let modal = new MakeRoomModal({model: new model({
      app: this.app,
      funDecks: this.getFunDeckList(),
      initialDeckDesc: (funDecks["minami"] || {}).description,
    })});
    $(".container").prepend(modal.render().el);
  },
  onRoomClick: function(e) {
    let tr = $(e.target).closest(".one-room");
    if (!tr || !tr.length) return;
    let roomId = tr.data("id");
    this.app.send("request:matchmaking", {
      roomName: roomId,
    });
    this.app.send("request:rooms");
  },
  onRoomsResponse: function(rooms) {
    this._roomList = [];
    for (let key of Object.keys(rooms)) {
      let room = rooms[key];
      room.modeStr = i18n.getText(room.mode);
      if (room.deck) {
        room.modeStr += `(${funDecks[room.deck].name})`;
      }
      room.isMe = (room.players || []).includes(this.user.get("userModel").username);
      room.playing = room.status === Const.ROOM_STATE_PLAYING;
      this._roomList.push(room);
    }
    this._roomList.sort((a, b) => b.updateAt - a.updateAt);
    let index = 1;
    for (let room of this._roomList) {
      room.index = index++;
    }
    this.render();
  },
  getFunDeckList: function() {
    let list = [];
    for (let key of Object.keys(funDecks)) {
      list.push({
        key,
        name: funDecks[key].name,
      });
    }
    return list;
  },
});

let MakeRoomModal = Backbone.Modal.extend({
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
    let roomName = this.$el.find("#roomName").val();
    let mode = this.$el.find("input[name=mode]:checked").val();
    let deck = this.$el.find("#funDeck").val();
    this.model.get("app").send("request:makeRoom", {
      roomName,
      mode,
      deck,
    });
    this.remove();
  }
});

module.exports = Room;

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
    "click .one-room": "onRoomClick",
  },
  render: function() {
    this.$el.html(this.template({
      rooms: this._roomList,
    }));
    return this;
  },
  close: function() {
    this.app.lobbyRoute();
  },
  makeRoom: function() {
    let model = Backbone.Model.extend({});
    let modal = new MakeRoomModal({model: new model({
      app: this.app,
      funDecks: this.getFunDeckList(),
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
      this._roomList.push(rooms[key]);
    }
    this._roomList.sort((a, b) => b.createAt - a.createAt);
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
  },
  onBtnClick: function() {
    let roomName = this.$el.find("#roomName").val();
    //TODO: how to select element by name?
    let mode = this.$el.find("#mode").val();
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

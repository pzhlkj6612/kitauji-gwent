let Backbone = require("backbone");

let Const = require("../const");
let Util = require("../util");

let Room = Backbone.View.extend({
  template: require("../../templates/room/room.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this._roomList = [];
    this.app.receive("response:rooms", this.onRoomsResponse.bind(this));
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
    })});
    $(".container").prepend(modal.render().el);
  },
  onRoomClick: function() {
    //TODO: join room
  },
  onRoomsResponse: function(rooms) {
    this._roomList = [];
    for (let key of Object.keys(rooms)) {
      this._roomList.push(rooms[key]);
    }
    this._roomList.sort((a, b) => b.createAt - a.createAt);
    this.render();
  },
});

let MakeRoomModal = Backbone.Modal.extend({
  template: require("../../templates/room/modal.makeRoom.handlebars"),
  events: {
    "click #btnConfirm": "onBtnClick",
  },
  onBtnClick: function() {
    let roomName = this.$el.find("#roomName").val();
    this.model.get("app").send("request:makeRoom", {
      roomName,
    });
    this.remove();
  }
});

module.exports = Room;

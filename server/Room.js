var shortid = require("shortid");
var Battle = require("./Battle");
const Const = require("./Const");
const Auth = require("./service/auth");

var Room = (function(){
  var Room = function(opt_roomKey){
    if(!(this instanceof Room)){
      return (new Room(opt_roomKey));
    }
    /**
     * constructor here
     */

    var self = this;
    this._id = opt_roomKey || shortid.generate();
    this._roomKey = opt_roomKey;
    this._users = [];
    this._audience = [];
    this._ready = {};
    //this.socket = scServer.global;


    //console.log("room created: " + this.getID());
  };
  var r = Room.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r.MAX_USER = 2;
  r._users = null;
  r._id = null;
  r._battle = null;
  r._ready = null;
  r._channel = null;

  r.getID = function(){
    return this._id;
  }

  r.join = function(user){
    if(this._users.length >= 2) return;
    this._users.push(user);
    user.addRoom(this);
    user.socket.join(this.getID());
    // user.send("response:joinRoom", this.getID());

    if(!this.isOpen()){
      this.initBattle();
    }
  }

  r.addAudience = function(user) {
    if (!Auth.isAdmin(user.getUserModel().username) &&
      this._audience.length >= Const.ROOM_MAX_AUDIENCE) {
      user.send("notification", {msgKey: "msg_max_audience"});
      return;
    }
    this._audience.push(user);
    user.socket.join(this.getID());
    user.send("init:battle", {
      // audience see p1's view by default
      side: "p1",
      foeSide: "p2",
      roomId: this.getID(),
      isWatching: true,
    });
    this._battle && this._battle.updateAudience(user);
  }

  r.isOpen = function(){
    return !(this._users.length >= 2);
  }

  r.getPlayers = function(){
    return this._users;
  }

  r.rejoin = function(user) {
    var side = "p2";
    var foeSide = "p1";
    var i = 1;
    if(user.getID() === this._users[0].getID()){
      side = "p1";
      foeSide = "p2";
      i = 0;
    }
    this._users[i].send("room:rejoin", {
      side: side,
      foeSide: foeSide,
      roomId: this.getID(),
      withBot: this._users[1-i] && this._users[1-i].isBot(),
    });
    user.socket.join(this.getID());
    if (this._battle) {
      var battleSide = this._battle.getBattleSide(side);
      // may rejoin before battle init...
      if (!battleSide) {
        console.warn("user rejoin before battle init: ", user.getUserModel());
      }
      if (battleSide && battleSide.isReDrawing()) {
        battleSide.finishReDraw();
      }
      this._battle.userReconnect(side);
    }
  }

  r.initBattle = function(){
    this._battle = Battle(this._id, this._users[0], this._users[1], this._audience, io);
    this._users[0].send("init:battle", {
      side: "p1",
      foeSide: "p2",
      roomId: this.getID(),
      withBot: this._users[1].isBot(),
    });
    this._users[1].send("init:battle", {
      side: "p2",
      foeSide: "p1",
      roomId: this.getID(),
      withBot: this._users[0].isBot(),
    });
  }

  r.setReady = function(user, b){
    if (this._battle.isStarted()) {
      console.warn("game already started, user rejoin");
      this._battle.update();
      return;
    }
    b = typeof b == "undefined" ? true : b;
    this._ready[user.getID()] = b;
    if(this.bothReady()){
      this._battle.init();
    }

  }

  r.bothReady = function(){
    return !!this._ready[this._users[0].getID()] && !!this._ready[this._users[1].getID()];
  }

  r.connecting = function(user) {
    var p = "p2";
    if (user.getID() === this._users[0].getID()) {
      p = "p1";
    }
    if (this._battle) {
      this._battle.userConnecting(p);
    }
  }

  r.leave = function(user){
    var p = "p2";
    var i = 1;
    if(user.getID() === this._users[0].getID()){
      p = "p1";
      i = 0;
    }

    this._users.splice(i, 1);

    if(this._battle){
      this._battle.userLeft(p);
    }

    if(!this.hasUser()) {
      connections.roomCollection[this.getID()] = null;
      matchmaking.updateRoom(this._roomKey, {
        status: Const.ROOM_STATE_IDLE,
      });
    } else {
      let foe = this._users[0];
      if (foe.isBot()) {
        foe.leaveRoom();
      }
    }
  }

  r.hasUser = function() {
    return this._users.length;
  }


  return Room;
})();

module.exports = Room;
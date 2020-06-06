var User = (function(){
  var User = function(socket){
    if(!(this instanceof User)){
      return (new User(socket));
    }
    /**
     * constructor here
     */


    this.socket = socket;
    this._rooms = [];
    this._id = socket.id;
    this.generateName();
    this.sendInit();

    this._events();
  };
  var r = User.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */

  r._id = null;
  r._name = null;
  r._rooms = null;
  r._roomName = null;
  r._inQueue = false;
  r.socket = null;
  r.disconnected = false;
  r._battleSide = null;
  r._waitingSeq = 0;

  r.isBot = function() {
    return false;
  }

  r.getID = function(){
    return this._id;
  }

  r.sendInit = function() {
    this.send("user:init", {
      connId: this._id
    });
  }

  r.send = function(event, data, room){
    room = room || null;
    data = data || null;
    if(!room){
      this.socket.emit(event, data);
    }
    else {
      this.socket.to(room).emit(event, data);
    }
  }

  r.generateName = function(){
    var name = "Guest" + (((Math.random() * 8999) + 1000) | 0);
    this._name = name;
    return name;
  }

  r.setName = function(name) {
    name = name.slice(0, 20);
    console.log("user name changed from %s to %s", this._name, name);
    this._name = name;
  }

  r.getName = function() {
    return this._name;
  }

  r.getRoom = function() {
    return this._rooms[0];
  }

  r.setDeck = function(deck) {
    //console.log("set deck: ", deck);
    this._deck = deck;
  }

  r.getDeck = function() {
    return this._deck;
  }

  r.addRoom = function(room) {
    this._rooms.push(room);
  }

  r.reconnect = function(socket) {
    this.disconnected = false;
    this.socket = socket;
    this._events();
    this._battleSide && this._battleSide.rejoin(socket);
    this.getRoom() && this.getRoom().rejoin(this);
  }

  r.leaveRoom = function() {
    var self = this;
    this._rooms.forEach(function(room) {
      room.leave(self);
    });
    this._rooms = [];
  }

  r.connecting = function() {
    let room = this.getRoom();
    if (room) {
      room.connecting(this);
    }
  }

  r.waitForReconnect = function() {
    this.disconnected = true;
    this.connecting();
    if (this._rooms.length === 0 || this.getRoom().hasUser() === 1) {
      // not in game, or foe has left, disconnect immediately
      this.disconnect();
      return;
    }
    this._waitingSeq++;
    let waitingSeq = this._waitingSeq;
    // wait for 30s
    setTimeout(() => {
      if (waitingSeq !== this._waitingSeq) return;
      if (this.disconnected) {
        this.disconnect();
      }
    }, 30000);
  }

  r.disconnect = function() {
    connections.remove(this);
    matchmaking.removeFromQueue(this, this._roomName);

    this.leaveRoom();
    console.log("user ", this.getName(), " disconnected");
  }

  r.setBattleSide = function(battleSide) {
    this._battleSide = battleSide;
  }

  r._events = function() {
    var socket = this.socket;
    var self = this;

    socket.on("request:name", function(data){
      if(data && data.name){
        self.setName(data.name);
      }
      socket.emit("response:name", {name: self.getName()});
    })

    socket.on("request:matchmaking:bot", function() {
      if(self._inQueue) return;
      matchmaking.findBotOpponent(self);
    });

    socket.on("request:matchmaking", function(data) {
      if(self._inQueue) return;
      self._roomName = data.roomName;
      matchmaking.findOpponent(self, data.roomName);
    });

    socket.on("request:gameLoaded", function(data){
      //console.log(data);
      connections.roomCollection[data._roomID].setReady(self);
    })

    socket.on("set:deck", function(data) {
      //console.log(data);
      if(data && data.deck){
        self.setDeck(data.deck);
      }
    })

  }

  return User;
})();

module.exports = User;
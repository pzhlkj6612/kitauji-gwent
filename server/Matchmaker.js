var HandWrittenBot = require("./HandWrittenBot");
var Const = require("./Const");

/**
 * Special logic for these room:
 * find opponent in same room first, then other room.
 */
const SPECIAL_ROOMS = [
  Const.ROOM_KYOTO,
  Const.ROOM_KANSAI,
  Const.ROOM_ZENKOKU,
];

var Matchmaker = (function(){
  var Matchmaker = function(){
    if(!(this instanceof Matchmaker)){
      return (new Matchmaker());
    }
    /**
     * constructor here
     */

    this._connections = connections;
    this._queue = [];
    this._queueByRoom = {};

  };
  var r = Matchmaker.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */

  r._queue = null;
  r._queueByRoom = null;
  r._connections = null;

  r.removeFromQueue = function(user, opt_roomName){
    let queue = this._queue;
    if (opt_roomName) {
      queue = this._queueByRoom[opt_roomName];
    }
    for(var i = 0; i < queue.length; i++) {
      var u = queue[i];
      if(u.getID() === user.getID()) {
        user._inQueue = false;
        return queue.splice(i, 1);
      }
    }
  }

  r.findBotOpponent = function(user) {
    var c = connections;
    var room = Room();
    c.roomCollection[room.getID()] = room;
    room.join(user);
    var bot = HandWrittenBot(user); // TODO
    room.join(bot);
    user._inQueue = false;
    return room;
  }

  r.findOpponent = function(user, opt_roomName){
    var c = connections;

    var found = this._checkForOpponent(opt_roomName);

    if(found){

      var room = Room();
      c.roomCollection[room.getID()] = room;
      room.join(user);
      room.join(found);
      user._inQueue = false;
      found._inQueue = false;
      return room;
    }

    this._getInQueue(user, opt_roomName);
  }

  r._getInQueue = function(user, opt_roomName){
    if (opt_roomName) {
      this._queueByRoom[opt_roomName] = this._queueByRoom[opt_roomName] || [];
      this._queueByRoom[opt_roomName].push(user);
      user._inQueue = true;
      return;
    }
    //console.log(user.getName() + " joined in queue");
    this._queue.push(user);
    user._inQueue = true;
  }


  r._checkForOpponent = function(opt_roomName){
    let queue = this._queue;
    if (opt_roomName) {
      queue = this._queueByRoom[opt_roomName];
    }
    if ((!queue || !queue.length) && SPECIAL_ROOMS.includes(opt_roomName)) {
      queue = SPECIAL_ROOMS.find(room => {
        this._queueByRoom[room] && this._queueByRoom[room].length;
      });
    }
    // fall back to default queue if all special rooms are empty
    if(!queue || !queue.length) {
      queue = this._queue;
    };
    var foe = queue.splice(0, 1)[0];
    foe._inQueue = false;
    return foe;
  }


  return Matchmaker;
})();

module.exports = Matchmaker;

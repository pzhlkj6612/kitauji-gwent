var shortid = require("shortid");
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

const NAME_PREFIX = [
  "京都府立",
  "宇治市立",
];
const NAME_NUM_PREFIX = [
  "第一",
  "第二",
  "第三",
];
const NAME_NUM_SUFFIX = [
  "儿童公园",
  "人民医院",
  "综合活动中心",
];
const NAME_SUFFIX = [
  "文化会馆",
  "陆上竞技场",
];

let ROOM_NAMES = [];
for (let prefix of NAME_PREFIX) {
  for (let numPrefix of NAME_NUM_PREFIX) {
    for (let numSuffix of NAME_NUM_SUFFIX) {
      ROOM_NAMES.push(prefix + numPrefix + numSuffix);
    }
  }
  for (let nameSuffix of NAME_SUFFIX) {
    ROOM_NAMES.push(prefix + nameSuffix);
  }
}

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
    this._userRooms = {};
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
    if (!queue) queue = this._queue;
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

  r.makeRoom = function(user, data) {
    let id = shortid.generate();
    let room = {
      id,
      roomName: data.roomName || this._generateRoomName(),
      creator: user.getUserModel().username,
      createAt: new Date().getTime(),
    };
    this._userRooms[id] = room;
    this.findOpponent(user, id);
    return id;
  }

  r.getRooms = function() {
    return this._userRooms;
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
      // fall back to default queue if all special rooms are empty
      if(!queue || !queue.length) queue = this._queue;
    }
    if(!queue || !queue.length) return null;
    var foe = queue.splice(0, 1)[0];
    foe._inQueue = false;
    return foe;
  }

  r._generateRoomName = function() {
    return ROOM_NAMES[(Math.random() * ROOM_NAMES.length) | 0];
  }

  return Matchmaker;
})();

module.exports = Matchmaker;

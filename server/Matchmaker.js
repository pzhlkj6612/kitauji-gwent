var shortid = require("shortid");
var HandWrittenBot = require("./HandWrittenBot");
var Const = require("./Const");
const CompetitionService = require("./service/competitionService");

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
    this._competitionRooms = {};
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

  r.removeFromQueue = function(user, opt_roomKey){
    let queue = this._queue;
    if (opt_roomKey) {
      queue = this._queueByRoom[opt_roomKey];
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

  r.findBotOpponent = function(user, botOptions) {
    var c = connections;
    var room = Room();
    c.roomCollection[room.getID()] = room;
    room.join(user);
    var bot = HandWrittenBot(user, botOptions);
    room.join(bot);
    user._inQueue = false;
    return room;
  }

  r.findOpponent = function(user, opt_roomKey){
    var c = connections;

    var found = this._checkForOpponent(opt_roomKey);

    if(found){
      if (this.getRoomById(opt_roomKey)) {
        this.updateRoom(opt_roomKey, {
          status: Const.ROOM_STATE_PLAYING,
        });
        this._updateRoomPlayers(opt_roomKey, [found, user]);
      }
      var room = Room(opt_roomKey);
      c.roomCollection[room.getID()] = room;
      room.join(user);
      room.join(found);
      user._inQueue = false;
      found._inQueue = false;
      return room;
    }

    this._getInQueue(user, opt_roomKey);
  }

  r.watchGame = function(user, roomKey) {
    let gameRoom = connections.roomCollection[roomKey];
    if (!gameRoom) return;
    gameRoom.addAudience(user);
  }

  r.makeRoom = function(user, data) {
    let room = this._makeRoom(user, data);
    let id = room.id;
    this._userRooms[id] = room;
    this._evictOldestRoom();
    this.findOpponent(user, id);
    return id;
  }

  r.makeOrJoinCompetitionRoom = function(user, comp, nodeIndex, botOptions) {
    let id = `${comp.id}#${nodeIndex}`;
    if (!this._competitionRooms[id]) {
      let room = this._makeRoom(user, {
        id,
        mode: comp.mode,
        deck: comp.funDeck,
      });
      this._competitionRooms[id] = room;
    }
    if (botOptions) {
      this.findBotOpponent(user, botOptions);
    } else {
      this.findOpponent(user, id);
    }
    return id;
  }

  r.endGame = async function(roomId, userModel, gameState) {
    if (gameState.isDraw) {
      // if it's a draw
      return;
    }
    if (!roomId) return;
    if (!this._isCompRoom(roomId)) return;
    let [compId, nodeIndex] = roomId.split("#");
    await CompetitionService.getInstance().endGame(
      userModel.username, compId, Number(nodeIndex), gameState.isWin);
  }

  r.getRoomById = function(id) {
    let room = this._userRooms[id];
    if (room) {
      return room;
    }
    return this._competitionRooms[id];
  }

  r.getRooms = function() {
    for (let key of Object.keys(this._userRooms)) {
      let userRoom = this._userRooms[key];
      if (userRoom.status === Const.ROOM_STATE_PLAYING) continue;
      this._updateRoomPlayers(key, this._queueByRoom[key] || []);
    }
    return this._userRooms;
  }

  /**
   * Put room info in competition tree
   */
  r.getRoomsForCompetition = function(compId, tree) {
    for (let node of tree) {
      let roomId = `${compId}#${node.nodeIndex}`;
      let room = this.getRoomById(roomId);
      if (!room) continue;
      if (room.status !== Const.ROOM_STATE_PLAYING) {
        this._updateRoomPlayers(roomId, this._queueByRoom[roomId] || []);
      }
      node.roomStatus = room.status;
      node.readyPlayers = room.players;
    }
  }

  r.updateRoom = function(roomId, data) {
    let room = this.getRoomById(roomId);
    if (!room) return;
    room.updateAt = new Date().getTime();
    room.status = data.status || room.status;
  }

  r._makeRoom = function(user, data) {
    let id = data.id || shortid.generate();
    let mode = data.mode || Const.DEFAULT_MODE;
    return {
      id,
      roomName: data.roomName || this._generateRoomName(),
      mode,
      deck: mode === Const.FUN_MODE ? (data.deck || Const.DEFAULT_FUN_DECK) : null,
      status: Const.ROOM_STATE_IDLE,
      creator: user.getUserModel().username,
      updateAt: new Date().getTime(),
      type: data.type,
    };
  }

  r._isCompRoom = function(roomId) {
    return !!(this._competitionRooms[roomId]);
  }

  r._updateRoomPlayers = function(roomId, users) {
    let room = this.getRoomById(roomId);
    if (!room) return;
    room.playerNum = users.length;
    room.players = users.map(user => user.getUserModel().username);
    room.playerStr = users.map(user => {
      let model = user.getUserModel();
      return `${model.bandName}(${model.username})`;
    }).join(", ");

  }

  r._evictOldestRoom = function() {
    if (Object.keys(this._userRooms).length <= Const.USER_ROOM_MAX) {
      return;
    }
    let oldest;
    for (let key of Object.keys(this._userRooms)) {
      let room = this._userRooms[key];
      if (room.status === Const.ROOM_STATE_PLAYING) continue;
      if (!oldest || room.updateAt < this._userRooms[oldest].updateAt) {
        oldest = key;
      }
    }
    if (oldest) {
      delete this._userRooms[oldest];
    }
  }

  r._getInQueue = function(user, opt_roomKey){
    if (opt_roomKey) {
      this._queueByRoom[opt_roomKey] = this._queueByRoom[opt_roomKey] || [];
      this._queueByRoom[opt_roomKey].push(user);
      user._inQueue = true;
      return;
    }
    //console.log(user.getName() + " joined in queue");
    this._queue.push(user);
    user._inQueue = true;
  }


  r._checkForOpponent = function(opt_roomKey){
    let queue = this._queue;
    if (opt_roomKey) {
      queue = this._queueByRoom[opt_roomKey];
    }
    if ((!queue || !queue.length) && SPECIAL_ROOMS.includes(opt_roomKey)) {
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

var Cache = require("./dao/cache");
var Const = require("./Const");
var LuckyDraw = require("./LuckyDraw");
var Quest = require("./Quest");
const deck = require("../assets/data/deck");

var User = (function(){
  var User = function(socket, token){
    if(!(this instanceof User)){
      return (new User(socket, token));
    }
    /**
     * constructor here
     */


    this.socket = socket;
    this.token = token;
    this.userModel = null;
    this._rooms = [];
    this._id = socket.id;
    this.init();

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
  r._scenario = null;
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

  r.init = async function() {
    let valid = await this.validateToken();
    this.send("user:init", {
      connId: this._id,
      needLogin: !valid,
    });
  }

  /**
   * {
   *  username: username,
   *  expireTime: timestamp,
   * }
   */
  r.validateToken = async function() {
    if (!this.token) return false;
    try {
      let data = JSON.parse(new Buffer(this.token, "base64").toString());
      if (data.expireTime < new Date().getTime()) {
        return false;
      }
      this.userModel = await db.findUserByName(data.username);
      if (!this.userModel) {
        this.disconnect();
        return false;
      }
      return true;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  r.generateToken = function() {
    let data = {
      username: this.userModel.username,
      expireTime: new Date().getTime() + 864000 * 1000, // 10 days
    }
    return new Buffer(JSON.stringify(data)).toString("base64");
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

  r.setName = function(name) {
    name = name.slice(0, 20);
    console.log("user name changed from %s to %s", this._name, name);
    this._name = name;
  }

  r.getName = function() {
    return this.userModel ? this.userModel.bandName : "anonymous";
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

  r.isIdle = function() {
    return this._rooms.length === 0;
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

  /**
   * Record game state, etc.
   */
  r.endGame = async function(isWin, foe) {
    let result = {};
    if (!this._scenario) return result;

    // update quest progress
    let questState = Quest.updateQuestProgress(this.userModel.username, this._scenario, {
      foeName: foe.getName(),
      isWin,
    });
    result["questState"] = questState;
    if (questState.completed) {
      await Quest.onQuestCompleted(this.userModel.username, this._scenario, questState.success);
    }

    // do lucky draw based on result
    result["newCard"] = await this.luckyDrawAfterGame_(isWin, foe, questState);
    return result;
  }

  r.luckyDrawAfterGame_ = async function(isWin, foe, questState) {
    if (!isWin) return [];
    let scenario = this._scenario;
    let possibility = 0;
    if (foe.isBot()) possibility = 0.4;
    else possibility = 0.6;
    if (questState.success) {
      possibility = 1;
      scenario = Quest.getNextScenario(scenario);
    }
    if (Math.random() > possibility) return [];
    let deck = this.userModel.initialDeck;
    if (await Cache.getInstance().getCondition(this.userModel.username, Const.COND_UNLOCK_ALL_DECK)) {
      let {faction, cards} = await LuckyDraw.getInstance().drawPreferOtherDeck(1, scenario, this.userModel.username, deck);
      await db.addCards(data.username, faction, cards);
      return cards;
    }
    let cards = await LuckyDraw.getInstance().draw(1, scenario, this.userModel.username, deck);
    await db.addCards(data.username, faction, cards);
    return cards;
  }

  r._events = function() {
    var socket = this.socket;
    var self = this;

    socket.on("request:login", async function(data) {
      let userModel = await db.findUserByName(data.username);
      let msg, success = false, token;
      if (!userModel) {
        msg = "Cannot find user!";
      } else if (data.password !== userModel.password) {
        // dangerous
        msg = "Wrong password!";
      } else {
        msg = "Login success!";
        success = true;
        self.userModel = userModel;
        token = self.generateToken();
      }
      socket.emit("response:login", {success: success, token: token});
      socket.emit("notification", {message: msg});
    });

    socket.on("request:signin", async function(data) {
      let exist = await db.findUserByName(data.username);
      if (exist) {
        socket.emit("response:signin", {success: false});
        socket.emit("notification", {message: "User existed"});
        return;
      }
      data.bandName = data.bandName || "北宇治高等学校";
      data.initialDeck = data.initialDeck || "kitauji";
      await db.addUser(data);
      self.userModel = await db.findUserByName(data.username);

      // give initial 10 cards
      let cards = await LuckyDraw.getInstance().draw(10, Const.SCENARIO_KYOTO, data.username, data.initialDeck);
      await db.addCards(data.username, data.initialDeck, cards);

      socket.emit("response:signin", {
        success: true,
        token: self.generateToken(),
        model: self.userModel,
        initialCards: cards,
      });
    });

    socket.on("request:name", function(data){
      // if(data && data.name){
      //   self.setName(data.name);
      // }
      // socket.emit("response:name", {name: self.getName()});
    })

    socket.on("request:matchmaking:bot", function(data) {
      if(self._inQueue) return;
      //TODO: removeFromQueue
      self._scenario = data.scenario;
      matchmaking.findBotOpponent(self);
    });

    socket.on("request:matchmaking", function(data) {
      if(self._inQueue) return;
      self._roomName = data.roomName;
      self._scenario = data.scenario;
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

    socket.on("set:customDeck", function(data) {
      if(data){
        self.setDeck(JSON.parse(data));
      }
    })

    socket.on("request:quitGame", function() {
      if (self._rooms.length && self.getRoom().hasUser() > 1) {
        // quit game when other user still playing, record as lose
        self.endGame(false, self._battleSide.foe);
      }
      self.disconnect();
    })
  }

  return User;
})();

module.exports = User;
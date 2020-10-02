var Battleside = require("./Battleside");
var Card = require("./Card");
var Deck = require("./Deck");
var shortid = require("shortid");
var Promise = require("jquery-deferred");
var CardManager = require("./CardManager");
const Util = require("./CardUtil");


var Battle = (function(){
  var Battle = function(id, p1, p2, audience, socket){
    if(!(this instanceof Battle)){
      return (new Battle(id, p1, p2, audience, socket));
    }
    /**
     * constructor here
     */
    this.cm = CardManager();
    this.events = {};
    this._id = id;
    this._user1 = p1;
    this._user2 = p2;
    this._audience = audience || [];
    this._started = false;
    this.socket = socket;
  };
  var r = Battle.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */

  r.p1 = null;
  r.p2 = null;
  r._user1 = null;
  r._user2 = null;
  r._audience = [];
  r._started = false;
  r._ended = false;
  r.turn = 0;

  r.cm = null;

  r.socket = null;

  r._id = null;

  r.events = null;

  r.init = function(){
    this.on("Update", this.update);

    this.p1 = Battleside(this._user1, 0, this);
    this.p2 = Battleside(this._user2, 1, this);
    this.p1.foe = this.p2;
    this.p2.foe = this.p1;
    this.p1.setUpWeatherFieldWith(this.p2);

    this.sendNotification("msg_enter_room", [this._user1.getDisplayName()], {chat: true});
    this.sendNotification("msg_enter_room", [this._user2.getDisplayName()], {chat: true});
    this.start();
  }

  r.isStarted = function() {
    return this._started;
  }

  r.start = function(){
    this._started = true;
    this.p1.setLeadercard();
    this.p2.setLeadercard();
    this.p1.draw(10);
    this.p2.draw(10);

    /*this.p1.placeCard("ves");
    this.p2.placeCard("ves");
    this.p1.placeCard("yarpen_zigrin");
    this.p2.placeCard("yarpen_zigrin");

    this.p1.hand.add(this.p1.createCard("scorch"));
    this.p2.hand.add(this.p2.createCard("scorch"));
    this.p1.hand.add(this.p1.createCard("villentretenmerth"));
    this.p2.hand.add(this.p2.createCard("villentretenmerth"));*/

    /*this.p1.hand.add(this.p1.createCard("blue_stripes_commando"));
    this.p2.hand.add(this.p2.createCard("blue_stripes_commando"));
    this.p1.hand.add(this.p1.createCard("blue_stripes_commando"));
    this.p2.hand.add(this.p2.createCard("blue_stripes_commando"));
    this.p1.hand.add(this.p1.createCard("blue_stripes_commando"));
    this.p2.hand.add(this.p2.createCard("blue_stripes_commando"));
    this.p1.hand.add(this.p1.createCard("blue_stripes_commando"));
    this.p2.hand.add(this.p2.createCard("blue_stripes_commando"));
    this.p1.hand.add(this.p1.createCard("blue_stripes_commando"));
    this.p2.hand.add(this.p2.createCard("blue_stripes_commando"));
    this.p1.hand.add(this.p1.createCard("dandelion"));
    this.p2.hand.add(this.p2.createCard("dandelion"));*/


    /*this.p1.placeCard("ves");
    this.p2.placeCard("ves");
    this.p1.placeCard("yarpen_zigrin");
    this.p2.placeCard("yarpen_zigrin");

    this.p1.hand.add(this.p1.createCard("scorch"));
    this.p2.hand.add(this.p2.createCard("scorch"));
    this.p1.hand.add(this.p1.createCard("villentretenmerth"));
    this.p2.hand.add(this.p2.createCard("villentretenmerth"));

    this.p1.hand.add(this.p1.createCard("impenetrable_fog"));
    this.p2.hand.add(this.p2.createCard("impenetrable_fog"));
    this.p1.hand.add(this.p1.createCard("biting_frost"));
    this.p2.hand.add(this.p2.createCard("biting_frost"));
    this.p1.hand.add(this.p1.createCard("torrential_rain"));
    this.p2.hand.add(this.p2.createCard("torrential_rain"));
    this.p1.hand.add(this.p1.createCard("clear_weather"));
    this.p2.hand.add(this.p2.createCard("clear_weather"));
*/

    this.update();


    Promise.when(this.p1.reDraw(2), this.p2.reDraw(2))
    .then(function(){
      this.on("NextTurn", this.switchTurn);
      var side = Math.random() > 0.5 ? this.p1 : this.p2;
      this.sendNotification("msg_begin", [side.getName()]);
      this.switchTurn(side);
    }.bind(this));

  }

  r.switchTurn = function(side, __flag){
    __flag = typeof __flag == "undefined" ? 0 : 1;


    if(!(side instanceof Battleside)){
      console.trace("side is not a battleside!");
      return
    }
    if(side.isPassing()){
      if(__flag){
        return this.startNextRound();
      }
      return this.switchTurn(side.foe, 1);
    }

    this.runEvent("EachTurn");

    this.runEvent("Turn" + side.getID());

    this._audience.forEach(user => user.send("set:waiting", {waiting: this.p1.isWaiting()}));
    //console.log("current Turn: ", side.getName());
  }

  r.passing = function(side) {
    this._audience.forEach(user => user.send("set:passing", {passing: this.p1.isPassing()}));
  }

  r.getWinner = function() {
    if(!this.p1.getRubies() && !this.p2.getRubies()){
      return null; //tie
    }
    return this.p1.getRubies() ? this.p1 : this.p2;
  }

  r.startNextRound = function(){
    var lastRound = this.checkRubies();
    var loser = lastRound.loser;
    var winner = loser.foe;
    if(this.checkIfIsOver()){
      //console.log("its over!");
      var winner = this.getWinner();
      this.gameOver(winner);
      this.update();
      return;
    }

    this.send("new:round");
    this.p1.resetNewRound();
    this.p2.resetNewRound();

    //console.log("start new round!");
    this.sendNotification("msg_new_round");


    if(winner.deck.getFaction() === Deck.FACTION.SOUND_EUPHO_S1 && !lastRound.isTie){
      winner.draw(1, true);
      //console.log(winner.getName() + " draws 1 extra card! (Northern ability)");
      this.sendNotification("msg_draw_extra_card", [winner.getName()]);
    }
    if (this.p1.deck.getFaction() === Deck.FACTION.FUN_DECK &&
      this.p2.deck.getFaction() === Deck.FACTION.FUN_DECK) {
      this.waitForFunDeckRedraw();
    }

    this.update();

    if(winner.deck.getFaction() === Deck.FACTION.SCOIATAEL){
      this.waitForScoiatael(winner);
    }
    else if(this.p1.deck.getFaction() === Deck.FACTION.SCOIATAEL){
      this.waitForScoiatael(this.p1);
    }
    else if(this.p2.deck.getFaction() === Deck.FACTION.SCOIATAEL){
      this.waitForScoiatael(this.p2);
    }
    else {
      this.sendNotification("msg_begin", [winner.getName()]);
      this.switchTurn(winner);
    }
  }

  r.waitForFunDeckRedraw = function() {
    let num1 = Math.min(3, Math.max(0, 10 - this.p1.hand.length()));
    let num2 = Math.min(3, Math.max(0, 10 - this.p2.hand.length()));
    this.p1.draw(num1, true);
    this.p2.draw(num2, true);
    this.sendNotification("msg_draw_extra_cards", [this.p1.getName(), num1]);
    this.sendNotification("msg_draw_extra_cards", [this.p2.getName(), num2]);
  }

  r.waitForScoiatael = function(side){
    var self = this;
    side.turn();
    side.foe.wait();
    self.sendNotification("msg_decide_who_start", [side.getName()]);
    side.send("request:chooseWhichSideBegins", null, true);
    side.socket.once("response:chooseWhichSideBegins", function(data){
      //console.log("which side? ", data.side);

      if(data.side !== "p1" && data.side !== "p2")
        throw new Error("Unknown side property! - ", data.side);

      // self.sendNotification(side.getName() + " choose " + self[data.side].getName());
      self.switchTurn(self[data.side]);
    })
  }

  r.gameOver = async function(winner, isQuit){
    let p1Scores = this.p1.getScores();
    let p2Scores = this.p2.getScores();
    let p1Total = p1Scores.reduce((sum,s)=>sum+s, 0);
    let p2Total = p2Scores.reduce((sum,s)=>sum+s, 0);
    let data = {
      winner: winner ? winner.getName() : null,
      p1Scores,
      p2Scores,
      isQuit,
    };
    this._audience.forEach(user => user.send("gameover", data));
    data.gameResult = await this._user1.endGame({
      isWin: winner === this.p1,
      score: p1Total,
      foeScore: p2Total,
      isQuit,
      isDraw: !isQuit && !(data.winner),
    }, this.p1.deck.getFaction(), this._user2);
    this.p1.send("gameover", data, true);
    data.gameResult = await this._user2.endGame({
      isWin: winner === this.p2,
      score: p2Total,
      foeScore: p1Total,
      isQuit,
      isDraw: !isQuit && !(data.winner),
    }, this.p2.deck.getFaction(), this._user1);
    this.p2.send("gameover", data, true);

    this._ended = true;
    this._user1.disconnect();
    this._user2.disconnect();
  }

  r.updateAudience = function(user) {
    this._update(this.p1, true, user);
    this._update(this.p2, true, user);
    this.sendNotification("msg_new_audience", [user.getDisplayName()], {chat: true});
  }

  r.update = function(){
    //console.("update called");
    this._update(this.p1);
    this._update(this.p2);
  }

  r.updateSelf = function(side){
    this._update(side, true);
  }

  r._update = function(p, isPrivate, opt_target){
    isPrivate = isPrivate || false;
    let data = {
      // update:info
      info: p.getInfo(),
      leader: p.field[Card.TYPE.LEADER].get()[0],
      // update:hand
      cards: p.hand.getCards().map(c=>Util.compress(c)),
      // update:fields
      close: p.field[Card.TYPE.CLOSE_COMBAT].getInfo(),
      ranged: p.field[Card.TYPE.RANGED].getInfo(),
      siege: p.field[Card.TYPE.SIEGE].getInfo(),
      weather: p.field[Card.TYPE.WEATHER].getInfo()
    };
    if (opt_target) {
      data._roomSide = p.getID();
      opt_target.send("update:info", data);
    } else {
      p.send("update:info", data, isPrivate);
    }
  }

  r.send = function(event, data){
    /*this.channel.publish({
      event: event,
      data: data
    });*/
    if (this.p1.isBot) {
      this.p1.socket.emit(event, data);
    }
    if (this.p2.isBot) {
      this.p2.socket.emit(event, data);
    }

    // send to players and audience
    this.socket.in(this._id).emit(event, data);
  }

  r.runEvent = function(eventid, ctx, args, uid){
    ctx = ctx || this;
    uid = uid || null;
    args = args || [];
    var event = "on" + eventid;

    if(!this.events[event]){
      return;
    }

    if(uid){
      var obj = this.events[event][uid];
      obj.cb = obj.cb.bind(ctx)
      obj.cb.apply(ctx, obj.onArgs.concat(args));
    }
    else {
      for(var _uid in this.events[event]) {
        var obj = this.events[event][_uid];
        obj.cb = obj.cb.bind(ctx)
        obj.cb.apply(ctx, obj.onArgs.concat(args));
      }
    }
    //this.update();
  }

  r.on = function(eventid, cb, ctx, args){
    ctx = ctx || null;
    args = args || [];
    var event = "on" + eventid;
    var uid_event = shortid.generate();

    var obj = {};
    if(!ctx){
      obj.cb = cb;
    }
    else {
      obj.cb = cb.bind(ctx);
    }
    obj.onArgs = args;

    if(!(event in this.events)){
      /*this.events[event] = [];*/
      this.events[event] = {};
    }

    if(typeof cb !== "function"){
      throw new Error("cb not a function");
    }

    this.events[event][uid_event] = obj;

    return uid_event;
  }

  r.off = function(eventid, uid){
    uid = uid || null;
    var event = "on" + eventid;
    if(!this.events[event]) return;
    if(uid){
      this.events[event][uid] = null;
      delete this.events[event][uid];
      return;
    }
    for(var _uid in this.events[event]) {
      this.events[event][_uid] = null;
      delete this.events[event][_uid];
    }
  }

  r.checkIfIsOver = function(){
    return !(this.p1.getRubies() && this.p2.getRubies());
  }

  r.checkRubies = function(){
    var scoreP1 = this.p1.getScore();
    var scoreP2 = this.p2.getScore();

    this.p1.recordScore(scoreP1);
    this.p2.recordScore(scoreP2);
    if(scoreP1 > scoreP2){
      this.p2.removeRuby();
      return {
        loser: this.p2,
        isTie: false
      }
    }
    if(scoreP2 > scoreP1){
      this.p1.removeRuby();
      return {
        loser: this.p1,
        isTie: false
      }
    }

    //tie

    //check if is nilfgaardian faction ability
    if(this.p1.deck.getFaction() === Deck.FACTION.OATHS_FINALE && this.p1.deck.getFaction() !== this.p2.deck.getFaction()){
      this.p2.removeRuby();
      //console.log(this.p1.getName() + " wins the tie! (nilfgaardian ability)");
      this.sendNotification("msg_win_the_tie", [this.p1.getName()]);
      return {
        loser: this.p2,
        isTie: false
      }
    }
    if(this.p2.deck.getFaction() === Deck.FACTION.OATHS_FINALE && this.p1.deck.getFaction() !== this.p2.deck.getFaction()){
      this.p1.removeRuby();
      //console.log(this.p2.getName() + " wins the tie! (nilfgaardian ability)");
      this.sendNotification("msg_win_the_tie", [this.p2.getName()]);
      return {
        loser: this.p1,
        isTie: false
      }
    }

    this.p1.removeRuby();
    this.p2.removeRuby();

    /*if(!this.p1.getRubies() && !this.p2.getRubies()) {
      return {
        loser: Math.random() > 0.5 ? this.p1 : this.p2,
        isTie: false
      }
    }

    if(!this.p1.getRubies()) {
      return {
        loser: this.p2,
        isTie: false
      }
    }
*/
    return {
      loser: Math.random() > 0.5 ? this.p1 : this.p2,
      isTie: true
    }
  }

  r.getBattleSide = function(sideName) {
    return this[sideName];
  }

  r.userConnecting = function(sideName) {
    var side = this[sideName];
    if (side && side.foe) {
      side.foe.send("foe:connecting", null, true);
    }
  }

  r.userReconnect = function(sideName) {
    var side = this[sideName];
    if (side && side.foe) {
      side.foe.send("foe:reconnect", null, true);
    }
  }

  r.userLeft = function(sideName){
    if (this._ended) {
      // don't send user left when game is end
      return;
    }
    var side = this[sideName];
    if(side && side.foe){
      side.foe.send("foe:left", null, true);
      // quit game when other user still playing, record as lose
      this.gameOver(side.foe, true);
      return;
    }
    console.log("side foe not defined!");
  }

  r.shutDown = function(){
    this.channel = null;
  }

  r.sendNotification = function(msg, values, options) {
    let data = {
      msgKey: msg,
      values
    };
    if (options) {
      data.options = options;
    }
    this.send("notification", data);
  }

  r.sendNotificationTo = function(side, msg, values) {
    side.send("notification", {
      msgKey: msg,
      values
    }, true)
  }

  return Battle;
})();

module.exports = Battle;
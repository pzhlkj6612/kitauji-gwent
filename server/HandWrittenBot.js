var BotStrategy = require("./BotStrategy");

var HandWrittenBot = (function(){
    var SocketStub = function(bot){
      this.bot = bot;
      this.callbacks = {};
    };
    SocketStub.prototype.join = function(id) {
    };
    SocketStub.prototype.on = function(event, callback) {
      this.callbacks[event] = callback;
    };
    SocketStub.prototype.trigger = function(event, data) {
      let callback = this.callbacks[event] || null;
      if (!callback) return;
      callback(data);
    };
    SocketStub.prototype.emit = function(event, msg) {
      this.bot.send(event, msg);
    };
    var HandWrittenBot = function(){
      if(!(this instanceof HandWrittenBot)){
        return (new HandWrittenBot());
      }
      /**
       * constructor here
       */
  
      this.state = {};
      this.socket = new SocketStub(this);
      this._rooms = [];
      this._id = this.generateID();
      this.generateName();
      this.setDeck("test");
      this.strategy = new BotStrategy(this);
    };
    var r = HandWrittenBot.prototype;
    /**
     * methods && properties here
     * r.property = null;
     * r.getProperty = function() {...}
     */
  
    r._id = null;
    r._name = null;
    r._rooms = null;
    r._inQueue = false;
    r.socket = null;
    r.disconnected = false;
    r.state = {};
  
    r.isBot = function() {
      return true;
    }

    r.getID = function(){
      return this._id;
    }
  
    r.send = function(event, data, room){
      room = room || null;
      data = data || null;
      let self = this;
      switch (event) {
        case "init:battle":
          this.state.ownSideN = data.side;
          this.state.foeSideN = data.foeSide;
          connections.roomCollection[this.getRoom().getID()].setReady(self);
          break;
        case "redraw:cards":
          setTimeout(function() {
            self.socket.trigger("redraw:close_client");
          }, 0);
          break;
        case "update:info":
          this.updateInfo(data);
          break;
        case "set:waiting":
          if (!data.waiting) {
            setTimeout(() => this.play(), this.state.foeSide.passing ? 2000 : 1000);
          }
          break;
        case "set:passing":
          if (!data._passing) {
            this.state.round++;
          }
          break;
        case "gameover":
          this.disconnect();
          break;
        default:
          break;
      }
    }

    r.updateInfo = function(data) {
      let state = this.state;
      if (data._roomSide === state.ownSideN) {
        state.ownLeader = data.leader;
        state.ownSide = data.info;
        state.ownHand = data.cards;
        state.ownFields = {
          close: data.close,
          ranged: data.ranged,
          siege: data.siege,
          weather: data.weather,
        };
      } else {
        state.foeLeader = data.leader;
        state.foeSide = data.info;
        state.foeHand = data.cards;
        state.foeFields = {
          close: data.close,
          ranged: data.ranged,
          siege: data.siege,
          weather: data.weather,
        };
      }
    }

    r.play = function() {
      let commands = [];
      try {
        let card = this.strategy.selectCard();
        commands = this.strategy.generateCommands(card);
      } catch (e) {
        // catch error from strategy instead of crashing the server!
        console.warn(e);
      }
      if (commands.length == 0) {
        commands = [this.playPassCommand()];
      }
      for (let i=0; i<commands.length; i++) {
        setTimeout(() => this.socket.trigger(commands[i].event, commands[i]), 500 * i); 
      }
    }
    r.playPassCommand = function() {
      return {
        event: "set:passing"
      };
    }
    r.playCardCommand = function(card) {
      return {
        event: "play:cardFromHand",
        id: card._id,
        name: card._data.name
      };
    }
    r.decoyReplaceWithCommand = function(card) {
      return {
        event: "decoy:replaceWith",
        cardID: card._id,
        name: card._data.name
      };
    }
    r.selectHornCommand = function(fieldType) {
      return {
        event: "horn:field",
        field: fieldType,
      };
    }
    r.medicChooseCardCommand = function(card) {
      if (!card) {
        return {
          event: "medic:chooseCardFromDiscard"
        };
      }
      return {
        event: "medic:chooseCardFromDiscard",
        cardID: card._id,
        name: card._data.name
      };
    }
    r.chooseHealCommand = function(card, healPower) {
      return {
        event: "heal:chooseHeal",
        cardID: card._id,
        healPower: healPower,
      };
    }
    r.chooseAttackCommand = function(card, attackPower, grade, field) {
      return {
        event: "attack:chooseAttack",
        cardID: card._id,
        attackPower: attackPower,
        grade: grade,
        field: field,
      };
    }

    r.generateID = function() {
      return (((Math.random() * 8999) + 1000) | 0);
    }

    r.generateName = function(){
      var name = "Bot" + (((Math.random() * 8999) + 1000) | 0);
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
  
    r.cleanUp = function() {
      for(var i=0; i<this._rooms.length; i++) {
        var room = this._rooms[i];
        if(room[i] === null) {
          this._rooms.splice(i, 1);
  
          return this.cleanUp();
        }
      }
    }
  
    r.disconnect = function() {
      var self = this;
      this.disconnected = true;
  
      this._rooms.forEach(function(room) {
        room.leave(self);
        if(!room.hasUser()) {
          //console.log("Remove room: ", room.getID());
          room = null;
        }
      })
  
      this.cleanUp();
    }
  
    return HandWrittenBot;
  })();
  
  module.exports = HandWrittenBot;
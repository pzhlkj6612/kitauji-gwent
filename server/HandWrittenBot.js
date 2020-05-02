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
  
  
      this.socket = new SocketStub(this);
      this._rooms = [];
      this._id = this.generateID();
      this.generateName();
      this.setDeck("kitauji2");  
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
            setTimeout(() => this.play(), 1000);
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
      let state = this.state;
      let card = this.selectCard();
      let commands = this.generateCommands(card);
      console.warn("score: ", state.ownSide.score, " vs ", state.foeSide.score, 
        "foe passing: ", state.foeSide.passing);
      if ((state.ownSide.score > state.foeSide.score && state.foeSide.passing) || commands.length == 0) {
        commands = [this.playPassCommand()];
      }
      for (let i=0; i<commands.length; i++) {
        this.socket.trigger(commands[i].event, commands[i]);
      }
    }
    r.playPassCommand = function() {
      return {
        event: "set:passing"
      };
    }
    r.playCardCommand = function(id) {
      return {
        event: "play:cardFromHand",
        id: id,
      };
    }
    r.decoyReplaceWithCommand = function(id) {
      return {
        event: "decoy:replaceWith",
        cardID: id,
      };
    }
    r.selectHornCommand = function(fieldType) {
      return {
        event: "horn:field",
        field: fieldType,
      };
    }
    r.medicChooseCardCommand = function(id) {
      return {
        event: "medic:chooseCardFromDiscard",
        cardID: id,
      };
    }
    r.generateCommands = function(card) {
      let state = this.state;
      if (state.ownHand.every(function(c) {
        return c._id !== card._id;
      })) {
        console.warn("bot: no card at hand: ", card._id)
        return [];
      }
      if (card._data.ability === "decoy") {
        let fieldCards = state.ownFields.siege.cards
          .concat(state.ownFields.ranged.cards)
          .concat(state.ownFields.close.cards);
        let spies = this.spiesOf(fieldCards);
        if (spies.length > 0) {
          return [this.playCardCommand(card._id), 
            this.decoyReplaceWithCommand(this.getMin(spies)._id)];
        }
        let normal = this.regularsOf(fieldCards);
        if (normal.length > 0) {
          return [this.playCardCommand(card._id), 
            this.decoyReplaceWithCommand(this.getMax(normal)._id)];
        }
        return [];
      } else if (card._data.ability == "commanders_horn_card") {
        let fields = [state.ownFields.close, state.ownFields.ranged, state.ownFields.siege];
        let maxFieldType = 0, maxScore = 0;
        for (let i=0; i<fields.length; i++) {
          if (fields[i].score > maxScore) {
            maxScore = fields[i].score;
            maxFieldType = i;
          }
        }
        return [this.playCardCommand(card._id), this.selectHornCommand(maxFieldType)];
      } else if (String(card._data.ability).includes("medic")) {
        let selectMedic = (currentDiscards) => {
          let medics = this.medicsOf(currentDiscards);
          let spies = this.spiesOf(currentDiscards);
          let normals = this.regularsOf(currentDiscards);
          if (medics.length > 0) {
            let selected = this.getMax(medics);
            let remained = currentDiscards.filter(c => c._id !== selected._id);
            return [this.medicChooseCardCommand(selected._id)].concat(selectMedic(remained));
          } else if (spies.length > 0) {
            return [this.medicChooseCardCommand(this.getMin(spies)._id)];
          } else if (normals.length > 0) {
            return [this.medicChooseCardCommand(this.getMax(normals)._id)];
          }
          return [this.medicChooseCardCommand(null)];
        }
        let discard = state.ownSide.discard.filter(c => c._id !== card._id);
        return [this.playCardCommand(card._id)].concat(selectMedic(discard));
      } else {
        return [this.playCardCommand(card._id)];
      }
    }
    r.selectCard = function() {
      let spies = this.spiesOf(this.state.ownHand);
      if (spies.length > 0) {
        return this.getMin(spies);
      }
      return this.getMax(this.state.ownHand);
    }
    r.getMin = function(cards) {
      let minCard = cards[0];
      for (let i=0; i<cards.length; i++) {
        if (cards[i]._data.power < minCard._data.power) {
          minCard = cards[i];
        }
      }
      return minCard;
    }
    r.getMax = function(cards) {
      let maxCard = cards[0];
      for (let i=0; i<cards.length; i++) {
        if (cards[i]._data.power > maxCard._data.power) {
          maxCard = cards[i];
        }
      }
      return maxCard;
    }
    r.canReplace = function(card) {
      return !(String(card._data.ability).includes("hero") || card._data.ability === "decoy");
    }
    r.spiesOf = function(cards) {
      return cards.filter(function(card) {
        return String(card._data.ability).includes("spy");
      });
    }
    r.medicsOf = function(cards, includeHero) {
      return cards.filter(function(card) {
        return card._data.ability === "medic" ||
          (includeHero && String(card._data.ability).includes("medic"));
      });
    }
    r.regularsOf = function(cards) {
      return cards.filter(this.canReplace);
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
var BotStrategy = require("./BotStrategy");
var Deck = require("./Deck");
var Const = require("./Const");
var Util = require("./CardUtil");
var SchoolData = require("../assets/data/schools");
var DeckData = require("../assets/data/deck");
var CardData = require("../assets/data/cards");
const Card = require("./Card");

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
    var HandWrittenBot = function(user){
      if(!(this instanceof HandWrittenBot)){
        return (new HandWrittenBot(user));
      }
      /**
       * constructor here
       */
      this.user = user;
      this.state = {};
      this.socket = new SocketStub(this);
      this._rooms = [];
      this._id = this.generateID();
      switch (user.getScenario()) {
        case Const.SCENARIO_KYOTO:
          this.setDeck("random_easy");
          this.generateName(["kyoto"]);
          break;
        case Const.SCENARIO_KANSAI:
          this.setDeck("random_normal");
          this.generateName(["kansai"]);
          break;
        case Const.SCENARIO_ZENKOKU:
          if (this.shouldPlayMirrorMode(user)) {
            try {
              this.setMirrorDeck(user.getDeck());
            } catch (e) {
              console.warn(e);
              this.setDeck("random_advanced");
            }
          } else {
            this.setDeck("random_advanced");
          }
          this.generateName(["zenkoku"]);
          break;
        default:
          this.setDeck("random");
          this.generateName();
      }
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
          setTimeout(() => this.redraw(), 0);
          break;
        case "redraw:close":
          setTimeout(() => {
            self.socket.trigger("redraw:close_client");
          }, 0);
          break;
        case "update:info":
          this.updateInfo(data);
          break;
        case "set:waiting":
          if (!data.waiting) {
            setTimeout(() => this.play(), this.state.foeSide.passing ? 1500 : 1000);
          }
          break;
        case "set:passing":
          if (!data._passing) {
            this.state.round++;
          }
          break;
        case "gameover":
          // this.disconnect();
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

    r.redraw = function() {
      let cards = this.state.ownHand;
      cards.sort((a, b) => {
        let priorityA = getPriority(a);
        let priorityB = getPriority(b);
        if (priorityA > priorityB) {
          return 1;
        } else if (priorityA < priorityB) {
          return -1;
        }
        return 0;
      });
      console.warn("bot redraw ", cards[0]._data.name);
      this.socket.trigger("redraw:reDrawCard", {
        cardID: cards[0]._id,
      });

      function getPriority(card) {
        let priority = card._data.power;
        if (Util.isHero(card)) {
          priority += 100;
        } else if (Util.isSpy(card)) {
          priority += 100;
        } else if (Util.isBond(card)) {
          if (cards.filter(c=>Util.isBond(c, card._data.bondType)).length > 1) {
            priority += card._data.power;
          }
        } else if (Util.isMuster(card)) {
          if (cards.filter(c=>Util.isMuster(c, card._data.musterType)).length > 1) {
            priority -= card._data.power;
          }
        } else if (Util.isWeather(card)) {
          priority = 5 - cards.filter(c=>Util.isWeather(c)).length;
        } else if (Util.isDecoy(card)) {
          priority = 12 - (cards.filter(c=>Util.isDecoy(c)).length - 1) * 6;
        } else if (Util.isScorch(card, true)) {
          priority = 8 - (cards.filter(c=>c._data.type===4).length - 1) * 4;
        } else if (card._data.ability) {
          priority += 2;
        }
        return priority;
      }
    }

    r.play = function() {
      if (this.disconnected) return;
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
    r.playLeaderCommand = function() {
      return {
        event: "activate:leader",
      };
    }
    r.playEmreisLeader4Command = function(card) {
      return {
        event: "emreis_leader4:chooseCardFromDiscard",
        cardID: card && card._id,
      };
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

    r.generateName = function(categories) {
      let schools = [];
      if (!categories) {
        schools = schools.concat(
          SchoolData["kyoto"],
          SchoolData["kansai"],
          SchoolData["zenkoku"]);
      } else {
        categories.forEach(cat => {
          schools = schools.concat(SchoolData[cat]);
        });
      }
      var name = schools[((Math.random() * schools.length) | 0)];
      this._name = name;
      return name;
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

    r.shouldPlayMirrorMode = function(user) {
      let zenkokuGold = user.getUserModel().zenkokuGold || 0;
      if (zenkokuGold < Const.MIRROR_MODE_THRESHOLD || typeof user.getDeck() !== "object") {
        return false;
      }
      let cardInDeck = user.getDeck().cardInDeck;
      for (let key of Object.keys(cardInDeck)) {
        if (cardInDeck[key] > 1) return true;
      }
      return false;
    }

    r.setMirrorDeck = function(userDeck) {
      userDeck = userDeck.cardInDeck;
      let faction = Deck.NORMAL_FACTION[(Math.random() * Deck.NORMAL_FACTION.length) | 0];
      let botDeck = {};
      let cpMapping = {};
      let byRarity = {};
      let leaders = [];
      let special = [];
      for (let card of DeckData[faction].data) {
        let rarity = CardData[card].rarity;
        let type = CardData[card].type;
        if (type === 3) {
          leaders.push(card);
        } else if (type === 4 || type === 5) {
          special.push(card);
        } else {
          byRarity[rarity] = byRarity[rarity] || {};
          byRarity[rarity][card] = 1;
        }
      }
      for (let key of Object.keys(userDeck)) {
        let bondType = CardData[key].bondType;
        let rarity = CardData[key].rarity;
        let type = CardData[key].type;
        let candidates = Object.keys(byRarity[rarity]);
        if (!candidates.length) continue;
        let botCard;
        if (bondType) {
          let bondCandidates;
          if (cpMapping[bondType]) {
            bondCandidates = candidates.filter(c=>CardData[c].bondType === cpMapping[bondType]);
          } else {
            bondCandidates = candidates.filter(c=>!!(CardData[c].bondType));
          }
          if (bondCandidates.length) {
            botCard = this.randomGet_(bondCandidates);
            cpMapping[bondType] = CardData[botCard].bondType;
          }
        } else if (type === 4 || type === 5) {
          botCard = key;
        }
        if (!botCard && CardData[key].rarity >= 2) {
          candidates = candidates.filter(c=>(botDeck[botCard] || 0) + userDeck[key] <= this.getMirrorModeLimit_(c));
          botCard = this.randomGet_(candidates);
          if (!CardData[botCard].bondType) {
            delete byRarity[rarity][botCard];
          }
        }
        if (botCard) {
          botDeck[botCard] = (botDeck[botCard] || 0) + userDeck[key];
        }
      }
      for (let key of Object.keys(byRarity[2])) {
        if (!botDeck[key] && (
          CardData[key].ability==="spy" || CardData[key].ability==="medic"
        )) botDeck[key] = 1;
      }
      for (let key of Object.keys(byRarity[3])) {
        if (!botDeck[key]) botDeck[key] = 1;
      }
      for (let key of special) {
        if (!botDeck[key]) botDeck[key] = 1;
      }
      console.info(botDeck);
      this.setDeck({
        cardInDeck: botDeck,
        leader: leaders.filter(c=>CardData[c].rarity>2)[0] ||
          this.randomGet_(leaders),
        deck: faction,
        isBot: true,
      });
    }

    r.getMirrorModeLimit_ = function(key) {
      let card = {
        _data: CardData[key],
      };
      // set limit of weak skill to 1
      if (Util.isHorn(card) || Util.isTunning(card) || Util.isLips(card)) {
        return 1;
      }
      return Util.getLimit(key);
    }
  
    r.getDeck = function() {
      return this._deck;
    }
  
    r.addRoom = function(room) {
      this._rooms.push(room);
    }
  
    r.leaveRoom = function() {
      var self = this;
      this._rooms.forEach(function(room) {
        room.leave(self);
      });
      this._rooms = [];
    }
  
    r.disconnect = function() {
      this.disconnected = true;
      this.leaveRoom();
    }
  
    r.setBattleSide = function(battleSide) {
    }

    r.endGame = function() {
    }

    r.randomGet_ = function(arr) {
      return arr[(Math.random() * arr.length) | 0];
    }

    return HandWrittenBot;
  })();
  
  module.exports = HandWrittenBot;
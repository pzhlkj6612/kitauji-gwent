module.exports = {

  "agile": {
    name: "agile",
    description: "Agile: Can be placed in either the Close Combat or Ranged Combat row. Cannot be moved once placed.",
    cancelPlacement: true,
    onBeforePlace: function(card){
      var self = this;
      this.send("played:agile", {cardID: card.getID()}, true);
      this.on("agile:setField", function(type){
        self.off("agile:setField");
        card.changeType(type)
        self.placeCard(card, {
          disabled: true
        });
        self.hand.remove(card);
      })
    }
  },
  "medic": {
    name: "medic",
    description: "复活: 令一名退部/毕业的部员（天王除外）回归吹奏部，并立即加入演奏。",
    waitResponse: true,
    onAfterPlace: function(card){
      var discard = this.getDiscard();

      discard = this.filter(discard, {
        "ability": "hero",
        "type": [card.constructor.TYPE.SPECIAL, card.constructor.TYPE.WEATHER]
      })

      this.send("played:medic", {
        cards: JSON.stringify(discard)
      }, true);

      this.sendNotificationTo(this.foe, this.getName() + " chooses a card from discard pile.")
    }
  },
  "morale_boost": {
    name: "morale_boost",
    description: "士气: 高喊“北宇治Fight！”，使同一行内除自己以外的部员吹奏能力+1。",
    onEachCardPlace: function(card){
      var field = this.field[card.getType()];
      var id = card.getID();
      if(!field.isOnField(card)){
        field.get().forEach(function(_card){
          if(_card.getID() == id) return;
          if(_card.hasAbility("hero")) return;
          if(_card.getType() != card.getType()) return;
          _card.setBoost(id, 0);
        })
        this.off("EachCardPlace", card.getUidEvents("EachCardPlace"));
        return;
      }

      field.get().forEach(function(_card){
        if(_card.getID() == id) return;
        if(_card.hasAbility("hero")) return;
        if(_card.getType() != card.getType()) return;
        _card.setBoost(id, 1);
      })
    }
  },
  "muster": {
    name: "muster",
    description: "抱团: 和自己的闺蜜一起上场比赛。",
    onAfterPlace: function(card){
      var musterType = card.getMusterType();
      var self = this;

      var cardsDeck = this.deck.find("musterType", musterType);
      var cardsHand = this.hand.find("musterType", musterType);

      cardsDeck.forEach(function(_card){
        if(_card.getID() === card.getID()) return;
        self.deck.removeFromDeck(_card);
        self.placeCard(_card, {
          suppress: "muster"
        });
      })
      cardsHand.forEach(function(_card){
        if(_card.getID() === card.getID()) return;
        self.hand.remove(_card);
        self.placeCard(_card, {
          suppress: "muster"
        });
      })
    }
  },
  "tight_bond": {
    name: "tight_bond",
    description: "同袍之情: 当CP（或组合）同时登场时，吹奏能力翻倍。",
    tightBond: true
  },
  "spy": {
    name: "spy",
    description: "间谍: 加入对面吹奏部，让己方新增两名部员。",
    changeSide: true,
    onAfterPlace: function(){
      this.draw(2);
      this.sendNotification(this.getName() + " activated Spy! Draws +2 cards.")
    }
  },
  "weather_fog": {
    name: "weather_fog",
    description: "演奏《利兹与青鸟》第三乐章，令双方所有铜管乐器吹奏能力降为1。",
    weather: 1/*,
    onEachTurn: function(card){
      var targetRow = card.constructor.TYPE.RANGED;
      var forcedPower = 1;
      var field1 = this.field[targetRow].get();
      var field2 = this.foe.field[targetRow].get();

      var field = field1.concat(field2);

      field.forEach(function(_card){
        if(_card.getRawAbility() == "hero") return;
        _card.setForcedPower(forcedPower);
      });
    },
    onEachCardPlace: function(card){
      var targetRow = card.constructor.TYPE.RANGED;
      var forcedPower = 1;
      var field1 = this.field[targetRow].get();
      var field2 = this.foe.field[targetRow].get();

      var field = field1.concat(field2);

      field.forEach(function(_card){
        if(_card.getRawAbility() == "hero") return;
        _card.setForcedPower(forcedPower);
      });
    }*/
  },
  "weather_rain": {
    name: "weather_rain",
    description: "失去鼓槌，令双方所有打击乐器吹奏能力降为1。",
    weather: 2
    /*onEachTurn: function(card){
      var targetRow = card.constructor.TYPE.SIEGE;
      var forcedPower = 1;
      var field1 = this.field[targetRow].get();
      var field2 = this.foe.field[targetRow].get();

      var field = field1.concat(field2);

      field.forEach(function(_card){
        if(_card.getRawAbility() == "hero") return;
        _card.setForcedPower(forcedPower);
      });
    },
    onEachCardPlace: function(card){
      var targetRow = card.constructor.TYPE.SIEGE;
      var forcedPower = 1;
      var field1 = this.field[targetRow].get();
      var field2 = this.foe.field[targetRow].get();

      var field = field1.concat(field2);

      field.forEach(function(_card){
        if(_card.getRawAbility() == "hero") return;
        _card.setForcedPower(forcedPower);
      });
    }*/
  },
  "weather_frost": {
    name: "weather_frost",
    description: "参加SunFes，令双方所有木管乐器吹奏能力降为1。",
    weather: 0
    /*
      onEachTurn: function(card){
        var targetRow = card.constructor.TYPE.CLOSE_COMBAT;
        var forcedPower = 1;
        var field1 = this.field[targetRow].get();
        var field2 = this.foe.field[targetRow].get();

        var field = field1.concat(field2);

        field.forEach(function(_card){
          if(_card.getRawAbility() == "hero") return;
          _card.setForcedPower(forcedPower);
        });
      },
      onEachCardPlace: function(card){
        var targetRow = card.constructor.TYPE.CLOSE_COMBAT;
        var forcedPower = 1;
        var field1 = this.field[targetRow].get();
        var field2 = this.foe.field[targetRow].get();

        var field = field1.concat(field2);

        field.forEach(function(_card){
          if(_card.getRawAbility() == "hero") return;
          _card.setForcedPower(forcedPower);
        });
      }*/
  },
  "weather_clear": {
    name: "weather_clear",
    description: "消除所有不良影响。",
    weather: 5
    /*onAfterPlace: function(card){
      var targetRow = card.constructor.TYPE.WEATHER;
      var field = this.field[targetRow];
      field.removeAll();

      for(var i = card.constructor.TYPE.CLOSE_COMBAT; i < card.constructor.TYPE.SIEGE; i++) {
        var _field1, _field2, _field;
        _field1 = this.field[i].get();
        _field2 = this.foe.field[i].get();
        _field = _field1.concat(_field2);

        _field.forEach(function(_card){
          if(_card.getRawAbility() == "hero") return;
          _card.setForcedPower(-1);
        });
      }

    }*/
  },
  "decoy": {
    name: "decoy",
    description: "大号君: 换下场上一名部员，使其可以继续参加后面的比赛。",
    replaceWith: true
  },
  "scorch_card": {
    name: "scorch",
    description: "退部申请书: 令场上双方部员中实力最强的部员直接退部。",
    scorch: true,
    removeImmediately: true,
    nextTurn: true
  },
  "scorch": {
    name: "scorch",
    description: "退部: 令对方实力最强的木管成员退部（仅当对方总吹奏实力大于10）。",
    scorchMelee: true
  },
  "commanders_horn": {
    name: "commanders_horn",
    description: "支援: 使同一行内除自己之外的部员吹奏实力翻倍。",
    commandersHorn: true
  },
  "commanders_horn_card": {
    name: "commanders_horn",
    description: "指导老师: 使同一行内所有部员吹奏实力翻倍。",
    cancelPlacement: true,
    commandersHorn: true,
    isCommandersHornCard: true
  },
  "foltest_leader1": {
    name: "",
    description: "",
    onActivate: function(){
      var cards = this.deck.find("key", "impenetrable_fog")
      if(!cards.length) return;
      var card = this.deck.removeFromDeck(cards[0]);
      this.placeCard(card);
    }
  },
  "foltest_leader2": {
    name: "",
    description: "",
    onActivate: function(){
      this.setWeather(5);
    }
  },
  "foltest_leader3": {
    name: "",
    description: "Doubles the strength of all Siege units, unless a Commander's Horn is already in play on that row",
    onActivate: function(){
      this.setHorn("commanders_horn", 2);
    }
  },
  "foltest_leader4": {
    name: "",
    description: "",
    onActivate: function(){
      //scorch siege
    }
  },
  "francesca_leader1": {
    name: "",
    description: "",
    onActivate: function(){
      var cards = this.deck.find("key", "biting_frost")
      if(!cards.length) return;
      var card = this.deck.removeFromDeck(cards[0]);
      this.placeCard(card);
    }
  },
  "francesca_leader2": {
    name: "Francesca Findabair the Beautiful",
    description: "Doubles the strength of all your Ranged Combat units (unless a Commander's Horn is also present on that row).",
    onActivate: function(){
      this.setHorn("commanders_horn", 1);
    }
  },
  "francesca_leader3": {
    name: "",
    description: "",
    onActivate: function(){
    }
  },
  "francesca_leader4": {
    name: "",
    description: "",
    onActivate: function(){
    }
  },
  "eredin_leader1": {
    name: "",
    description: "",
    onActivate: function(){
    }
  },
  "eredin_leader2": {
    name: "",
    description: "",
    onActivate: function(){
    }
  },
  "eredin_leader3": {
    name: "",
    description: "",
    onActivate: function(){

    }
  },
  "eredin_leader4": {
    name: "Eredin King of the Wild Hunt",
    description: "Double the strength of all your Close Combat units (unless a Commander's Horn is also present on that row).",
    onActivate: function(){
      this.setHorn("commanders_horn", 0);
    }
  },
  "emreis_leader4": {
    name: "Emhyr vas Emreis the Relentless",
    description: "Draw a card from your opponent's discard pile.",
    waitResponse: true,
    onActivate: function(card){
      var discard = this.foe.getDiscard();

      discard = this.filter(discard, {
        "ability": "hero",
        "type": [card.constructor.TYPE.SPECIAL, card.constructor.TYPE.WEATHER]
      })

      this.send("played:emreis_leader4", {
        cards: JSON.stringify(discard)
      }, true);
    }
  },
  "hero": {
    name: "hero",
    description: "天王: 吹奏实力不受其他因素影响。"
  }
}
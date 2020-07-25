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
  "taibu": {
    name: "taibu",
    description: "ability_desc_taibu",
    shouldWaitResponse: function() {
      let cards = this.foe.getFieldCards();
      return cards.some(card => {
        return !card.hasAbility("hero") &&
          card.getGrade() === 3;
      });
    },
    onAfterPlace: function(card) {
      this.send("played:attack", {
        attackPower: 100,
        grade: 3,
        highlight: this.foe.getFieldCards()
          .filter(c=>!c.hasAbility("hero") && c.getGrade()===3)
          .map(c=>c.getID()),
      }, true);
      this.sendNotificationTo(this.foe, "msg_choose_taibu", [this.getName()]);
    }
  },
  "attack": {
    name: "attack",
    description: "ability_desc_attack",
    shouldWaitResponse: function() {
      let cards = this.foe.getFieldCards();
      return cards.some(card => {
        return !card.hasAbility("hero") && !card.hasAbility("decoy");
      });
    },
    onAfterPlace: function(card) {
      this.send("played:attack", {
        attackPower: card.getAttackPower(),
        highlight: this.foe.getFieldCards()
          .filter(c=>!c.hasAbility("hero") && !c.hasAbility("decoy"))
          .map(c=>c.getID()),
      }, true);
      this.sendNotificationTo(this.foe, "msg_choose_attack", [this.getName()]);
    }
  },
  "lips": {
    name: "lips",
    description: "ability_desc_lips",
    onAfterPlace: function(card) {
      let self = this;
      let cards = this.foe.getFieldCards();
      cards.forEach(function(_card){
        // no male are hero, so
        if (_card.isMale()) {
          _card.setForcePowerBy(1, "lips");
          if (_card.getPower(true) <= 0) {
            var removed = self.foe.field[_card.getType()].removeCard(_card);
            self.foe.addToDiscard(removed, true);
          }
        }
      });
    }
  },
  "guard": {
    name: "guard",
    description: "ability_desc_guard",
    shouldWaitResponse: function() {
      if (this.field[1].get().every(card => card.getName() !== "中世古香织") &&
        this.foe.field[1].get().every(card => card.getName() !== "中世古香织")) {
        // Kaori not found
        return false;
      }
      // get brass field
      let cards = this.foe.field[1].get();
      return cards.some(card => {
        return !card.hasAbility("hero") && !card.hasAbility("decoy");
      });
    },
    onAfterPlace: function(card) {
      if (this.field[1].get().every(card => card.getName() !== "中世古香织") &&
        this.foe.field[1].get().every(card => card.getName() !== "中世古香织")) {
        // Kaori not found
        return;
      }
      this.send("played:attack", {
        attackPower: 4,
        field: 1,
        highlight: this.foe.field[1].get()
          .filter(c=>!c.hasAbility("hero") && !c.hasAbility("decoy"))
          .map(c=>c.getID()),
      }, true);
      this.sendNotificationTo(this.foe, "msg_choose_attack", [this.getName()]);
    },
    getRelatedCards: function(card) {
      return ["nakaseko_kaori"];
    },
  },
  "tunning": {
    name: "tunning",
    description: "ability_desc_tunning",
    onAfterPlace: function(card) {
      let cards = this.getFieldCards();
      cards.forEach(function(_card){
        if(_card.hasAbility("hero") || _card.hasAbility("decoy")) return;
        _card.resetNegBoost();
      });
    }
  },
  "monaka": {
    name: "monaka",
    description: "ability_desc_monaka",
    shouldWaitResponse: function() {
      let cards = this.getFieldCards();
      return cards.some(card => {
        return !card.hasAbility("hero") && !card.hasAbility("decoy");
      });
    },
    onAfterPlace: function(card) {
      var id = card.getID();
      this.send("played:heal", {
        healPower: 2,
        highlight: this.getFieldCards()
          .filter(c=>!c.hasAbility("hero") && !c.hasAbility("decoy") && c.getID()!==id)
          .map(c=>c.getID()),
      }, true);
      this.sendNotificationTo(this.foe, "msg_choose_heal", [this.getName()]);
    }
  },
  "kasa": {
    name: "kasa",
    description: "ability_desc_kasa",
    onRemovedOrReplaced: function(card) {
      var field = this.field[card.getType()];
      var id = card.getID();
      field.get().forEach(function(_card){
        if(_card.getName() === "铠冢霙") {
          _card.setBoost(id, 0);
        }
      })
    },
    onEachCardPlace: function(card){
      var field = this.field[card.getType()];
      var id = card.getID();
      field.get().forEach(function(_card){
        if(_card.getName() === "铠冢霙" && !_card.hasAbility("hero")) {
          _card.resetNegBoost();
          _card.setBoost(id, 5);
        }
      });
    },
    getRelatedCards: function(card) {
      return ["yoroizuka_mizore_2"];
    },
  },
  "medic": {
    name: "medic",
    description: "ability_desc_medic",
    waitResponse: true,
    onAfterPlace: function(card){
      var discard = this.getDiscard();

      discard = this.filter(discard, {
        "ability": "hero",
        "type": [card.constructor.TYPE.SPECIAL, card.constructor.TYPE.WEATHER]
      })

      this.send("played:medic", {
        cards: discard
      }, true);

      this.sendNotificationTo(this.foe, "msg_choose_medic", [this.getName()]);
    }
  },
  "morale_boost": {
    name: "morale_boost",
    description: "ability_desc_morale",
    onRemovedOrReplaced: function(card) {
      var field = this.field[card.getType()];
      var id = card.getID();
      field.get().forEach(function(_card){
        if(_card.getID() == id) return;
        if(_card.hasAbility("hero")) return;
        if(_card.getType() != card.getType()) return;
        _card.setBoost(id, 0);
      })
    },
    onEachCardPlace: function(card){
      // card is the morale_boost card, not the affected card
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
    description: "ability_desc_muster",
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
    },
    getRelatedCards: function(card, cardData, deck) {
      return deck.data.filter(c =>
        c !== card && cardData[c].musterType === cardData[card].musterType);
    },
  },
  "tight_bond": {
    name: "tight_bond",
    description: "ability_desc_bond",
    tightBond: true,
    onRemovedOrReplaced: function(card) {
      // recalculate tight bond
      var field = this.field[card.getType()];
      field.get().forEach(function(_card){
        if(!_card.hasAbility("tight_bond")) return;
        this.setTightBond(_card);
      }.bind(this))
    },
    getRelatedCards: function(card, cardData, deck) {
      return deck.data.filter(c => 
        c !== card && cardData[c].bondType === cardData[card].bondType);
    },
  },
  "spy": {
    name: "spy",
    description: "ability_desc_spy",
    changeSide: true,
    onAfterPlace: function(){
      this.draw(2);
      this.sendNotification("msg_played_spy", [this.getName()]);
    }
  },
  "weather_fog": {
    name: "weather_fog",
    description: "ability_desc_fog",
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
    description: "ability_desc_rain",
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
    description: "ability_desc_frost",
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
    description: "ability_desc_clear",
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
    description: "ability_desc_decoy",
    replaceWith: true
  },
  "scorch_card": {
    name: "scorch",
    description: "ability_desc_scorch_card",
    scorch: true,
    removeImmediately: true,
    nextTurn: true
  },
  "scorch": {
    name: "scorch",
    description: "ability_desc_scorch",
    scorchMelee: true
  },
  "commanders_horn": {
    name: "commanders_horn",
    description: "ability_desc_horn",
    onRemovedOrReplaced: function(card) {
      var field = this.field[card.getType()];
      var id = "commanders_horn";
      if (field.get().some(c=>c.hasAbility("commanders_horn"))) {
        // there are still commanders horn on the field
        return;
      }
      field.get().forEach(function(_card) {
        if(_card.getID() === id) return;
        if(_card.getID() === card.getID()) return;
        if(_card.getType() !== card.getType()) return;
        if(_card.hasAbility("hero")) return;
        _card.setBoost(id, 0);
      });
    },
    commandersHorn: true
  },
  "commanders_horn_card": {
    name: "commanders_horn",
    description: "ability_desc_horn_card",
    cancelPlacement: true,
    commandersHorn: true,
    isCommandersHornCard: true
  },
  "fog_leader": {
    name: "",
    description: "ability_desc_fog_leader",
    onActivate: function(){
      var cards = this.deck.find("key", "daisangakushou");
      let card;
      if(cards.length) {
        card = this.deck.removeFromDeck(cards[0]);
      } else {
        card = this.createCard("daisangakushou");
      }
      this.placeCard(card);
    }
  },
  "clear_weather_leader": {
    name: "",
    description: "ability_desc_clear",
    onActivate: function(){
      this.setWeather(5);
    }
  },
  "siege_horn_leader": {
    name: "",
    description: "Doubles the strength of all Siege units, unless a Commander's Horn is already in play on that row",
    onActivate: function(){
      this.setHorn("hashimoto", 2);
    }
  },
  "scorch_leader": {
    name: "scorch",
    description: "ability_desc_scorch_graduates",
    onActivate: function(card){
      this.scorchGraduates(card);
    }
  },
  "frost_leader": {
    name: "",
    description: "ability_desc_frost_leader",
    onActivate: function(){
      var cards = this.deck.find("key", "sunfes")
      let card;
      if(cards.length) {
        card = this.deck.removeFromDeck(cards[0]);
      } else {
        card = this.createCard("sunfes");
      }
      this.placeCard(card);
    }
  },
  "ranged_horn_leader": {
    name: "",
    description: "ability_desc_ranged_horn_leader",
    onActivate: function(){
      this.setHorn("niiyama", 1);
    }
  },
  "close_horn_leader": {
    name: "Eredin King of the Wild Hunt",
    description: "Double the strength of all your Close Combat units (unless a Commander's Horn is also present on that row).",
    onActivate: function(){
      this.setHorn("niiyama", 0);
    }
  },
  "emreis_leader4": {
    name: "",
    description: "ability_desc_emreis_leader",
    waitResponse: true,
    onActivate: function(card){
      var discard = this.foe.getDiscard();

      discard = this.filter(discard, {
        "ability": "hero",
        "type": [card.constructor.TYPE.SPECIAL, card.constructor.TYPE.WEATHER]
      })

      this.send("played:emreis_leader4", {
        cards: discard
      }, true);
    }
  },
  "hero": {
    name: "hero",
    description: "ability_desc_hero"
  }
}
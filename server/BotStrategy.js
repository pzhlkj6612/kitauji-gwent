var BotStrategy = (function(){
    var BotStrategy = function(bot){
      if(!(this instanceof BotStrategy)){
        return (new BotStrategy(bot));
      }
      this.bot = bot;
    };
    var r = BotStrategy.prototype;
  
    r.bot = null;

    r.generateForChooseAttack = function(attackPower, opt_grade, opt_field) {
      let state = this.bot.state;
      state.foeFields;
      let chooseFrom;
      if (opt_field != null) {
        chooseFrom = this.getFieldCards(false, opt_field);
      } else if (opt_grade != null) {
        chooseFrom = this.getFieldCards(false).filter(c=>c._data.grade===3);
      } else {
        chooseFrom = this.getFieldCards(false);
      }
      chooseFrom = chooseFrom.filter(c=>this.canReplace(c));
      if (chooseFrom.length > 0) {
        let choice = chooseFrom[0];
        let maxReward = 0;
        for (let i=0;i<chooseFrom.length;i++) {
          let c = chooseFrom[i];
          let reward = this.getAttackRewardForCard(c, attackPower);
          if (reward > maxReward) {
            maxReward = reward;
            choice = c;
          }
        }
        return [this.bot.chooseAttackCommand(choice, attackPower, opt_grade, opt_field)];
      }
      return [];
    }
    r.generateForChooseHeal = function() {
      let state = this.bot.state;
      let chooseFrom = [];
      let weatherFields = state.ownFields.weather.cards
        .map(w=>this.getFieldByWeather(w));
      let hornFields = [0,1,2]
        .filter(i=>this.getField(state.ownFields, i).horn);
      [0,1,2].filter(i=>{
        if (hornFields.length>0) {
          return hornFields.includes(i) && !weatherFields.includes(i);
        } else {
          return !weatherFields.includes(i);
        }
      }).forEach(i=>{
        chooseFrom = chooseFrom.concat(this.getFieldCards(true, i));
      })
      if (chooseFrom.length === 0) {
        chooseFrom = this.getFieldCards(true);
      }
      // default: choose randomly
      chooseFrom = chooseFrom.filter(c=>this.canReplace(c));
      if (chooseFrom.length > 0) {
        return [this.bot.chooseHealCommand(this.getRandom(chooseFrom), 2)];
      }
      return [];
    }
    r.generateForDecoy = function(card) {
      let state = this.bot.state;
      let fieldCards = this.getFieldCards(true);
      if (fieldCards.length === 0) return [];
      let spies = fieldCards.filter(c=>this.isSpy(c));
      if (spies.length > 0) {
        return [this.bot.playCardCommand(card), 
          this.bot.decoyReplaceWithCommand(this.getMin(spies))];
      }
      let medics = fieldCards.filter(c=>this.isMedic(c));
      if (medics.length > 0) {
        return [this.bot.playCardCommand(card), 
          this.bot.decoyReplaceWithCommand(this.getMax(medics))];
      }
      // if foe passing and we lead, keep leading after replace
      let lead = state.ownSide.score - state.foeSide.score;
      if (lead > 0 && state.foeSide.passing) {
        let toReplace = null;
        fieldCards.filter(c=>this.canReplace(c)).forEach(c=>{
          if (this.isBond(c)||this.isHorn(c)) return;
          if (c.power >= lead) return;
          if (!toReplace || c.power > toReplace.power) toReplace = c;
        });
        if (toReplace) {
          return [this.bot.playCardCommand(card), 
            this.bot.decoyReplaceWithCommand(toReplace)];
        }
      }
      let normal = fieldCards.filter(c=>this.canReplace(c));
      if (normal.length > 0) {
        return [this.bot.playCardCommand(card), 
          this.bot.decoyReplaceWithCommand(this.getMax(normal))];
      }
      return [];
    }
    r.generateForHornCard = function(card) {
      let state = this.bot.state;
      let fields = [state.ownFields.close, state.ownFields.ranged, state.ownFields.siege];
      let maxFieldType = 0, maxBoost = 0;
      for (let i=0; i<fields.length; i++) {
        let boost = this.getFieldBoostForHorn(fields[i]);
        if (boost > maxBoost) {
          maxBoost = boost;
          maxFieldType = i;
        }
      }
      return [this.bot.playCardCommand(card), this.bot.selectHornCommand(maxFieldType)];
    }
    r.generateForMedic = function(card) {
      let state = this.bot.state;
      let selectMedic = (currentDiscards) => {
        let medics = currentDiscards.filter(c=>this.isMedic(c));
        let spies = currentDiscards.filter(c=>this.isSpy(c));
        let normals = currentDiscards.filter(c=>this.canReplace(c));
        if (medics.length > 0) {
          let selected = this.getMax(medics);
          let remained = currentDiscards.filter(c => c._id !== selected._id);
          return [this.bot.medicChooseCardCommand(selected)].concat(selectMedic(remained));
        } else if (spies.length > 0) {
          return [this.bot.medicChooseCardCommand(this.getMin(spies))];
        } else if (normals.length > 0) {
          let card = this.getMax(normals);
          let commands = [this.bot.medicChooseCardCommand(card)];
          if (this.isAttack(card)) {
            commands = commands.concat(this.generateForChooseAttack(card._data.attackPower));
          } else if (this.isGuard(card)) {
            commands = commands.concat(this.generateForChooseAttack(4, null, 1));
          } else if (this.isTaibu(card)) {
            commands = commands.concat(this.generateForChooseAttack(100, 3));
          } else if (this.isMonaka(card)) {
            commands = commands.concat(this.generateForChooseHeal());
          }
          return commands;
        }
        return [this.bot.medicChooseCardCommand(null)];
      }
      let discard = state.ownSide.discard.filter(c => c._id !== card._id);
      return [this.bot.playCardCommand(card)].concat(selectMedic(discard));
    }
    r.generateCommands = function(card) {
      let state = this.bot.state;
      if (!card || state.ownHand.every(c => c._id !== card._id)) {
        return [];
      }
      if (card._data.ability === "decoy") {
        return this.generateForDecoy(card);
      } else if (this.isHorn(card, true)) {
        return this.generateForHornCard(card);
      } else if (this.isAttack(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(card._data.attackPower));
      } else if (this.isGuard(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(4, null, 1));
      } else if (this.isTaibu(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(100, 3));
      } else if (this.isMonaka(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseHeal());
      } else if (String(card._data.ability).includes("medic")) {
        let cards = this.generateForMedic(card);
        console.warn("generate for medic: ", cards);
        return cards;
      } else {
        return [this.bot.playCardCommand(card)];
      }
    }
    r.selectCard = function() {
      let state = this.bot.state;
      // play spies if exist
      let spies = state.ownHand.filter(c => this.isSpy(c, true));
      if (spies.length > 0) {
        return this.getMin(spies);
      }
      return this.getMaxPossibility(state.ownHand);
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
    r.getMax = function(cards, opt_comp) {
      let maxCard = cards[0];
      for (let i=0; i<cards.length; i++) {
        if (opt_comp && opt_comp(cards[i]) > opt_comp(maxCard)) {
          maxCard = cards[i];
        } else if (cards[i]._data.power > maxCard._data.power) {
          maxCard = cards[i];
        }
      }
      return maxCard;
    }
    r.getRandom = function(cards) {
      return cards[(Math.random() * cards.length) | 0];
    }
    r.getField = function(fields, field) {
      switch (field) {
        case 0:
          return fields.close;
        case 1:
          return fields.ranged;
        default:
          return fields.siege;
      }
    }
    r.getFieldCards = function(isOwn, opt_field) {
      let state = this.bot.state;
      let fields = isOwn ? state.ownFields : state.foeFields;
      if (opt_field !== null && opt_field !== undefined) {
        return this.getField(fields, opt_field).cards;
      }
      return fields.siege.cards
        .concat(fields.ranged.cards)
        .concat(fields.close.cards);
    }
    r.getHandCards = function(isOwn, opt_field) {
      let state = this.bot.state;
      let hand = isOwn ? state.ownHand : state.foeHand;
      if (opt_field !== null || opt_field !== undefined) {
        return hand.filter(c => c._data.type === opt_field);
      }
      return hand;
    }
    r.getMaxPossibility = function(cards) {
      // console.warn("start calculating rewards");
      let state = this.bot.state;
      let realPowers = [];
      let maxReward = -100, maxCardIdx = 0;
      for (let i=0; i<cards.length; i++) {
        let card = cards[i];
        let realPower = this.getRealPower(card);
        realPowers[i] = realPower;
        let reward = 0;
        if (this.isMedic(card, true)) {
          // play medic if spies in discard
          let discard = state.ownSide.discard;
          if (discard.length === 0) {
          } else if (discard.some(c=>this.isSpy(c))) {
            reward = 100;
          } else {
            reward = 1;
          }
        } else if (card._data.ability === "decoy") {
          // play decoy if spies or medic on own field
          if (this.getFieldCards(true).some(c=>this.isSpy(c))) {
            reward = 100;
          }
          // cheat!
          if (this.getHandCards(false).every(c=>!this.isSpy(c)) &&
            this.getFieldCards(true).some(c=>this.isMedic(c))) {
              reward = 100;
            }
          // if no replacable card, don't play it
          if (!this.getFieldCards(true).some(c=>this.canReplace(c))) {
            reward = -1;
          }
        } else if (this.isScorch(card)) {
          let foeClose = state.foeFields.close;
          if (foeClose.score > 10) {
            let scorchPower = this.getScoreSum(this.getHighestCards(foeClose.cards), c=>c.power);
            realPower += scorchPower;
            if (scorchPower >= 8) reward = 100;
            else reward = scorchPower + 1;
          }
        } else if (this.isScorch(card, true)) {
          let foeHighestCards = this.getHighestCards(this.getFieldCards(false));
          let ownHighestCards = this.getHighestCards(this.getFieldCards(true));
          if (foeHighestCards.reduce((_,c)=>c.power,0) > ownHighestCards.reduce((_,c)=>c.power,0)) {
            let scorchPower = this.getScoreSum(foeHighestCards, c=>c.power);
            realPower = scorchPower;
            if (scorchPower >= 10) reward = 100;
            else reward = scorchPower * 0.2;
          }
        } else if (this.isBond(card)) {
          reward = Math.max(realPower - card._data.power * 0.4, 0);
        } else if (this.isWeather(card)) {
          // clear weather?
          if (card._data.ability === "weather_clear") {
            let weathers = state.ownFields.weather.cards;
            let foeDebuff = 0, ownDebuff = 0;
            weathers.map(w=>this.getFieldByWeather(w)).forEach(f=>{
              foeDebuff += this.getScoreSum(this.getFieldCards(false, f).filter(c=>this.canReplace(c) && c.diff < 0), c=>c.diff);
              ownDebuff += this.getScoreSum(this.getFieldCards(true, f).filter(c=>this.canReplace(c) && c.diff < 0), c=>c.diff);
            });
            realPower = Math.max(foeDebuff - ownDebuff, 0);
            reward = foeDebuff - ownDebuff;
          } else {
            let field = this.getFieldByWeather(card);
            let foeScore = this.getScoreSum(this.getFieldCards(false, field).filter(c=>this.canReplace(c)), c=>c.power);
            let ownScore = this.getScoreSum(this.getFieldCards(true, field).filter(c=>this.canReplace(c)), c=>c.power);
            let handScore = this.getScoreSum(this.getHandCards(true, field).filter(c=>this.canReplace(c)), c=>c._data.power);
            // cheat!
            let foeHandScore = this.getScoreSum(this.getHandCards(false, field).filter(c=>this.canReplace(c)), c=>c._data.power);
            realPower = Math.max(foeScore - ownScore, 0);
            reward = foeScore - ownScore;
            if (foeScore > ownScore) reward += (foeHandScore - handScore) * 0.2;
          }
        } else if (this.isMoraleBoost(card)) {
          let field = this.getField(state.ownFields, card._data.type);
          let canBoost = field.cards.filter(c=>this.canReplace(c)).length;
          reward = Math.max(realPower - card._data.power * 0.5 + (canBoost - 1), 0);
          realPower += canBoost;
        } else if (this.isHorn(card, true)) {
          let fields = [state.ownFields.close, state.ownFields.ranged, state.ownFields.siege];
          let maxBoost = 0;
          for (let i=0; i<fields.length; i++) {
            let boost = this.getFieldBoostForHorn(fields[i]);
            if (boost > maxBoost) {
              maxBoost = boost;
            }
          }
          realPower = maxBoost;
          reward = maxBoost * 0.5;
        } else if (this.isHorn(card)) {
          realPower = this.getFieldBoostForHorn(this.getField(state.ownFields, card._data.type));
          reward = realPower * 0.5;
        } else if (this.isAttack(card)) {
          reward = this.getAttackReward(this.getFieldCards(false), card._data.attackPower);
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (this.isGuard(card)) {
          if (this.getFieldCards(true, 1).every(c=>c._data.name!=="中世古香织")) {
            reward = -4;
          } else {
            reward = this.getAttackReward(this.getFieldCards(false, 1), 4);
          }
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (this.isTaibu(card)) {
          reward = this.getAttackReward(
            this.getFieldCards(false).filter(c=>c._data.grade===3), 100);
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (this.isLips(card)) {
          let cards = this.getFieldCards(false).filter(c=>this.canReplace(c) && c._data.male);
          reward = Math.max(realPower + cards.length * 2 - card._data.power * 0.5, 0);
        } else if (this.isTunning(card)) {
          let weathers = state.ownFields.weather.cards.map(c=>this.getFieldByWeather(c));
          let negBoosts = this.getFieldCards(true).filter(c=>{
            return !weathers.includes(c._data.type) && c.diff < 0;
          }).reduce((sum,c)=>sum+c.diff,0);
          if (negBoosts === 0) {
            reward = 1;
          } else {
            reward = Math.max(realPower - negBoosts - card._data.power * 0.5, 0);
          }
        } else if (this.isMonaka(card)) {
          let cards = this.getFieldCards(false).filter(c=>this.canReplace(c));
          reward = Math.max(realPower - card._data.power * 0.5, 0);
          if (cards.length > 0) reward += 2;
          else reward -= 2;
        } else if (this.isHero(card)) {
          // play hero in later rounds
          reward = realPower * 0.5 * (2 - state.ownSide.lives);
        } else if (this.isMuster(card)) {
          realPower *= 3;
          reward = Math.max(realPower - card._data.power * 1.5, 0);
        } else {
          reward = Math.max(realPower - card._data.power * 0.5, 0);
        }
        console.warn("reward of ", card._data.name, " is ", reward);
        if (reward > maxReward) {
          maxReward = reward;
          maxCardIdx = i;
        }
      }
      if (maxReward >= 100) {
        return cards[maxCardIdx];
      }
      let handPower = realPowers.reduce((sum,p)=>sum+p,0);
      // cheat!
      let foeHandPower = state.foeHand.reduce((sum,c)=>sum+this.getRealPower(c,true),0);
      if (state.ownSide.lives > 1) {
        // 2:2 or 2:1
        if (maxReward <= 0) {
          if (state.foeSide.passing && state.foeSide.score - state.ownSide.score < 2) {
            // foe pass and score is close, try with low reward to win this round
          } else {
            console.warn("pass due to reward too small");
            return null;
          }
        }
        if (state.foeSide.score - state.ownSide.score > handPower * 1.0 / state.foeSide.lives) {
          if (state.foeSide.lives === 1 &&
              state.ownHand.some(c=>c._data.ability === "decoy") &&
              this.getFieldCards(true).some(c=>this.canReplace(c)) &&
              this.getFieldCards(false).every(c=>!this.isSpy(c))) {
              return state.ownHand.find(c=>c._data.ability === "decoy");
          }
          console.warn("pass due to foe leading too large");
          return null;
        }
        let realPower = realPowers[maxCardIdx];
        if (state.ownSide.score - state.foeSide.score + realPower > 20 + (state.ownSide.hand-5)*1.5 && state.ownSide.hand < state.foeSide.hand) {
          console.warn("pass due to large leading and too few cards at hand");
          return null;
        }
      } else if (state.foeSide.lives > 1) {
        // 1:2
        if (state.ownSide.score - state.foeSide.score > foeHandPower) {
          console.warn("pass due to large leading");
          return null;
        }
        if (state.ownSide.score > state.foeSide.score) {
          if (state.foeSide.passing) {
            if (state.ownHand.some(c=>c._data.ability === "decoy") &&
              this.getFieldCards(true).some(c=>this.canReplace(c))) {
              return state.ownHand.find(c=>c._data.ability === "decoy");
            }
          }
          if (handPower < foeHandPower * 0.3) {
            console.warn("pass due to too few cards at hand");
            return null;
          }
        }
      }
      if (state.ownSide.score <= state.foeSide.score && state.foeSide.passing) {
        console.warn("foe passing and lead, should play the smallest card which make us lead");
        let diff = state.foeSide.score - state.ownSide.score;
        let index = -1;
        realPowers.forEach((p,i)=>{
          if (p>diff && p<realPowers[index]) index = i;
        });
        if (index >= 0) return cards[index];
      }
      if (maxReward < 0) {
        console.warn("pass due to reward too small");
        return null;
      }
      if (state.ownSide.score > state.foeSide.score && state.foeSide.passing) {
        console.warn("pass due to foe passing and we lead");
        return null;
      }
      console.warn("selected ", cards[maxCardIdx]);
      return cards[maxCardIdx];
    }
    r.getAttackReward = function(cards, attackPower) {
      cards = cards.filter(c=>this.canReplace(c));
      if (cards.length === 0) {
        return -attackPower;
      }
      let maxCard = this.getMax(cards, c=>this.getAttackRewardForCard(c, attackPower));
      return this.getAttackRewardForCard(maxCard, attackPower);
    }
    r.getAttackRewardForCard = function(c, attackPower) {
      let reward = Math.min(attackPower, c.power);
      if (this.isHorn(c)) reward += 5;
      if (this.isMoraleBoost(c)) reward += 2;
      if (this.isBond(c)) reward++;
      if (this.isSpy(c)) reward = 0;
      if (c.diff < 0) reward++;
      return reward;
    }
    r.getRealPower = function(card, isFoe) {
      let state = this.bot.state;
      if (String(card._data.ability).includes("hero")) {
        return card._data.power;
      }
      let weathers = state.ownFields.weather.cards.map(c=>this.getFieldByWeather(c));
      let rawPower = card._data.power;
      if (weathers.includes(card._data.type)) {
        rawPower = 1;
      }
      let add = 0;
      let double = 0;
      let field = this.getField(isFoe ? state.foeFields : state.ownFields, card._data.type);
      if (field.horn || field.cards.some(c=>c._data.ability === "commanders_horn_card")) {
        double++;
      }
      add += field.cards.filter(c=>String(c._data.ability).includes("morale_boost")).length;
      if (this.isBond(card)) {
        double += field.cards.filter(c=>this.isBond(c, card._data.bondType)).length;
      }
      return (rawPower + add) * (2 ** double);
    }
    r.canReplace = function(card) {
      return !(this.isHero(card) || card._data.ability === "decoy" || card._data.ability === "scorch_card");
    }
    r.isSpy = function(card, includeHero) {
      return card._data.ability === "spy" ||
        (includeHero && String(card._data.ability).includes("spy"));
    }
    r.isHero = function(card) {
      return String(card._data.ability).includes("hero");
    }
    r.isScorch = function(card, isScorchCard) {
      if (isScorchCard) return card._data.ability === "scorch_card";
      return card._data.ability !== "scorch_card" && String(card._data.ability).includes("scorch");
    }
    r.isMedic = function(card, includeHero) {
      return card._data.ability === "medic" ||
        (includeHero && String(card._data.ability).includes("medic"));
    }
    r.isMuster = function(card) {
      return String(card._data.ability).includes("muster");
    }
    r.isMoraleBoost = function(card, includeHero) {
      return card._data.ability === "morale_boost" ||
        (includeHero && String(card._data.ability).includes("morale_boost"));
    }
    r.isHorn = function(card, isHornCard) {
      if (isHornCard) return card._data.ability === "commanders_horn_card";
      return card._data.ability !== "commanders_horn_card" && String(card._data.ability).includes("commanders_horn");
    }
    r.isBond = function(card, opt_bondType) {
      return card._data.ability === "tight_bond" &&
        (opt_bondType ? card._data.bondType === opt_bondType : true);
    }
    r.isMonaka = function(card) {
      return card._data.ability === "monaka";
    }
    r.isAttack = function(card) {
      return String(card._data.ability).includes("attack");
    }
    r.isTaibu = function(card) {
      return card._data.ability === "taibu";
    }
    r.isGuard = function(card) {
      return card._data.ability === "guard";
    }
    r.isLips = function(card) {
      return card._data.ability === "lips";
    }
    r.isTunning = function(card) {
      return card._data.ability === "tunning";
    }
    r.isWeather = function(card) {
      return card._data.type === 5;
    }
    r.getFieldByWeather = function(card) {
      switch (card._data.ability) {
        case "weather_frost":
          return 0;
        case "weather_fog":
          return 1;
        case "weather_rain":
          return 2;
      }
    }
    r.getFieldBoostForHorn = function(field) {
      if (field.cards.some(c=>this.isHorn(c)) || field.horn) return 0;
      return this.getScoreSum(field.cards.filter(c=>this.canReplace(c)), c=>c.power);
    }
    r.getScoreSum = function(cards, getScore) {
      return cards.reduce((sum, c)=> sum + getScore(c), 0);
    }
    r.getHighestCards = function(cards) {
      let highest = 0;
      cards = cards.filter(c=>this.canReplace(c));
      cards.forEach((card) => {
        highest = card.power > highest ? card.power : highest;
      });
      return cards.filter((card) => card.power === highest);
    }
    return BotStrategy;
  })();
  
  module.exports = BotStrategy;
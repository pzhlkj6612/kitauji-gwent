var Util = require("./CardUtil");
var Deck = require("./Deck");

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
      chooseFrom = chooseFrom.filter(c=>Util.canReplace(c));
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
    r.generateForChooseHeal = function(card) {
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
        chooseFrom = chooseFrom.concat(
          this.getFieldCards(true, i).filter(c=>Util.canReplace(c) && c._id !== card._id));
      })
      // default: choose randomly
      if (chooseFrom.length === 0) {
        chooseFrom = this.getFieldCards(true).filter(c=>Util.canReplace(c) && c._id !== card._id);
      }
      if (chooseFrom.length > 0) {
        return [this.bot.chooseHealCommand(this.getRandom(chooseFrom), 2)];
      }
      return [];
    }
    r.generateForDecoy = function(card) {
      let state = this.bot.state;
      let fieldCards = this.getFieldCards(true);
      if (fieldCards.length === 0) return [];
      let spies = fieldCards.filter(c=>Util.isSpy(c));
      if (spies.length > 0) {
        return [this.bot.playCardCommand(card), 
          this.bot.decoyReplaceWithCommand(this.getMin(spies))];
      }
      let medics = fieldCards.filter(c=>Util.isMedic(c));
      if (medics.length > 0) {
        return [this.bot.playCardCommand(card), 
          this.bot.decoyReplaceWithCommand(this.getMax(medics))];
      }
      let reusable = fieldCards.filter(c=>Util.isReusable(c));
      if (reusable.length > 0) {
        return [this.bot.playCardCommand(card),
          this.bot.decoyReplaceWithCommand(this.getMax(reusable, c=>-c.diff))];
      }
      // if foe passing and we lead, keep leading after replace
      let lead = state.ownSide.score - state.foeSide.score;
      if (lead > 0 && state.foeSide.passing) {
        let toReplace = fieldCards.filter(c=>Util.canReplace(c)).filter(c=>{
          if (Util.isBond(c)||Util.isHorn(c)) return false;
          if (c.power >= lead) return false;
        });
        if (toReplace.length > 0) {
          return [this.bot.playCardCommand(card), 
            this.bot.decoyReplaceWithCommand(this.getMax(toReplace, c=>-c.diff))];
        } else {
          return [];
        }
      }
      let normal = fieldCards.filter(c=>Util.canReplace(c));
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
        let boost = this.getFieldBoostForHorn(fields[i], i);
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
        let medics = currentDiscards.filter(c=>Util.isMedic(c));
        let spies = currentDiscards.filter(c=>Util.isSpy(c));
        let normals = currentDiscards.filter(c=>Util.canReplace(c));
        if (medics.length > 0) {
          let selected = this.getMax(medics);
          let remained = currentDiscards.filter(c => c._id !== selected._id);
          return [this.bot.medicChooseCardCommand(selected)].concat(selectMedic(remained));
        } else if (spies.length > 0 && state.ownSide.deck >= 2) {
          return [this.bot.medicChooseCardCommand(this.getMin(spies))];
        } else if (normals.length > 0) {
          let card = this.getMaxPossibility(normals, {fromDiscard: true});
          if (!card) card = this.getMax(normals);
          let commands = [this.bot.medicChooseCardCommand(card)];
          if (Util.isAttack(card)) {
            commands = commands.concat(this.generateForChooseAttack(card._data.attackPower));
          } else if (Util.isGuard(card)) {
            commands = commands.concat(this.generateForChooseAttack(4, null, 1));
          } else if (Util.isTaibu(card)) {
            commands = commands.concat(this.generateForChooseAttack(100, 3));
          } else if (Util.isMonaka(card)) {
            commands = commands.concat(this.generateForChooseHeal(card));
          }
          return commands;
        }
        return [this.bot.medicChooseCardCommand(null)];
      }
      let discard = state.ownSide.discard.filter(c => c._id !== card._id);
      return [this.bot.playCardCommand(card)].concat(selectMedic(discard));
    }
    r.generateForLeader = function(card) {
      let commands = [this.bot.playLeaderCommand()];
      if (card._data.ability === "emreis_leader4") {
        let state = this.bot.state;
        let foeDiscard = state.foeSide.discard || [];
        let medics = foeDiscard.filter(c=>Util.isMedic(c));
        let spies = foeDiscard.filter(c=>Util.isSpy(c));
        let normals = foeDiscard.filter(c=>Util.canReplace(c));
        if (medics.length) {
          commands.push(this.bot.playEmreisLeader4Command(this.getMax(medics)));
        } else if (spies.length && state.ownSide.deck >= 2) {
          commands.push(this.bot.playEmreisLeader4Command(this.getMin(spies)));
        } else if (normals.length) {
          commands.push(this.bot.playEmreisLeader4Command(this.getMax(normals)));
        } else {
          commands.push(this.bot.playEmreisLeader4Command(null));
        }
      }
      return commands;
    }
    r.generateCommands = function(card) {
      let state = this.bot.state;
      if (card && card._data.type === 3) {
        return this.generateForLeader(card);
      }
      if (!card || state.ownHand.every(c => c._id !== card._id)) {
        return [];
      }
      if (card._data.ability === "decoy") {
        return this.generateForDecoy(card);
      } else if (Util.isHorn(card, true)) {
        return this.generateForHornCard(card);
      } else if (Util.isAttack(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(card._data.attackPower));
      } else if (Util.isGuard(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(4, null, 1));
      } else if (Util.isTaibu(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseAttack(100, 3));
      } else if (Util.isMonaka(card)) {
        return [this.bot.playCardCommand(card)].concat(this.generateForChooseHeal(card));
      } else if (String(card._data.ability).includes("medic")) {
        let cards = this.generateForMedic(card);
        return cards;
      } else {
        return [this.bot.playCardCommand(card)];
      }
    }
    r.selectCard = function() {
      let state = this.bot.state;
      // play spies if exist
      let spies = state.ownHand.filter(c => Util.isSpy(c, true));
      if (spies.length > 0 && state.ownSide.deck >= 2) {
        return this.getMin(spies);
      }
      let cards = [].concat(state.ownHand);
      if (!state.ownLeader._disabled) {
        cards.push(state.ownLeader);
      }
      return this.getMaxPossibility(cards, {useAdvanceStrategy: true});
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
    /**
     * @param {Array} cards 
     * @param {Object} options
     * - useAdvanceStrategy: consider lives, store, etc.
     * - fromDiscard: is playing card from discard or not
     */
    r.getMaxPossibility = function(cards, options) {
      let {useAdvanceStrategy, fromDiscard} = (options || {});
      let state = this.bot.state;
      let realPowers = [];
      let maxReward = -100, maxCardIdx = 0;
      for (let i=0; i<cards.length; i++) {
        let card = cards[i];
        let realPower = this.getRealPower(card);
        let reward = 0;
        if (Util.isMedic(card, true)) {
          // play medic if spies in discard
          let discard = state.ownSide.discard;
          if (discard && discard.filter(c=>Util.canReplace(c)).length === 0) {
          } else if (discard.some(c=>Util.isSpy(c)) && state.ownSide.deck >= 2) {
            reward = 100;
            if (Util.isHero(card)) reward--;
          } else if (this.getFieldCards(true).some(c=>Util.isSpy(c)) &&
            state.ownSide.lives > 1) {
            reward = -1; // spy on own field, leave it for next round
          } else {
            reward = 1;
          }
        } else if (Util.isDecoy(card)) {
          // play decoy if spies or medic on own field
          if (this.getFieldCards(true).some(c=>Util.isSpy(c))
            && state.ownSide.deck >= 2) {
            reward = 100;
          }
          // cheat!
          if (this.getHandCards(false).every(c=>!Util.isSpy(c)) &&
            this.getFieldCards(true).some(c=>Util.isMedic(c))) {
              reward = 100;
            }
          // if no replacable card, don't play it
          if (!this.getFieldCards(true).some(c=>Util.canReplace(c))) {
            reward = -1;
          }
        } else if (Util.isScorch(card)) {
          let foeClose = state.foeFields.close;
          if (foeClose.score > 10) {
            let highest = this.getHighestCards(foeClose.cards);
            let scorchPower = this.getScoreSum(highest, c=>c.power);
            realPower += scorchPower;
            reward = scorchPower * 0.2;
          }
        } else if (Util.isScorch(card, true) || Util.isScorchLeader(card)) {
          let foeCards = this.getFieldCards(false);
          let ownCards = this.getFieldCards(true);
          reward = -1;
          if (Util.isScorchLeader(card)) {
            foeCards = foeCards.filter(c=>c._data.grade===3);
            ownCards = ownCards.filter(c=>c._data.grade===3);
          }
          let foeHighestCards = this.getHighestCards(foeCards);
          let ownHighestCards = this.getHighestCards(ownCards);
          if (((foeHighestCards[0] || {}).power || 0) <=
            ((ownHighestCards[0] || {}).power || 0)) {
            // don't scorch yourself!
            reward = -1;
          } else if (foeHighestCards.reduce((_,c)=>c.power,0) > ownHighestCards.reduce((_,c)=>c.power,0)) {
            let scorchPower = this.getScoreSum(foeHighestCards, c=>c.power);
            realPower = scorchPower;
            reward = scorchPower * 0.2;
            if (Util.isScorchLeader(card)) {
              reward *= 2;
            }
            if (foeHighestCards[0] && foeHighestCards[0].power >= 10 && Math.random() < 0.2) {
              reward = 100;
            }
          }
        } else if (Util.isBond(card)) {
          reward = Math.max(realPower - card._data.power * 0.4, 0);
          if (!this.isScoreLeading(realPower) && state.foeSide.passing) {
            reward *= Util.getSameBondType(card, cards);
          }
        } else if (Util.isWeather(card)) { // weather card or leader
          // clear weather?
          if (Util.isClearWeather(card)) {
            let weathers = state.ownFields.weather.cards;
            let foeDebuff = 0, ownDebuff = 0;
            weathers.map(w=>this.getFieldByWeather(w)).forEach(f=>{
              foeDebuff += this.getScoreSum(this.getFieldCards(false, f).filter(c=>Util.canReplace(c) && c.diff < 0), c=>c.diff);
              ownDebuff += this.getScoreSum(this.getFieldCards(true, f).filter(c=>Util.canReplace(c) && c.diff < 0), c=>c.diff);
            });
            realPower = Math.max(foeDebuff - ownDebuff, 0);
            reward = foeDebuff - ownDebuff;
          } else {
            let field = this.getFieldByWeather(card);
            let weathers = state.ownFields.weather.cards;
            if (weathers.some(w=>this.getFieldByWeather(w) === field)) {
              // same weather already exist
              reward = 0;
            } else {
              let foeScore = this.getScoreSum(this.getFieldCards(false, field).filter(c=>Util.canReplace(c)), c=>c.power);
              let ownScore = this.getScoreSum(this.getFieldCards(true, field).filter(c=>Util.canReplace(c)), c=>c.power);
              let handScore = this.getScoreSum(this.getHandCards(true, field).filter(c=>Util.canReplace(c)), c=>c._data.power);
              // cheat!
              let foeHandScore = this.getScoreSum(this.getHandCards(false, field).filter(c=>Util.canReplace(c)), c=>c._data.power);
              realPower = Math.max(foeScore - ownScore, 0);
              reward = foeScore - ownScore;
              if (foeScore > ownScore) reward += (foeHandScore - handScore) * 0.2;
            }
          }
        } else if (Util.isEmreisLeader4(card)) {
          let discard = state.foeSide.discard;
          if (!discard || discard.filter(c=>Util.canReplace(c)).length === 0) {
            reward = -1;
          } else if (discard.some(c=>Util.canReplace(c) && (Util.isSpy(c) || Util.isMedic(c)))) {
            reward = 100;
          } else {
            reward = 1;
          }
        } else if (Util.isMoraleBoost(card)) {
          let field = this.getField(state.ownFields, card._data.type);
          let canBoost = field.cards.filter(c=>Util.canReplace(c)).length;
          reward = Math.max(realPower - card._data.power * 0.5 + (canBoost - 1), 0);
          realPower += canBoost;
        } else if (Util.isHorn(card, true)) {
          let fields = [state.ownFields.close, state.ownFields.ranged, state.ownFields.siege];
          let maxBoost = 0;
          for (let i=0; i<fields.length; i++) {
            let boost = this.getFieldBoostForHorn(fields[i], i);
            if (boost > maxBoost) {
              maxBoost = boost;
            }
          }
          realPower = maxBoost;
          reward = maxBoost * 0.5;
        } else if (Util.isHorn(card)) {
          realPower = this.getFieldBoostForHorn(this.getField(state.ownFields, card._data.type), 1);
          reward = realPower * 0.5;
        } else if (Util.isHornLeader(card)) {
          if (card._data.ability === "ranged_horn_leader") {
            realPower = this.getFieldBoostForHorn(this.getField(state.ownFields, 1), 1);
          }
          reward = realPower * 0.5;
        } else if (Util.isAttack(card)) {
          reward = this.getAttackReward(this.getFieldCards(false), card._data.attackPower);
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (Util.isGuard(card)) {
          if (this.getFieldCards(true, 1).every(c=>c._data.name!=="中世古香织") &&
          this.getFieldCards(false, 1).every(c=>c._data.name!=="中世古香织")) {
            reward = -4;
          } else {
            reward = this.getAttackReward(this.getFieldCards(false, 1), 4);
          }
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (Util.isTaibu(card)) {
          reward = this.getAttackReward(
            this.getFieldCards(false).filter(c=>c._data.grade===3), 100);
          reward = Math.max(realPower + reward - card._data.power * 0.5, 0);
        } else if (Util.isLips(card)) {
          let cards = this.getFieldCards(false).filter(c=>Util.canReplace(c) && c._data.male);
          if (!cards.length) reward = 1;
          else reward = Math.max(realPower + cards.length * 2 - card._data.power * 0.5, 0);
        } else if (Util.isTunning(card)) {
          let weathers = state.ownFields.weather.cards.map(c=>this.getFieldByWeather(c));
          let negBoosts = this.getFieldCards(true).filter(c=>{
            return !weathers.includes(c._data.type) && c.diff < 0;
          }).reduce((sum,c)=>sum+c.diff,0);
          if (negBoosts === 0) {
            reward = 1;
          } else {
            reward = Math.max(realPower - negBoosts - card._data.power * 0.5, 0);
          }
        } else if (Util.isMonaka(card)) {
          let cards = this.getFieldCards(true).filter(c=>Util.canReplace(c));
          reward = Math.max(realPower - card._data.power * 0.5, 0);
          if (cards.length > 0) reward += 2;
          else reward -= 2;
        } else if (Util.isKasa(card)) {
          if (this.getFieldCards(true, 0).some(c=>c._data.name==="铠冢霙")) {
            reward = Math.max(realPower + 5 - card._data.power * 0.5, 0);
          } else {
            reward = 1;
          }
        } else if (Util.isHero(card)) {
          // play hero in later rounds
          reward = realPower * 0.5 * (2 - state.ownSide.lives);
        } else if (Util.isMuster(card) && !fromDiscard) {
          realPower *= 3;
          reward = Math.max(realPower - card._data.power * 1.5, 0);
        } else {
          reward = Math.max(realPower - card._data.power * 0.5, 0);
        }
        realPowers[i] = realPower;
        // console.warn("reward of ", card._data.name, " is ", reward);
        if (reward > maxReward) {
          maxReward = reward;
          maxCardIdx = i;
        }
        if (maxReward >= 100) {
          return cards[maxCardIdx];
        }
      }
      if (!useAdvanceStrategy) {
        return cards[maxCardIdx];
      }
      let handPower = realPowers.reduce((sum,p)=>sum+p,0);
      // cheat!
      let foeHandPower = Math.max(0, state.foeHand.reduce((sum,c)=>sum+this.getRealPower(c,true),0));
      if (state.ownSide.lives > 1) {
        // 2:2 or 2:1
        if (maxReward <= 0) {
          if (state.foeSide.passing && state.foeSide.score - state.ownSide.score < 2) {
            // foe pass and score is close, try with low reward to win this round
          } else {
            // console.warn("pass due to reward too small");
            return null;
          }
        }
        if (state.foeSide.score - state.ownSide.score > handPower * 1.5 / state.foeSide.lives) {
          if (state.foeSide.lives === 1 &&
              state.ownHand.some(c=>c._data.ability === "decoy") &&
              this.getFieldCards(true).some(c=>Util.canReplace(c)) &&
              this.getHandCards(false).every(c=>!Util.isSpy(c))) {
              return state.ownHand.find(c=>c._data.ability === "decoy");
          }
          // console.warn("pass due to foe leading too large");
          return null;
        }
        let realPower = realPowers[maxCardIdx];
        if (state.ownSide.score - state.foeSide.score + realPower > 20 + (state.ownSide.hand-5)*1.5 &&
          state.ownSide.hand < state.foeSide.hand &&
          state.foeSide.lives > 1) {
          // console.warn("pass due to large leading and too few cards at hand");
          return null;
        }
      } else if (state.foeSide.lives > 1) {
        // 1:2
        if (state.ownSide.score - state.foeSide.score > foeHandPower) {
          // console.warn(`pass due to large leading(foeHandPower=${foeHandPower})`);
          return null;
        }
        if (state.ownSide.score > state.foeSide.score) {
          if (state.foeSide.passing) {
            if (state.ownHand.some(c=>c._data.ability === "decoy") &&
              this.getFieldCards(true).some(c=>Util.canReplace(c))) {
              return state.ownHand.find(c=>c._data.ability === "decoy");
            }
          }
          if (handPower < foeHandPower * 0.3) {
            // console.warn("pass due to too few cards at hand");
            return null;
          }
        }
      }
      if (!this.isScoreLeading() && state.foeSide.passing) {
        // console.warn("foe passing and lead, should play the smallest card which make us lead");
        let diff = state.foeSide.score - state.ownSide.score;
        let index = -1;
        realPowers.forEach((p,i)=>{
          if (p>diff && p<realPowers[index] &&
            !(Util.isBond(cards[index]) && Util.getSameBondType(cards[index], cards) > 1))
            index = i;
        });
        if (index >= 0) return cards[index];
      }
      if (maxReward < 0) {
        // console.warn("pass due to reward too small");
        return null;
      }
      if (this.isScoreLeading() && state.foeSide.passing && state.foeSide.lives > 1) {
        // console.warn("pass due to foe passing and we lead, and not the last round");
        return null;
      }
      // console.warn("selected ", cards[maxCardIdx]);
      return cards[maxCardIdx];
    }
    r.isScoreLeading = function(opt_extra) {
      opt_extra = opt_extra || 0; // useful when calculate leading after play a card
      let state = this.bot.state;
      if (state.ownSide.faction === Deck.FACTION.OATHS_FINALE &&
          state.foeSide.faction !== Deck.FACTION.OATHS_FINALE) {
        return state.ownSide.score + opt_extra >= state.foeSide.score;
      }
      return state.ownSide.score + opt_extra > state.foeSide.score;
    }
    r.getAttackReward = function(cards, attackPower) {
      cards = cards.filter(c=>Util.canReplace(c));
      if (cards.length === 0) {
        return -attackPower;
      }
      let maxCard = this.getMax(cards, c=>this.getAttackRewardForCard(c, attackPower));
      return this.getAttackRewardForCard(maxCard, attackPower);
    }
    r.getAttackRewardForCard = function(c, attackPower) {
      let reward = Math.min(attackPower, c.power);
      if (Util.isHorn(c)) reward += 5;
      if (Util.isMoraleBoost(c)) reward += 2;
      if (Util.isBond(c)) reward++;
      if (Util.isSpy(c)) reward = 0;
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

      if (card._data.name === "铠冢霙" && field.cards.some(c=>Util.isKasa(c))) {
        add += 5;
      }
      add += field.cards.filter(c=>String(c._data.ability).includes("morale_boost")).length;
      if (Util.isBond(card)) {
        double += field.cards.filter(c=>Util.isBond(c, card._data.bondType)).length;
      }
      let res = (rawPower + add) * (1 + double);
      if (field.horn || field.cards.some(c=>c._data.ability === "commanders_horn_card")) {
        res *= 2;
      }
      return res;
    }
    r.getFieldByWeather = function(card) {
      switch (card._data.ability) {
        case "weather_frost":
        case "frost_leader":
          return 0;
        case "weather_fog":
        case "fog_leader":
          return 1;
        case "weather_rain":
          return 2;
      }
    }
    r.getFieldBoostForHorn = function(field, fieldIdx) {
      if (field.cards.some(c=>Util.isHorn(c)) || field.horn) return 0;
      let handScore = this.getScoreSum(this.getHandCards(false, fieldIdx).filter(c=>Util.canReplace(c)), c=>c._data.power);
      let boost =  handScore * 0.2 + this.getScoreSum(field.cards.filter(c=>Util.canReplace(c)), c=>c.power);
      if (this.getHandCards(true).some(c=>Util.isClearWeather(c))) {
        return boost;
      }
      return boost;
    }
    r.getScoreSum = function(cards, getScore) {
      return cards.reduce((sum, c)=> sum + getScore(c), 0);
    }
    r.getHighestCards = function(cards) {
      let highest = 0;
      cards = cards.filter(c=>Util.canReplace(c));
      cards.forEach((card) => {
        highest = card.power > highest ? card.power : highest;
      });
      return cards.filter((card) => card.power === highest);
    }
    return BotStrategy;
  })();
  
  module.exports = BotStrategy;

var DeckData = require("../assets/data/deck");
var CardData = require("../assets/data/cards");
var Const = require("./Const");

const RARITY_N = 0;
const RARITY_R = 1;
const RARITY_SR = 2;
const RARITY_SSR = 3;

const RARITIES = [
  RARITY_N,
  RARITY_R,
  RARITY_SR,
  RARITY_SSR,
];

const FACTION = [
  "kitauji",
  "kumiko1",
  "kumiko1S2"
];

const SCENARIOS = {
  [Const.SCENARIO_KYOTO]: {
    name: Const.SCENARIO_KYOTO,
    weights: [50, 30, 10, 2],
  },
  [Const.SCENARIO_KANSAI]: {
    name: Const.SCENARIO_KANSAI,
    weights: [10, 30, 10, 3],
  },
  [Const.SCENARIO_ZENKOKU]: {
    name: Const.SCENARIO_ZENKOKU,
    weights: [0, 20, 20, 5],
  }
}

let instance_;

class LuckyDraw {
  constructor() {
  }

  static getInstance() {
    if (!instance_) {
      instance_ = new LuckyDraw();
    }
    return instance_;
  }

  /**
   * generate gaussian random number using central limit
   */
  gaussianRandom(mu, sigma) {
    let nsamples = 12
    if (!sigma) sigma = 1
    if (!mu) mu = 0

    var run_total = 0
    for(var i=0 ; i<nsamples ; i++){
       run_total += Math.random()
    }

    return sigma*(run_total - nsamples/2)/(nsamples/2) + mu;
  }

  /**
   * Generate a list of how many draw is needed for each rarity
   */
  generateSteps_(weights) {
    let weightSum = weights.reduce((s,w)=>s+w, 0);
    return weights.map(w => {
      return this.generateStep_(w, weightSum);
    });
  }

  generateStep_(weight, weightSum) {
    let percent = weight * 1.0 / weightSum;
    return this.gaussianRandom(1/percent, 1/percent/3);
  }

  /**
   * Get next rarity to draw from
   */
  nextRarity_(weights, steps) {
    let minStep = 1.e9, minStepIdx = -1;
    steps.forEach((step, i) => {
      if (step < minStep) {
        minStep = step;
        minStepIdx = i;
      }
    });
    let result = RARITIES[minStepIdx];
    for (let i = 0; i < steps.length; i++) {
      steps[i] -= minStep;
    }
    let weightSum = weights.reduce((s,w)=>s+w, 0);
    steps[minStepIdx] = this.generateStep_(weights[minStepIdx], weightSum);
    return result;
  }

  async drawPreferOtherDeck(times, scenario, username, initialDeck) {
    let faction;
    let retry = 2;
    do {
      faction = FACTION[(Math.random() * FACTION.length) | 0];
    } while (faction === initialDeck && retry-- > 0);
    let cards = await draw(times, scenario, username, faction);
    return {
      faction,
      cards,
    };
  }

  async draw(times, scenario, username, deckKey) {
    scenario = SCENARIOS[scenario];
    let steps = await db.loadDrawStats(username, scenario.name);
    if (!steps) {
      steps = this.generateSteps_(scenario.weights);
    }
    let userDeck = await db.findCardsByUser(username, deckKey) || {};
    let newCards = [];
    for (let i = 0; i < times; i++) {
      let rarity = this.nextRarity_(scenario.weights, steps);
      let card = this.drawByRarity_(rarity, deckKey, userDeck);
      newCards.push(card);
      userDeck[card] = userDeck[card] ? userDeck[card] + 1 : 1;
    }
    await db.storeDrawStats(username, scenario.name, steps);
    return newCards;
  }

  drawByRarity_(rarity, deckKey, userDeck) {
    let deck = DeckData[deckKey];
    let cards = deck.data.filter(c => {
      return CardData[c].type !== 3 && CardData[c].rarity === rarity;
    });
    let card = cards[(Math.random() * cards.length) | 0];
    let retry = 3;
    // for unit card, draw again if user has it
    while (this.isUnitCard_(card) && userDeck[card] && retry > 0) {
      card = cards[(Math.random() * cards.length) | 0];
      // must skip duplicated bond/muster card
      if (userDeck[card] && (
        String(CardData[card].ability).includes("tight_bond") ||
        String(CardData[card].ability).includes("muster")
      )) {
        continue;
      }
      retry--;
    }
    return card;
  }

  isUnitCard_(card) {
    return CardData[card].type !== 4 && CardData[card].type !== 5;
  }
}

module.exports = LuckyDraw;

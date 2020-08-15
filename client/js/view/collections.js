let Backbone = require("backbone");

let cardData = require("../../../assets/data/cards");
let deckData = require("../../../assets/data/deck");
let abilityData = require("../../../assets/data/abilities");
let priceData = require("../../../assets/data/prices");
let Const = require("../const");

const TAB = {
  DECK: "deck",
  SKIN: "skin",
  FEE: "fee",
}

let Collections = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../../templates/collections.handlebars"),
  abilityDescTemplate: require("../../templates/ability.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this.app.receive("response:userCollections", this.onUserCollectionsResponse.bind(this));
    this.app.send("request:userCollections");
    this.tab = TAB.DECK;
    this.deckKey = "kitauji";
    this.collections = {};
    this.skins = [];
    this.leaderCollections = [];
    this.customDecks = {};
    this.dirty = false;
    this.chooseLeader = false;
    this.reset();
    $(".gwent-battle").html(this.el);
    this.render();
  },
  onUserCollectionsResponse: function(data) {
    this.deckKey = data.currentDeck;
    this.collections = data.collections || {};
    this.skins = Object.keys(this.collections[Const.FACTION_SKIN] || {});
    this.leaderCollections = Object.keys(data.leaderCollection || {});
    this.customDecks = data.customDecks || {};
    this.reset();
    this.render();
    this.showGuide();
  },
  reset: function() {
    this.collection = JSON.parse(JSON.stringify(this.collections[this.deckKey] || {}));
    let neutralCollection = this.collections["neutral"] || {};
    // add neutral cards to current collection
    for (let key of Object.keys(neutralCollection)) {
      this.addCardTo(this.collection, key, neutralCollection[key]);
    }
    // only show neutral or current faction leaders
    this.leaderCollection = this.leaderCollections
      .filter(l => cardData[l].faction === 'neutral' || cardData[l].faction === this.deckKey);
    this.currentDeck = this.customDecks[this.deckKey] || {};
    this.currentLeader = this.currentDeck["leader"] || this.leaderCollection[0];
    this.currentSkinMapping = this.currentDeck["skinMapping"] || {};
    // skins to choose from for a card
    this.currentSkinCollection = [];
    this.currentDeck = this.currentDeck["cardInDeck"] || {};
    for (let key of Object.keys(this.currentDeck)) {
      this.removeCardFrom(this.collection, key, this.currentDeck[key]);
    }
    this.collectionTab = "all_cards";
    this.deckTab = "all_cards";
  },
  events: {
    "change #deckChoice": "setDeck",
    "click .card-table.card-collections": "onCollectionClick",
    "click .card-table.card-in-deck": "onDeckClick",
    "click .card-filters.card-collections": "switchCollectionTab",
    "click .card-filters.card-in-deck": "switchDeckTab",
    "click .deck-confirm": "confirmDeck",
    "click .leader-field": "onLeaderClick",
    "click .leader-collection": "chooseLeader",
    "click .skin-selector": "chooseSkin",
    "mouseover .card-cell": "onMouseover",
    "mouseleave .card-cell": "onMouseleave",
    "click .button-quit": "onQuit",
    "click #navigation": "switchTab",
  },
  toLeaderList: function(deck) {
    return deck.filter(key => cardData[key].type === 3);
  },
  toCardMap: function(deck) {
    let cards = {};
    for (let key of deck) {
      // skip leader
      if (cardData[key].type === 3) continue;
      this.addCardTo(cards, key, 1);
    }
    return cards;
  },
  removeCardFrom: function(cards, key, count) {
    if (!cards[key]) return;
    cards[key] -= count;
    if (cards[key] === 0) {
      delete cards[key];
    }
  },
  addCardTo: function(cards, key, opt_count) {
    if (!opt_count) return;
    if (cards[key]) {
      cards[key] += opt_count;
    } else {
      cards[key] = opt_count;
    }
  },
  toCardModel: function(key, count, noMapping) {
    if (!key) return null;
    // if skin is used, show skin
    if (!noMapping && this.currentSkinMapping[key]) {
      key = this.currentSkinMapping[key];
    }
    let showPrice = this.tab === TAB.FEE &&
      cardData[key].type !== 3;
    return {
      _key: key,
      _data: cardData[key],
      _count: count || 1,
      _showCount: count ? count > 1 : false,
      _price: this.getCardPrice(key),
      _showPrice: showPrice,
    };
  },
  toLeaderCardModelList: function(leaderList) {
    let cards = [];
    for (let leader of leaderList) {
      cards.push(this.toCardModel(leader));
    }
    return cards;
  },
  toSkinModelList: function(skinList) {
    let cards = [];
    for (let skin of skinList) {
      cards.push(this.toCardModel(skin, 1, true));
    }
    return cards;
  },
  toCardSkinMap: function() {
    let result = {};
    for (let skin of this.skins) {
      let skinOf = cardData[skin].skinOf;
      if (result[skinOf]) {
        result[skinOf].push(skin);
      } else {
        result[skinOf] = [skin];
      }
    }
    return result;
  },
  toCardModelList: function(collection, tab) {
    let cards = [];
    let keys = Object.keys(collection);
    if (this.tab === TAB.SKIN) {
      // in skin tab, only show card with skin
      let skinMap = this.toCardSkinMap();
      keys = keys.filter(key => skinMap[key]);
    }
    for (let key of keys) {
      if (this.shouldSkipInTab(key, tab)) continue;
      if (!collection[key]) continue;
      cards.push(this.toCardModel(key, collection[key]));
    }
    cards.sort((a, b) => {
      let powerA = a._data.power + (String(a._data.ability).includes("hero") ? 100 : 0);
      let powerB = b._data.power + (String(b._data.ability).includes("hero") ? 100 : 0);
      if (powerA > powerB) return -1;
      else if (powerA < powerB) return 1;
      if (a._data.type > b._data.type) return -1;
      else if (a._data.type < b._data.type) return 1;
      return 0;
    });
    return cards;
  },
  shouldSkipInTab: function(key, tab) {
    switch (tab) {
      case "woodwind":
        return cardData[key].type !== 0;
      case "brasswind":
        return cardData[key].type !== 1;
      case "percussion":
        return cardData[key].type !== 2;
      case "special":
        return cardData[key].type !== 4 && cardData[key].type !== 5;
      default:
        return false;
    }
  },
  deckStats: function(cards) {
    let total = 0, unitCardCnt = 0, totalStrength = 0, heroCardCnt = 0;
    for (let key of Object.keys(cards)) {
      total += cards[key];
      if (cardData[key].type <= 2) {
        unitCardCnt += cards[key];
      }
      if (String(cardData[key].ability).includes("hero")) {
        heroCardCnt += cards[key];
      }
      totalStrength += Math.max(0, cardData[key].power) * cards[key];
    }
    return {
      total: total,
      unitCardCnt: unitCardCnt,
      specialCardCnt: total - unitCardCnt,
      totalStrength: totalStrength,
      heroCardCnt: heroCardCnt,
      totalSkin: this.skins.length,
      totalFee: this.user.get("userModel").wallet || 0,
    };
  },
  render: function(){
    if (!this.deckKey) return;
    let stats = this.deckStats(this.currentDeck);
    this.$el.html(this.template({
      "factionAbility": i18n.getText(`faction_ability_${this.deckKey}`),
      "cardCollection": this.toCardModelList(this.collection, this.collectionTab),
      "cardInDeck": this.tab === TAB.FEE ? [] : this.toCardModelList(this.currentDeck, this.deckTab),
      "leaderCollection": this.toLeaderCardModelList(this.leaderCollection),
      "skinCollection": this.toSkinModelList(this.currentSkinCollection),
      "collectionTab": i18n.getText(this.collectionTab),
      "deckTab": i18n.getText(this.deckTab),
      "leader": this.toCardModel(this.currentLeader),
      "specialExceed": stats.specialCardCnt > 10,
      "disabled": stats.total < 10 || stats.specialCardCnt > 10,
      "isSkinTab": this.tab === TAB.SKIN,
      "isDeckTab": this.tab === TAB.DECK,
      "isFeeTab": this.tab === TAB.FEE,
      "stats": stats,
    }));
    this.$el.find(`.card-collections .filter-icon[data-type="${this.collectionTab}"]`).addClass("active");
    this.$el.find(`.card-in-deck .filter-icon[data-type="${this.deckTab}"]`).addClass("active");
    this.$el.find(`#deckChoice option[value='${this.deckKey}']`).attr("selected", "selected");
    this.$el.find(`#navigation .btn-${this.tab}-page`).addClass("active");
    return this;
  },
  renderCardDesc: function($el) {
    let key = $el.data("key");
    let card = cardData[key];
    if(!card) return;

    let abilities = [];
    if(Array.isArray(card.ability)){
      abilities = card.ability.slice();
    } else if (card.ability) {
      abilities = [card.ability];
    }

    let relatedCards = [];
    let attackPower = card.attackPower || 0;
    let grade = card.grade || 0;
    abilities = abilities.map((ability) => {
      if (abilityData[ability].getRelatedCards) {
        relatedCards = relatedCards.concat(
          abilityData[ability].getRelatedCards(key, cardData, deckData[card.faction]));
      }
      return i18n.getText(abilityData[ability].description);
    })
    relatedCards = relatedCards.map(c => {
      return {
        owned: !!(this.collections[cardData[c].faction][c]),
        name: cardData[c].name,
      }
    });
    // name is zh by default.
    if (i18n.hasText(key)) {
      card.name = i18n.getText(key);
    }
    $el.append(this.abilityDescTemplate({
      name: card.name,
      abilities: abilities,
      relatedCards: relatedCards,
      hasRelatedCards: relatedCards.length > 0,
      attackPower: attackPower,
      hasAttackPower: attackPower > 0,
      grade: grade,
      hasGrade: grade > 0,
    }));
  },
  setDeck: function(e) {
    let val = $(e.target).val();
    this.deckKey = val;
    this.dirty = true;
    this.reset();
    this.render();
  },
  onCollectionClick: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) return;
    playSound("card1");
    let key = $card.data("key");
    key = cardData[key].skinOf || key;
    if (this.tab === TAB.SKIN) {
      this.openSkinSelector(key);
      return;
    }
    if (this.tab === TAB.FEE) {
      let model = Backbone.Model.extend({});
      let modal = new SellModal({model: new model({
        app: this.app,
        user: this.user,
        title: i18n.getText("sell_title", [cardData[key].name]),
        faction: this.deckKey,
        card: key,
        price: this.getCardPrice(key),
        max: this.collection[key],
      })});
      $(".container").prepend(modal.render().el);
      return;
    }
    this.removeCardFrom(this.collection, key, 1);
    this.addCardTo(this.currentDeck, key, 1);
    let scrolls = this.rememberScroll();
    this.render();
    this.restoreScroll(scrolls);
    this.dirty = true;
  },
  onDeckClick: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) return;
    playSound("card1");
    let key = $card.data("key");
    key = cardData[key].skinOf || key;
    if (this.tab === TAB.SKIN) {
      this.openSkinSelector(key);
      return;
    }
    if (this.tab === TAB.FEE) return;
    this.removeCardFrom(this.currentDeck, key, 1);
    this.addCardTo(this.collection, key, 1);
    let scrolls = this.rememberScroll();
    this.render();
    this.restoreScroll(scrolls);
    this.dirty = true;
  },
  rememberScroll: function() {
    let collectionScroll = $(".card-table.card-collections").scrollTop();
    let deckScroll = $(".card-table.card-in-deck").scrollTop();
    return [collectionScroll, deckScroll];
  },
  restoreScroll: function(scrolls) {
    $(".card-table.card-collections").scrollTop(scrolls[0]);
    $(".card-table.card-in-deck").scrollTop(scrolls[1]);
  },
  switchCollectionTab: function(e) {
    let $tab = $(e.target).closest(".filter-icon");
    if (!$tab.length) return;
    if ($tab.data("type") === this.collectionTab) {
      return;
    }
    this.collectionTab = $tab.data("type");
    this.render();
  },
  switchDeckTab: function(e) {
    let $tab = $(e.target).closest(".filter-icon");
    if (!$tab.length) return;
    if ($tab.data("type") === this.deckTab) {
      return;
    }
    this.deckTab = $tab.data("type");
    this.render();
  },
  switchTab: function(e) {
    let $tab = $(e.target).closest("button");
    if (!$tab.length) return;
    if ($tab.hasClass("btn-deck-page")) {
      this.tab = TAB.DECK;
    } else if ($tab.hasClass("btn-skin-page")) {
      this.tab = TAB.SKIN;
    } else if ($tab.hasClass("btn-fee-page")) {
      this.tab = TAB.FEE;
    }
    this.reset();
    this.render();
  },
  onMouseover: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) return;
    this.renderCardDesc($card);
  },
  onMouseleave: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) return;
    $card.find(".ability-desc").remove();
  },
  confirmDeck: function(e) {
    if($(e.target).closest(".deck-confirm").hasClass("disabled")) return;
    let customDeck = {
      deck: this.deckKey,
      cardInDeck: this.currentDeck,
      leader: this.currentLeader,
      skinMapping: this.currentSkinMapping,
    }
    if (this.dirty) {
      this.app.send("set:customDeck", customDeck);
    }
    this.app.lobbyRoute();
  },
  onQuit: function() {
    this.app.lobbyRoute();
  },
  onLeaderClick: function() {
    this.$el.find(".leader-collection").removeClass("hidden");
  },
  chooseLeader: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) {
      this.$el.find(".leader-collection").addClass("hidden");
      return;
    }
    this.currentLeader = $card.data("key");
    this.dirty = true;
    this.render();
    this.$el.find(".leader-collection").addClass("hidden");
  },
  openSkinSelector(card) {
    this.currentSkinCollection = [card].concat(this.skins
      .filter(skin => cardData[skin].skinOf === card));
    this.render();
    this.$el.find(".skin-selector").removeClass("hidden");
  },
  chooseSkin: function(e) {
    let $card = $(e.target).closest(".card-cell");
    if (!$card.length) {
      this.$el.find(".skin-selector").addClass("hidden");
      return;
    }
    let key = $card.data("key");
    if (!cardData[key].skinOf) {
      // if this is the default skin
      delete this.currentSkinMapping[key];
    } else {
      this.currentSkinMapping[cardData[key].skinOf] = key;
    }
    this.dirty = true;
    this.render();
    this.$el.find(".skin-selector").addClass("hidden");
  },
  getCardPrice: function(card) {
    return priceData.PRICE_BY_CARD[card] ||
      priceData.PRICE_BY_RARITY[cardData[card].rarity];
  },
  showGuide: function() {
    if (localStorage.getItem("skipCollectionGuide")) {
      return;
    }
    localStorage.setItem("skipCollectionGuide", true);
    setTimeout(() => {
      introJs()
        .setOption('showStepNumbers', false)
        .setOption('disableInteraction', true)
        .setOption('highlightClass', 'intro-highlight')
        .start();
    }, 1000);
  }
});

let SellModal = Backbone.Modal.extend({
  template: require("../../templates/modal.sell.handlebars"),
  events: {
    "click #btnConfirm": "onBtnClick",
    "input #amount": "onAmountChange",
  },
  onAmountChange: function() {
    let amount = Number(this.$el.find("#amount").val());
    if (amount > this.model.get("max")) {
      amount = this.model.get("max");
      this.$el.find("#amount").val(this.model.get("max"));
    }
    this.$el.find("#price").val(amount * this.model.get("price"));
  },
  onBtnClick: function() {
    let amount = this.$el.find("#amount").val();
    let price = this.$el.find("#price").val();
    this.model.get("app").send("request:sell", {
      faction: this.model.get("faction"),
      card: this.model.get("card"),
      amount: Number(amount),
    });
    this.model.get("user").get("userModel").wallet += Number(price);
    playSound("coin");
    this.remove();
  }
  
});

module.exports = Collections;

let Backbone = require("backbone");

let cardData = require("../../../assets/data/cards");
let abilityData = require("../../../assets/data/abilities");

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
    this.deckKey = "kitauji";
    this.collections = {};
    this.leaderCollection = [];
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
    this.leaderCollection = Object.keys(data.leaderCollection || {});
    this.customDecks = data.customDecks || {};
    this.reset();
    this.render();
  },
  reset: function() {
    this.collection = JSON.parse(JSON.stringify(this.collections[this.deckKey] || {}));
    let neutralCollection = this.collections["neutral"] || {};
    // add neutral cards to current collection
    for (let key of Object.keys(neutralCollection)) {
      this.addCardTo(this.collection, key, neutralCollection[key]);
    }
    this.currentDeck = this.customDecks[this.deckKey] || {};
    this.currentLeader = this.currentDeck["leader"] || this.leaderCollection[0];
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
    "click .leader-collection>.card-cell": "chooseLeader",
    "mouseover .card-cell": "onMouseover",
    "mouseleave .card-cell": "onMouseleave",
    "click .button-quit": "onQuit",
  },
  toLeaderList: function(deck) {
    return deck.filter(key => cardData[key].type === 3);
  },
  toCardMap: function(deck) {
    let cards = {};
    for (let key of deck) {
      // skip leader
      if (cardData[key].type === 3) continue;
      this.addCardTo(cards, key);
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
    opt_count = opt_count || 1;
    if (cards[key]) {
      cards[key] += opt_count;
    } else {
      cards[key] = opt_count;
    }
  },
  toCardModel: function(key, count) {
    if (!key) return null;
    return {
      _key: key,
      _data: cardData[key],
      _count: count || 1,
      _showCount: count ? count > 1 : false,
    };
  },
  toLeaderCardModelList: function(leaderList) {
    let cards = [];
    for (let leader of leaderList) {
      cards.push(this.toCardModel(leader));
    }
    return cards;
  },
  toCardModelList: function(collection, tab) {
    let cards = [];
    for (let key of Object.keys(collection)) {
      if (this.shouldSkipInTab(key, tab)) continue;
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
    };
  },
  render: function(){
    if (!this.deckKey) return;
    let stats = this.deckStats(this.currentDeck);
    this.$el.html(this.template({
      "factionAbility": i18n.getText(`faction_ability_${this.deckKey}`),
      "cardCollection": this.toCardModelList(this.collection, this.collectionTab),
      "cardInDeck": this.toCardModelList(this.currentDeck, this.deckTab),
      "leaderCollection": this.toLeaderCardModelList(this.leaderCollection),
      "collectionTab": i18n.getText(this.collectionTab),
      "deckTab": i18n.getText(this.deckTab),
      "leader": this.toCardModel(this.currentLeader),
      "specialExceed": stats.specialCardCnt > 10,
      "disabled": stats.total < 10 || stats.specialCardCnt > 10,
      "stats": stats,
    }));
    this.$el.find(`.card-collections .filter-icon[data-type="${this.collectionTab}"]`).addClass("active");
    this.$el.find(`.card-in-deck .filter-icon[data-type="${this.deckTab}"]`).addClass("active");
    this.$el.find(`#deckChoice option[value='${this.deckKey}']`).attr("selected", "selected");
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

    abilities = abilities.map((ability) => {
      return i18n.getText(abilityData[ability].description);
    })
    // name is zh by default.
    if (i18n.hasText(key)) {
      card.name = i18n.getText(key);
    }
    $el.append(this.abilityDescTemplate({
      name: card.name,
      abilities: abilities,
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
    this.removeCardFrom(this.collection, key, 1);
    this.addCardTo(this.currentDeck, key);
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
    this.removeCardFrom(this.currentDeck, key, 1);
    this.addCardTo(this.collection, key);
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
    if (!$card.length) return;
    this.currentLeader = $card.data("key");
    this.dirty = true;
    this.render();
    this.$el.find(".leader-collection").addClass("hidden");
  }
});

module.exports = Collections;

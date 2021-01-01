let Backbone = require("backbone");
const Util = require("../util");
const funDeck = require("../../../assets/data/fun-deck");
const Const = require("../const");

let SideView = Backbone.View.extend({
  el: ".container",
  template: require("../../templates/cards.handlebars"),
  templateCards: require("../../templates/fieldCards.handlebars"),
  templateInfo: require("../../templates/info.handlebars"),
  templateCardpiles: require("../../templates/cardpiles.handlebars"),
  initialize: function(options){
    let self = this;
    this.side = options.side;
    this.app = options.app;
    this.battleView = options.battleView;
    this.infoData = this.infoData || {};
    this.leader = this.leader || {};
    this.field = this.field || {};
    this.countDownTimer = null;
    this.timeLeft = 30; // 30 seconds by default
    /**
     * Can be changed when switch player during replay.
     */
    this.isPlayerSide = (this.side === ".player");

    this.app.on("timer:start", function() {
      if (self.side === ".foe") return;
      if (self.countDownTimer != null) {
        // already started
        return;
      }
      self.timeLeft = 30;
      self.countDownTimer = setInterval(function() {
        self.timeLeft--;
        if (self.timeLeft === 0) {
          self.battleView.onPassing();
          clearInterval(self.countDownTimer);
          self.countDownTimer = null;
        }
        self.renderInfo();
      }, 1000);
    });
    this.app.on("timer:cancel", function() {
      clearInterval(self.countDownTimer);
      self.countDownTimer = null;
    });
  },
  render: function(){
    this.renderInfo();
    this.renderCloseField();
    this.renderRangeField();
    this.renderSiegeField();
    this.renderWeatherField();
    this.renderPlayCardAnimation();
    this.renderGetCardAnimation();

    return this;
  },
  renderInfo: function(){
    let d = this.infoData;
    let l = this.leader;
    this.applyCardStyle_([l]);
    let deckName = i18n.getText(Util.toFactionText(d.faction));
    if (d.funDeck && funDeck[d.funDeck]) {
      deckName = `${funDeck[d.funDeck].name}（${deckName}）`
    }
    let html = this.templateInfo({
      data: d,
      leader: l,
      passBtn: this.side === ".player" &&
        (this.isPlayerSide && !this.app.user.get("waiting") ||
        !this.isPlayerSide && this.app.user.get("waiting")),
      switchBtn: this.battleView.readOnly && this.side !== ".player",
      hideTimer: this.app.user.get("withBot"),
      timeLeft: this.timeLeft,
      danger: this.timeLeft < 10,
      deck: deckName,
    })

    this.$info = this.$el.find(".game-info" + this.side).html(html);
    let $infoInner = this.$info.find(".info-inner");

    /*let $deck = $(this.side + " .field-deck");
    $deck*/

    this.$deck = $(this.side + ".right-side");
    this.$deck.html(this.templateCardpiles({
      data: d
    }));


    $infoInner.addClass("active-field");
    if(this.app.user.get("waiting") && this.isPlayerSide){
      $infoInner.removeClass("active-field");
    }
    if(!this.app.user.get("waiting") && !this.isPlayerSide){
      $infoInner.removeClass("active-field");
    }
  },
  renderCloseField: function(){
    if(!this.field.close) return;
    this.$fields = this.$el.find(".battleside" + this.side);
    let $field = this.$fields.find(".field-close").parent();
    let cards = this.field.close.cards;
    let score = this.field.close.score;
    let horn = this.field.close.horn;

    this.applyCardStyle_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-close").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.applyCardStyle_([horn]);
      this.$fields.find(".field-horn-close").html(this.templateCards([horn]));
    } else {
      this.$fields.find(".field-horn-close").html("");
    }

    let isInfluencedByWeather;
    this.field.weather.cards.forEach((card) =>{
      let key = card._key;
      if(key === "biting_frost" || key === "sunfes") isInfluencedByWeather = true;
    })

    if(isInfluencedByWeather){
      this.$el.find(".field-close").parent().addClass("field-frost");
    } else {
      this.$el.find(".field-close").parent().removeClass("field-frost");
    }

    this.calculateCardMargin($field.find(".field-close"), 5);
  },
  applyCardStyle_: function(cards) {
    if (this.side === ".foe") {
      let attackData = this.app.user.get("chooseAttack");
      if (attackData) {
        cards.filter(c => attackData.highlight.includes(c._id))
          .forEach(c => c._highlight = true);
      } else {
        cards.forEach(c => c._highlight = false);
      }
    } else {
      let attackData = this.app.user.get("chooseHeal");
      if (attackData) {
        cards.filter(c => attackData.highlight.includes(c._id))
          .forEach(c => c._highlight = true);
      } else {
        cards.forEach(c => c._highlight = false);
      }
    }
    if (this.app.user.get("theme") === Const.THEME_KYOANI) {
      cards.forEach(c => {
        c._theme = true;
        if (c._data) {
          c._themeImg = Util.getThemeImgName(c);
        }
        if (c._data && c._data.type !== 3) {
          c._isHero = String(c._data.ability).includes("hero");
          c._mainAbility = Util.getMainAbility(c._data.ability);
        }
      })
    } else {
      cards.forEach(c => {
        c._theme = false;
      })
    }
  },
  renderRangeField: function(){
    if(!this.field.ranged) return;
    this.$fields = this.$el.find(".battleside" + this.side);
    let $field = this.$fields.find(".field-range").parent();
    let cards = this.field.ranged.cards;
    let score = this.field.ranged.score;
    let horn = this.field.ranged.horn;

    this.applyCardStyle_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-range").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.applyCardStyle_([horn]);
      this.$fields.find(".field-horn-range").html(this.templateCards([horn]));
    } else {
      this.$fields.find(".field-horn-range").html("");
    }

    let isInfluencedByWeather;
    this.field.weather.cards.forEach((card) =>{
      let key = card._key;
      if(key === "impenetrable_fog" || key === "daisangakushou") isInfluencedByWeather = true;
    })

    if(isInfluencedByWeather){
      this.$el.find(".field-range").parent().addClass("field-fog");
    } else {
      this.$el.find(".field-range").parent().removeClass("field-fog");
    }

    //calculateCardMargin($field.find(".card"), 351, 70, cards.length);
    this.calculateCardMargin($field.find(".field-range"), 5);
  },
  renderSiegeField: function(){
    if(!this.field.siege) return;
    this.$fields = this.$el.find(".battleside" + this.side);
    let $field = this.$fields.find(".field-siege").parent();
    let cards = this.field.siege.cards;
    let score = this.field.siege.score;
    let horn = this.field.siege.horn;

    this.applyCardStyle_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-siege").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.applyCardStyle_([horn]);
      this.$fields.find(".field-horn-siege").html(this.templateCards([horn]));
    } else {
      this.$fields.find(".field-horn-siege").html("");
    }

    let isInfluencedByWeather;
    this.field.weather.cards.forEach((card) =>{
      let key = card._key;
      if(key === "torrential_rain" || key === "wasure") isInfluencedByWeather = true;
    })

    if(isInfluencedByWeather){
      this.$el.find(".field-siege").parent().addClass("field-rain");
    } else {
      this.$el.find(".field-siege").parent().removeClass("field-rain");
    }

    //calculateCardMargin($field.find(".card"), 351, 70, cards.length);
    this.calculateCardMargin($field.find(".field-siege"), 5);
  },
  renderGetCardAnimation: function() {
    let getCard = this.infoData.getCard;
    if (!getCard) return;
    let id = getCard._id;
    let $card = $(`.field-hand .card[data-id='${id}']`);
    if (!$card || $card.length === 0) {
      return;
    }
    if (this.battleView.animatedGetCards[id]) {
      console.info("already animated");
      return;
    }
    this.battleView.animatedGetCards[id] = true;
    let $getCard = $(".get-card-animation");
    $getCard.html($card.html());
    $getCard.addClass("move-to-hand");
    setTimeout(() => {
      let {x, y} = this.battleView.getElementCenter($('.right-side'));
      $getCard.removeClass("move-to-hand");
      $getCard.css({
        'transform': `translate(${x}px, ${y}px)`,
      });
    }, 500);
  },
  renderPlayCardAnimation: function() {
    let placedCard = this.infoData.placedCard;
    if (!placedCard) {
      return;
    }
    let id = placedCard._id;
    let card = $(`.battleside .card[data-id='${id}'],.field-weather .card[data-id='${id}']`);
    if (!card || card.length === 0) {
      return;
    }
    if (this.battleView.animatedCards[id]) {
      console.info("already animated");
      return;
    }
    this.battleView.animatedCards[id] = true;
    let ability = card.data("ability");
    let sub, subAnimClass;
    let animClass = null;
    if (ability.includes("attack") ||
      ability.includes("guard") ||
      ability.includes("taibu") ||
      ability.includes("monaka")) {
      return;
    }
    if (ability.includes("medic")) {
      animClass = "medic-card";
      if (this.side === ".player") {
        // skip animation for player side, otherwise flash screen
        return;
      }
    } else if (ability.includes("spy")) {
      animClass = "spy-card";
    } else if (ability.includes("morale")) {
      animClass = "morale_boost-card";
    } else if (ability.includes("commanders_horn")) {
      animClass = "commanders_horn-card";
    } else if (ability.includes("decoy")) {
      animClass = "decoy-card";
    } else if (ability.includes("kasa")) {
      animClass = "kasa-card";
    } else if (ability.includes("tight_bond")) {
      card = $(`${this.side} .card[data-bondType='${card.data("bondtype")}']`);
      if (card.length >= 2) {
        animClass = "tight_bond-card";
      }
    } else if (ability.includes("muster")) {
      card = $(`${this.side} .card[data-musterType='${card.data("mustertype")}']`);
      if (card.length >= 2) {
        animClass = "muster-card";
      }
    } else if (ability.includes("tunning")) {
      playSound("heal");
      animClass = "tunning-card";
      sub = $(`${this.side} .card`);
      subAnimClass = "heal-anim-card";
    } else if (ability.includes("lips")) {
      animClass = "lips-card";
      sub = $(`${this.side === ".foe" ? ".player" : ".foe"} .card`);
      subAnimClass = "attack-anim-card";
    }
    if (ability.includes("hero")) {
      animClass = animClass ? animClass+" hero-card" : "hero-card";
    } else {
      animClass = animClass ? animClass+" normal-card" : "normal-card";
    }
    // weather animation
    if (ability.includes("frost")) {
      sub = this.$el.find(".field-close").parent();
      subAnimClass = "field-weather-anim";
    } else if (ability.includes("fog")) {
      sub = this.$el.find(".field-range").parent();
      subAnimClass = "field-weather-anim";
    } else if (ability.includes("rain")) {
      sub = this.$el.find(".field-siege").parent();
      subAnimClass = "field-weather-anim";
    }
    this.battleView.waitForAnimation = true;
    playSound("card1");
    card.addClass(animClass);
    card.addClass("ability-card");
    if (sub) {
      sub.addClass(subAnimClass);
    }
    setTimeout(() => {
      // card.removeClass(animClass);
      // card.removeClass("ability-card");
      if (sub) {
        sub.removeClass(subAnimClass);
      }
      this.battleView.waitForAnimation = false;
      this.battleView.render();
    }, 500);
  },
  renderWeatherField: function(){
    if(!this.field.weather) return;
    let $weatherField = this.$el.find(".field-weather");
    let cards = this.field.weather.cards;
    $weatherField.html(this.templateCards(cards));

    this.battleView.calculateMargin($weatherField, 0);
    return this;
  },
  calculateCardMargin: function($container) {
    if (this.app.user.get("theme") !== Const.THEME_KYOANI) {
      this.battleView.calculateMargin($container, 9);
      return;
    }
    let minSize = 5;
    var Class = $container.find(".card-wrap").length ? ".card-wrap" : ".card";
    let cards = $container.find(Class);
    var n = cards.length;
    let w = $container.height(), c = cards.outerHeight(true);
    let res;
    if(n < minSize)
      res = 0;
    else {
      res = -((w - c) / (n - 1) - c) + 1;
    }
    w += c;
    cards.not(Class+":first-child").css("margin-top", -res);
    let containerTop = $container.offset().top;
    for (let i = 0; i < n; i++) {
      let card = cards[i];
      let offset = $(card).offset().top + $(card).outerHeight(true) - containerTop;
      let margin = Math.round(100 * Math.pow(Math.abs(offset - w / 2) / w * 2, 2)) - 10;
      margin = this.isPlayerSide ? margin: -margin;
      $(card).css({"transform": `translate(${margin}px,0)`});
    }
  }
});

module.exports = SideView;

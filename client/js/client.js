let socket = require("socket.io-client");
let Backbone = require("backbone");
require("./backbone.modal-min");
let Handlebars = require('handlebars/runtime').default;
let $ = require("jquery");

let CollectionsView = require("./view/collections");
let I18n = require("./i18n");
let cardData = require("../../assets/data/cards");
let abilityData = require("../../assets/data/abilities");

window.$ = $;
window.i18n = new I18n("zh");

Handlebars.registerPartial("card", require("../templates/cards.handlebars"));
Handlebars.registerPartial("cardCell", require("../templates/cardCell.handlebars"));
Handlebars.registerHelper("health", function(lives){
  let out = "";

  for(let i = 0; i < 2; i++) {
    out += "<i";
    if(i < lives){
      out += " class='ruby'";
    }
    out += "></i>";
  }
  return out;
});
Handlebars.registerHelper("formatMessage", function(msg){
  let out = "";
  var lines = msg.split(/\n/g);

  lines.forEach(function(line){
    out += line + "<br>";
  })

  return out;
});

let App = Backbone.Router.extend({
  routes: {
    /*"lobby": "lobbyRoute",
    "battle": "battleRoute",
    "*path": "defaultRoute"*/
  },
  initialize: function(){
    let self = this;
    this.off();
    this.connect();
    if (this.user) {
      this.user.stopListening();
    }
    this.user = new User({app: this});

    /*Backbone.history.start();*/
    this.lobbyRoute();
  },
  connect: function(){
    if (this.socket) {
      // call off before close, otherwise will trigger reconnect callback
      this.socket.off();
      this.socket.close();
    }
    let hostname = Config.Server.hostname;
    if (!hostname) {
      hostname = location.hostname;
    }
    this.socket = socket("http://" + hostname + ":" + Config.Server.port);
    var self = this;
    console.log(this.socket.connected);
    this.socket.on("connect", function(socket){
      self.send("user:init", {
        connId: localStorage["connectionId"],
      });
      self.user.set("serverOffline", false);
    })
    this.socket.on("disconnect", function(socket){
      setTimeout(() => {
        self.initialize();
      }, 1000);
      self.user.set("serverOffline", true);
    })
  },
  receive: function(event, cb){
    this.socket.on(event, cb);
  }, /*
  receiveOnce: function(event, cb){
    this.socket.once(event, cb);
  },*/
  send: function(event, data){
    data = data || null;
    let socket = this.socket;

    if(!data){
      socket.emit(event);
    }
    if(data){
      socket.emit(event, data);
    }
  },
  getCurrentView: function() {
    return this.currentView;
  },

  lobbyRoute: function(){
    if(this.currentView){
      this.currentView.remove();
      if (!$(".gwent-battle").length) {
        $(".notifications").after('<div class="gwent-battle"></div>');
      }
      $(".notification-left").remove();
    }
    this.currentView = new Lobby({
      app: this,
      user: this.user
    });
  },
  battleRoute: function(){
    if(this.currentView){
      this.currentView.remove();
      if (!$(".gwent-battle").length) {
        $(".notifications").after('<div class="gwent-battle"></div>');
      }
    }
    this.currentView = new BattleView({
      app: this,
      user: this.user
    });
  },
  collectionsRoute: function() {
    if(this.currentView){
      this.currentView.remove();
      if (!$(".gwent-battle").length) {
        $(".notifications").after('<div class="gwent-battle"></div>');
      }
    }
    this.currentView = new CollectionsView({
      app: this,
      user: this.user
    });
  },
  defaultRoute: function(path){
    this.navigate("lobby", {trigger: true});
  },
  parseEvent: function(event){
    let regex = /(\w+):?(\w*)\|?/g;
    let res = {};
    let r;
    while(r = regex.exec(event)) {
      res[r[1]] = r[2];
    }

    return res;
  }
});

let SideView = Backbone.View.extend({
  el: ".container",
  template: require("../templates/cards.handlebars"),
  templateCards: require("../templates/fieldCards.handlebars"),
  templateInfo: require("../templates/info.handlebars"),
  templateCardpiles: require("../templates/cardpiles.handlebars"),
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

    return this;
  },
  renderInfo: function(){
    let d = this.infoData;
    let l = this.leader;
    let html = this.templateInfo({
      data: d,
      leader: l,
      passBtn: this.side === ".player" && !this.app.user.get("waiting"),
      timeLeft: this.timeLeft,
      danger: this.timeLeft < 10,
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
    if(this.app.user.get("waiting") && this.side === ".player"){
      this.$info.addClass("removeBackground");
      $infoInner.removeClass("active-field");
    }
    if(!this.app.user.get("waiting") && this.side === ".foe"){
      this.$info.addClass("removeBackground");
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

    this.highlightCards_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-close").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.$fields.find(".field-horn-close").html(this.templateCards([horn]));
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

    //calculateCardMargin($field.find(".card"), 351, 70, cards.length);
    this.battleView.calculateMargin($field.find(".field-close"), 8);
  },
  highlightCards_: function(cards) {
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
  },
  renderRangeField: function(){
    if(!this.field.ranged) return;
    this.$fields = this.$el.find(".battleside" + this.side);
    let $field = this.$fields.find(".field-range").parent();
    let cards = this.field.ranged.cards;
    let score = this.field.ranged.score;
    let horn = this.field.ranged.horn;

    this.highlightCards_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-range").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.$fields.find(".field-horn-range").html(this.templateCards([horn]));
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
    this.battleView.calculateMargin($field.find(".field-range"), 8);
  },
  renderSiegeField: function(){
    if(!this.field.siege) return;
    this.$fields = this.$el.find(".battleside" + this.side);
    let $field = this.$fields.find(".field-siege").parent();
    let cards = this.field.siege.cards;
    let score = this.field.siege.score;
    let horn = this.field.siege.horn;

    this.highlightCards_(cards);

    let html = this.templateCards(cards);

    $field.find(".field-siege").html(html)
    $field.find(".large-field-counter").html(score)
    if(horn){
      this.$fields.find(".field-horn-siege").html(this.templateCards([horn]));
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
    this.battleView.calculateMargin($field.find(".field-siege"), 8);
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
      animClass = "morale-card";
    } else if (ability.includes("commanders_horn")) {
      animClass = "horn-card";
    } else if (ability.includes("decoy")) {
      animClass = "decoy-card";
    } else if (ability.includes("kasa")) {
      animClass = "kasa-card";
    } else if (ability.includes("tight_bond")) {
      card = $(`${this.side} .card[data-bondType='${card.data("bondtype")}']`);
      if (card.length >= 2) {
        animClass = "bond-card";
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
      subAnimClass = "heal-card";
    } else if (ability.includes("lips")) {
      animClass = "lips-card";
      sub = $(`${this.side === ".foe" ? ".player" : ".foe"} .card`);
      subAnimClass = "attack-card";
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
  }
  /*,
  lives: function(lives){
    let out = "";
    for(let i = 0; i < 2; i++) {
      out += "<i";
      if(i < lives){
        out += " class='ruby'";
      }
      out += "></i>";
    }
    return out;
  }*/
});

let BattleView = Backbone.View.extend({
  template: require("../templates/battle.handlebars"),
  initialize: function(options){
    let self = this;
    let user = this.user = options.user;
    let app = this.app = options.app;
    let yourSide, otherSide;
    this.waitForAnimation = false;
    this.animatedCards = {};

    $(this.el).prependTo('.gwent-battle');

    this.listenTo(user, "change:showPreview", this.renderPreview);
    this.listenTo(user, "change:waiting", this.render);
    this.listenTo(user, "change:passing", this.render);
    this.listenTo(user, "change:openDiscard", this.render);
    this.listenTo(user, "change:setAgile", this.render);
    this.listenTo(user, "change:setHorn", this.render);
    this.listenTo(user, "change:chooseAttack", this.render);
    this.listenTo(user, "change:chooseHeal", this.render);
    this.listenTo(user, "change:isReDrawing", this.render);
    this.listenTo(user, "change:chooseSide", this.render);

    this.$hand = this.$el.find(".field-hand");
    this.$preview = this.$el.find(".card-preview");

    //$(window).on("resize", this.calculateMargin.bind(this, this.$hand));

    let interval = setInterval(function(){
      if(!user.get("room")) return;
      this.setUpBattleEvents();
      this.app.send("request:gameLoaded", {_roomID: user.get("room")});
      clearInterval(interval);
    }.bind(this), 10);

    bgm.play();
    this.render();


    this.yourSide = new SideView({side: ".player", app: this.app, battleView: this});
    this.otherSide = new SideView({side: ".foe", app: this.app, battleView: this});

  },
  events: {
    "mouseover .card": "onMouseover",
    "mouseleave .card": "onMouseleave",
    "click .field-hand": "onClick",
    "click .battleside.player": "onClickFieldCard",
    "click .battleside.foe": "onClickFoeFieldCard",
    "click .button-pass": "onPassing",
    "click .button-quit": "onQuit",
    "click .field-discard": "openDiscard",
    "click .field-leader.card-wrap": "clickLeader"
  },
  onPassing: function(){
    if(this.user.get("passing")) return;
    if(this.user.get("waiting")) return;
    this.user.set("passing", true);
    this.user.get("app").send("set:passing");
    this.user.get("app").trigger("timer:cancel");
  },
  onQuit: function() {
    this.user.get("app").send("request:quitGame");
    this.user.get("app").trigger("timer:cancel");
    this.user.get("app").initialize();
  },
  onClick: function(e){
    if(!!this.user.get("waiting")) return;
    if(!!this.user.get("passing")) return;

    let self = this;
    let $card = $(e.target).closest(".card");
    if (!$card.length) return;
    let id = $card.data("id");
    let key = $card.data("key");

    this.app.trigger("timer:cancel"); // cancel timer
    if(!!this.user.get("setAgile")){
      if(id === this.user.get("setAgile")){
        this.user.set("setAgile", false);
        this.app.send("cancel:agile");
        this.render();
      }
      return;
    }
    if(!!this.user.get("setHorn")){
      if(id === this.user.get("setHorn")){
        this.user.set("setHorn", false);
        this.app.send("cancel:horn");
        this.render();
      }
      return;
    }
    if(!!this.user.get("waitForDecoy")){
      if(id === this.user.get("waitForDecoy")){
        this.user.set("waitForDecoy", false);
        this.app.send("cancel:decoy");
        this.render();
      }
      return;
    }

    this.app.send("play:cardFromHand", {
      id: id
    });
    // if this is the last card, pass automatically
    if (self.$el.find(".field-hand").find('.card').length === 1 &&
      !$card.data("ability").includes("medic") &&
      !$card.data("ability").includes("commanders_horn_card") &&
      !$card.data("ability").includes("attack") &&
      !$card.data("ability").includes("monaka") &&
      !$card.data("ability").includes("taibu") &&
      !$card.data("ability").includes("guard") &&
      !$card.data("ability").includes("decoy")) {
      setTimeout(function() {
        self.onPassing();
      }, 0);
    }
    let playCard = $(".play-card-animation");
    playCard.html($card.html());
    let type = $card.data("type");
    let isSpy = $card.data("ability").includes("spy");
    let animationClass;
    switch (type) {
      case 0:
        animationClass = isSpy ? "move-to-foe-close" : "move-to-player-close";
        break;
      case 1:
        animationClass = isSpy ? "move-to-foe-range" : "move-to-player-range";
        break;
      case 2:
        animationClass = isSpy ? "move-to-foe-siege" : "move-to-player-siege";
        break;
    }
    playCard.addClass(animationClass);
    setTimeout(() => {
      playCard.removeClass(animationClass);
    }, 200);


    if(key === "decoy" || key === "tubakun"){
      //console.log("its decoy!!!");
      this.user.set("waitForDecoy", id);
      this.render();
    }
    if(key === "pool" || key === "daikichiyama") {
      $('.sunray-animation').removeClass("invisible");
      setTimeout(() => {
        $('.sunray-animation').addClass("invisible");
      }, 500);
    }
  },
  onClickFoeFieldCard: function(e) {
    if (!!this.user.get("chooseAttack")) {
      let $card = $(e.target).closest(".card");
      if(!$card.length) return;
      let _id = $card.data("id");
      if($card.parent().hasClass("field-horn")) return;
      this.app.send("attack:chooseAttack", {
        cardID: _id,
        attackPower: Number(this.user.get("chooseAttack").attackPower),
        grade: this.user.get("chooseAttack").grade,
        field: this.user.get("chooseAttack").field,
      });
      this.user.set("chooseAttack", false);
    }
  },
  onClickFieldCard: function(e){
    if (!!this.user.get("chooseHeal")) {
      let $card = $(e.target).closest(".card");
      if(!$card.length) return;
      let _id = $card.data("id");
      if($card.parent().hasClass("field-horn")) return;
      this.app.send("heal:chooseHeal", {
        cardID: _id,
        healPower: Number(this.user.get("chooseHeal").healPower)
      });
      this.user.set("chooseHeal", false);
    }
    if(this.user.get("waitForDecoy")){
      let $card = $(e.target).closest(".card");
      if(!$card.length) return;
      let _id = $card.data("id");

      if($card.parent().hasClass("field-horn")) return;

      this.app.send("decoy:replaceWith", {
        cardID: _id
      })
      this.user.set("waitForDecoy", false);
    }
    if(this.user.get("setAgile")){
      let $field = $(e.target).closest(".active-field");

      //console.log($field);
      let target = $field.hasClass("field-close") ? 0 : 1;
      this.app.send("agile:field", {
        field: target
      });
      this.user.set("setAgile", false);
    }
    if(this.user.get("setHorn")){
      let $field = $(e.target).closest(".active-field");

      //console.log($field);
      let target = $field.hasClass("field-close") ? 0 : ($field.hasClass("field-range") ? 1 : 2);
      this.app.send("horn:field", {
        field: target
      });
      this.user.set("setHorn", false);
    }
  },
  onMouseover: function(e){
    let target = $(e.target).closest(".card");
    var hasPreviewB = target.parent().hasClass("preview-b");

    this.user.set("showPreview", new Preview({key: target.data().key, previewB: hasPreviewB}));
  },
  onMouseleave: function(e){
    this.user.get("showPreview").remove();
    this.user.set("showPreview", null);
  },
  openDiscard: function(e){
    let $discard = $(e.target).closest(".field-discard");
    //console.log("opened discard");
    let side;
    if($discard.parent().parent().hasClass("player")){
      side = this.yourSide;
    }
    else {
      side = this.otherSide;
    }
    this.user.set("openDiscard", {
      discard: side.infoData.discard,
      name: side.infoData.name
    });
  },
  render: function(){
    let self = this;
    if (self.waitForAnimation) {
      return;
    }
    this.$el.html(this.template({
      cards: self.handCards,
      active: {
        close: self.user.get("setAgile") || self.user.get("setHorn"),
        range: self.user.get("setAgile") || self.user.get("setHorn"),
        siege: self.user.get("setHorn")
      },
      isWaiting: self.user.get("waiting")
    }));
    if(!(this.otherSide && this.yourSide)) return;
    this.otherSide.render();
    this.yourSide.render();


    if(this.handCards){
      this.calculateMargin(this.$el.find(".handcard-wrap"), 10);
    }

    if(this.user.get("isReDrawing")){
      this.user.set("handCards", this.handCards);
      let modal = new ReDrawModal({model: this.user});
      this.$el.prepend(modal.render().el);
    }
    if(this.user.get("openDiscard")){
      let modal = new Modal({model: this.user});
      this.$el.prepend(modal.render().el);
    }
    if(this.user.get("chooseSide")){
      let modal = new ChooseSideModal({model: this.user});
      this.$el.prepend(modal.render().el);
    }
    if(this.user.get("medicDiscard")){
      let modal = new MedicModal({model: this.user});
      this.$el.prepend(modal.render().el);
    }
    if(this.user.get("emreis_leader4")){
      let modal = new LeaderEmreis4Modal({model: this.user});
      this.$el.prepend(modal.render().el);
    }
    if(this.user.get("setAgile")){
      let id = this.user.get("setAgile");
      this.$el.find("[data-id='" + id + "']").parent().addClass("activeCard");
    }
    if(this.user.get("setHorn")){
      let id = this.user.get("setHorn");
      this.$el.find("[data-id='" + id + "']").addClass("activeCard");
    }
    if(this.user.get("waitForDecoy")){
      let id = this.user.get("waitForDecoy");
      this.$el.find("[data-id='" + id + "']").addClass("activeCard");
    }
    return this;
  },
  renderPreview: function(){
    /*let preview = new Preview({key: this.user.get("showPreview")});*/
    let preview = this.user.get("showPreview");
    if(!preview){
      return;
    }
    this.$el.find(".card-preview").html(preview.render().el);
    /*this.$el.find(".card-preview").html(this.templatePreview({src: this.user.get("showPreview")}))
    this.$el.find(".card-preview").css("display", "none");
    if(this.user.get("showPreview")) {
      this.$el.find(".card-preview").css("display", "block");
    }*/
  },
  clickLeader: function(e){
    let $card = $(e.target).closest(".field-leader");
    if(!$card.parent().hasClass("player")) return;
    if($card.find(".card").hasClass("disabled")) return;

    //console.log("click leader");


    this.app.send("activate:leader")
  },
  setUpBattleEvents: function(){
    let self = this;
    let user = this.user;
    let app = user.get("app");

    app.on("update:hand", function(data){
      if(user.get("roomSide") == data._roomSide){
        self.handCards = data.cards;
        self.user.set("handCards", app.handCards);
        self.render();
      }
    })
    app.on("new:round", function() {
      self.animatedCards = {};
    })
    app.on("update:info", function(data){
      let _side = data._roomSide;
      let infoData = data.info;
      let leader = data.leader;

      let side = self.yourSide;
      if(user.get("roomSide") != _side){
        side = self.otherSide;
      }
      side.infoData = infoData;
      side.leader = leader;

      side.infoData.discard = side.infoData.discard;
      let scorched = side.infoData.scorched || [];
      let attacked = side.infoData.attacked || [];
      let healed = side.infoData.healed || [];
      if (!scorched.length && !attacked.length && !healed.length) {
        self.render();
        return;
      }
      self.waitForAnimation = true;
      let scorchedCards = scorched.map(c=>{
        let card = $(`.card[data-id='${c._id}']`);
        card.addClass("scorch-card");
        return card;
      });
      let attackedCards = attacked.map(c=>{
        let card = $(`.card[data-id='${c._id}']`);
        card.addClass("attack-card");
        return card;
      });
      let healedCards = healed.map(c=>{
        let card = $(`.card[data-id='${c._id}']`);
        card.addClass("heal-card");
        return card;
      });
      if (scorchedCards.length) {
        playSound("fire");
      }
      if (attackedCards.length) {
        playSound("hit");
      }
      if (healedCards.length) {
        playSound("heal1");
      }
      setTimeout(() => {
        scorchedCards.forEach(c=>c.removeClass("scorch-card"));
        attackedCards.forEach(c=>c.removeClass("attack-card"));
        healedCards.forEach(c=>c.removeClass("heal-card"));
        self.waitForAnimation = false;
        self.render();
      }, 500);

    })

    app.on("update:fields", function(data){
      let _side = data._roomSide;

      let side = self.yourSide;
      if(user.get("roomSide") != _side){
        side = self.otherSide;
      }
      side.field.close = data.close;
      side.field.ranged = data.ranged;
      side.field.siege = data.siege;
      side.field.weather = data.weather;
      if (!self.waitForAnimation) {
        side.render();
      }
    })

  },
  calculateMargin: function($container, minSize){
    minSize = typeof minSize === "number" && minSize >= 0 ? minSize : 6;
    var Class = $container.find(".card-wrap").length ? ".card-wrap" : ".card";
    var n = $container.children().size();
    let w = $container.width(), c = $container.find(Class).outerWidth(true);
    let res;
    if(n < minSize)
      res = 0;
    else {
      res = -((w - c) / (n - 1) - c) + 1;
    }

    $container.find(Class).not(Class+":first-child").css("margin-left", -res);
  }
});

let Modal = Backbone.Modal.extend({
  template: require("../templates/modal.handlebars"),
  cancelEl: ".bbm-close",
  cancel: function(){
    this.model.set("openDiscard", false);
  }
});

let MedicModal = Modal.extend({
  template: require("../templates/modal.medic.handlebars"),
  events: {
    "click .card": "onCardClick"
  },
  onCardClick: function(e){
    //console.log($(e.target).closest(".card"));
    let id = $(e.target).closest(".card").data().id;
    this.model.get("app").send("medic:chooseCardFromDiscard", {
      cardID: id
    })
    this.model.set("medicDiscard", false);
  },
  cancel: function(){
    this.model.get("app").send("medic:chooseCardFromDiscard")
    this.model.set("medicDiscard", false);
  }
});

let LeaderEmreis4Modal = Modal.extend({
  template: require("../templates/modal.emreis_leader4.handlebars"),
  events: {
    "click .card": "onCardClick"
  },
  onCardClick: function(e){
    let id = $(e.target).closest(".card").data().id;
    this.model.get("app").send("emreis_leader4:chooseCardFromDiscard", {
      cardID: id
    })
    this.model.set("emreis_leader4", false);
  },
  cancel: function(){
    this.model.get("app").send("emreis_leader4:chooseCardFromDiscard")
    this.model.set("emreis_leader4", false);
  }
});

let ReDrawModal = Modal.extend({
  template: require("../templates/modal.redraw.handlebars"),
  initialize: function(){
    this.listenTo(this.model, "change:isReDrawing", this.cancel);
  },
  events: {
    "click .card": "onCardClick"
  },
  onCardClick: function(e){
    //console.log($(e.target).closest(".card"));
    let id = $(e.target).closest(".card").data().id;
    this.model.get("app").send("redraw:reDrawCard", {
      cardID: id
    })
  },
  cancel: function(){
    if(!this.model.get("isReDrawing")) return;
    this.model.get("app").send("redraw:close_client");
    this.model.set("isReDrawing", false);
  }
});

let WinnerModal = Modal.extend({
  template: require("../templates/modal.winner.handlebars"),
  events: {
    "click .startMatchmaking": "onBtnClick"
  },
  onBtnClick: function(e) {
    this.remove();
    this.model.get("app").initialize();
  }
});

let ChooseSideModal = Modal.extend({
  template: require("../templates/modal.side.handlebars"),
  events: {
    "click .btn": "onBtnClick"
  },
  beforeCancel: function(){
    return false;
  },
  onBtnClick: function(e){
    var id = $(e.target).data().id;

    this.model.set("chooseSide", false);
    if(id === "you"){
      //this.model.set("chosenSide", this.model.get("roomSide"));
      this.model.chooseSide(this.model.get("roomSide"));
      this.remove();
      return;
    }
    //this.model.set("chosenSide", this.model.get("roomFoeSide"));
    this.model.chooseSide(this.model.get("roomFoeSide"));
    this.remove();
  }
});

let User = Backbone.Model.extend({
  defaults: {
    name: typeof localStorage["userName"] === "string" ? localStorage["userName"].slice(0, 20) : null,
    deck: "random",
    locale: "zh",
    serverOffline: true
  },
  initialize: function(){
    let self = this;
    let user = this;
    let app = user.get("app");

    self.set("chooseSide", false);

    // this.listenTo(this.attributes, "change:room", this.subscribeRoom);
    app.receive("user:init", function(data) {
      localStorage["connectionId"] = data.connId;
    });

    app.receive("response:name", function(data){
      self.set("name", data.name);
    });

    app.receive("init:battle", function(data){
      //console.log("opponent found!");
      self.set("roomSide", data.side);
      self.set("roomFoeSide", data.foeSide);
      /*
            self.set("channel:battle", app.socket.subscribe(self.get("room")));*/
      //app.navigate("battle", {trigger: true});
      app.battleRoute();
    })

    app.receive("response:joinRoom", function(roomID){
      self.set("room", roomID);
      //console.log("room id", self.get("room"));
    })

    app.receive("room:rejoin", function(data) {
      self.set("roomSide", data.side);
      self.set("roomFoeSide", data.foeSide);
      self.set("room", data.roomId);
      app.battleRoute();
    })

    app.receive("set:waiting", function(data){
      let waiting = data.waiting;
      if (!waiting) {
        app.trigger("timer:start");
      }
      self.set("waiting", waiting);
    })

    app.receive("set:passing", function(data){
      let passing = data.passing;
      self.set("passing", passing);
    })

    app.receive("foe:left", function(){
      $(".notification-left").remove();
      $(".container").prepend('<div class="notification-left">对方已离线!</div>')
    })

    app.receive("foe:connecting", function(){
      $(".notification-left").remove();
      $(".container").prepend('<div class="notification-left notification-connecting">对方连接中...</div>')
    })

    app.receive("foe:reconnect", function(){
      $(".notification-left").remove();
    })

    app.receive("played:medic", function(data){
      let cards = data.cards;
      self.set("medicDiscard", {
        cards: cards
      });
    })

    app.receive("played:emreis_leader4", function(data){
      let cards = data.cards;
      self.set("emreis_leader4", {
        cards: cards
      });
    })

    app.receive("played:agile", function(data){
      //console.log("played agile");
      self.set("setAgile", data.cardID);
    })

    app.receive("played:horn", function(data){
      //console.log("played horn");
      self.set("setHorn", data.cardID);
    })

    app.receive("played:attack", function(data){
      self.set("chooseAttack", data);
    })

    app.receive("played:heal", function(data){
      self.set("chooseHeal", data);
    })

    app.receive("redraw:cards", function(){
      self.set("isReDrawing", true);
    })

    app.receive("redraw:close", function(){
      self.set("isReDrawing", false);
    })

    app.receive("update:info", function(data){
      let info = {
        _roomSide: data._roomSide,
        info: data.info,
        leader: data.leader,
      };
      app.trigger("update:info", info);
      let hand = {
        _roomSide: data._roomSide,
        cards: data.cards,
      };
      app.trigger("update:hand", hand);
      let fields = {
        _roomSide: data._roomSide,
        close: data.close,
        ranged: data.ranged,
        siege: data.siege,
        weather: data.weather
      };
      app.trigger("update:fields", fields);
    })

    app.receive("new:round", function() {
      app.trigger("new:round");
      playSound("smash");
    });

    app.receive("gameover", function(data){
      let winner = data.winner;
      if (winner === self.get("name")) {
        playSound("win");
      } else {
        playSound("smash");
      }
      localStorage.removeItem("connectionId");
      app.trigger("timer:cancel"); // cancel existing timer
      //console.log("gameover");
      let p1Scores = data.p1Scores;
      let p2Scores = data.p2Scores;
      p1Scores[2] = p1Scores[2] || 0;
      p2Scores[2] = p2Scores[2] || 0;

      let model = Backbone.Model.extend({});
      let modal = new WinnerModal({model: new model({
        app: app,
        winner: winner,
        p1_1: p1Scores[0],
        p2_1: p2Scores[0],
        p1_win_1: p1Scores[0] >= p2Scores[0],
        p2_win_1: p1Scores[0] <= p2Scores[0],
        p1_2: p1Scores[1],
        p2_2: p2Scores[1],
        p1_win_2: p1Scores[1] >= p2Scores[1],
        p2_win_2: p1Scores[1] <= p2Scores[1],
        p1_3: p1Scores[2],
        p2_3: p2Scores[2],
        p1_win_3: p1Scores[2] > 0 && p1Scores[2] >= p2Scores[2],
        p2_win_3: p2Scores[2] > 0 && p1Scores[2] <= p2Scores[2],
      })});
      $("body").prepend(modal.render().el);
    })
    app.receive("request:chooseWhichSideBegins", function(){
      self.set("chooseSide", true);
    })

    app.on("startMatchmakingWithBot", this.startMatchmakingWithBot, this);
    app.on("startMatchmaking", this.startMatchmaking, this);
    app.on("joinRoom", this.joinRoom, this);
    app.on("setName", this.setName, this);
    app.on("setDeck", this.setDeck, this);
    $("#locale").change(this.setLocale.bind(this));

    app.receive("notification", function(data){
      new Notification(data).render();
    })

    app.send("request:name", this.get("name") === null ? null : {name: this.get("name")});
    this.setDeck(localStorage["userDeck"] || "random");
    this.set("locale", localStorage["locale"] || "zh");
    i18n.loadDict(this.get("locale"));
  },
  startMatchmakingWithBot: function(){
    this.set("inMatchmakerQueue", true);
    this.get("app").send("request:matchmaking:bot");
  },
  startMatchmaking: function(roomName){
    this.set("inMatchmakerQueue", true);
    this.get("app").send("request:matchmaking", {roomName: roomName});
  },
  joinRoom: function(){
    this.get("app").send("request:joinRoom");
    this.set("inMatchmakerQueue", false);
  },
  subscribeRoom: function(){
    let room = this.get("room");
    let app = this.get("app");
    //app.socket.subscribe(room);
  },
  setName: function(name){
    name = name.slice(0, 20);
    this.get("app").send("request:name", {name: name});
    localStorage["userName"] = name;
  },
  setDeck: function(deckKey){
    //console.log("deck: ", deckKey);
    this.set("deck", deckKey);
    localStorage["userDeck"] = deckKey;
    if (deckKey === "custom") {
      deckKey = localStorage["customDeck"];
      this.get("app").send("set:customDeck", localStorage[`customDeck${deckKey}`]);
      return;
    }
    this.get("app").send("set:deck", {deck: deckKey});
  },
  setLocale: function(e) {
    let locale = $(e.target).val();
    this.set("locale", locale);
    localStorage["locale"] = locale;
    i18n.loadDict(locale, () => {
      this.get("app").getCurrentView().render();
    });
  },
  chooseSide: function(roomSide){
    this.get("app").send("response:chooseWhichSideBegins", {
      side: roomSide
    })
  },
  getCardData: function(card){
    if(!card || !card.ability) return;
    var abilities;

    if(Array.isArray(card.ability)){
      abilities = card.ability.slice();
    }
    else {
      abilities = [];
      abilities.push(card.ability);
    }

    abilities = abilities.map((ability) =>{
      return i18n.getText(abilityData[ability].description);
    })

    return abilities;
  }
});

let Lobby = Backbone.View.extend({
  defaults: {
    id: ""
  },

  template: require("../templates/lobby.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;

    this.app.receive("update:playerOnline", this.renderStatus.bind(this));

    this.listenTo(this.app.user, "change:serverOffline", this.render);
    this.listenTo(this.app.user, "change:name", this.setName);
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .startMatchmaking": "startMatchmaking",
    "click .startMatchmakingWithBot": "startMatchmakingWithBot",
    /*"click .join-room": "joinRoom",*/
    "blur .name-input": "changeName",
    "blur .room-name-input": "changeRoomName",
    "change #deckChoice": "setDeck",
    "click .note": "debugNote"
  },
  debugNote: function(){
    new Notification({message: "yoyo TEST\nhallo\n\ntest"}).render();
  },
  render: function(){
    this.$el.html(this.template(this.user.attributes));
    this.$el.find("#deckChoice").val(this.user.get("deck")).attr("selected", true);
    $("#locale").val(this.user.get("locale")).attr("selected", true);
    return this;
  },
  startMatchmaking: function(){
    this.$el.find(".image-gif-loader").show();
    let roomName = this.$el.find(".room-name-input").val();
    this.app.trigger("startMatchmaking", roomName);
  },
  startMatchmakingWithBot: function(){
    this.app.trigger("startMatchmakingWithBot");
  },
  joinRoom: function(){
    this.app.trigger("joinRoom");
  },
  setDeck: function(e){
    let val = $(e.target).val();
    this.$el.find("#deckChoice option[value='" + val + "']").attr("selected", "selected")
    if (val === "custom") {
      this.app.collectionsRoute();
      return;
    }
    this.app.trigger("setDeck", val);
  },
  setName: function(){
    localStorage["userName"] = this.app.user.get("name");
    this.$el.find(".name-input").val(this.app.user.get("name"));
  },
  changeName: function(e){
    let name = $(e.target).val();
    this.app.trigger("setName", name);
  },
  renderStatus: function(data){
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  }
});

let Preview = Backbone.View.extend({
  template: require("../templates/preview.handlebars"),
  initialize: function(opt){
    this.card = cardData[opt.key];
    this.size = opt.size || "lg";
    this.previewB = opt.previewB || false;

    this.$el.addClass(this.previewB ? "preview-b" : "");

    if(!this.card || !this.card.ability) return;

    if(Array.isArray(this.card.ability)){
      this.abilities = this.card.ability.slice();
    }
    else {
      this.abilities = [];
      this.abilities.push(this.card.ability);
    }

    this.abilities = this.abilities.map((ability) =>{
      return i18n.getText(abilityData[ability].description);
    })
    // name is zh by default.
    if (i18n.hasText(opt.key)) {
      this.card.name = i18n.getText(opt.key);
    }

    "lol";
  },
  render: function(){
    let html = this.template({
      card: this.card,
      abilities: this.abilities,
      size: this.size,
      previewB: this.previewB
    })
    this.$el.html(html);
    return this;
  }
});

let Notification = Backbone.View.extend({
  className: "notification",
  template: require("../templates/notification.handlebars"),
  events: {
    "click .alert": "onClick"
  },
  initialize: function(opt){
    this.opt = opt;
    $(".notifications").append(this.el);
  },
  render: function(){
    this.$el.html(this.template(this.opt));
    this.show();
    return this;
  },
  show: function(){
    let $alert = this.$el.find(".alert");
    $alert.slideDown(600).delay(Config.Gwent.notification_duration).queue(this.hide.bind(this));

  },
  hide: function(){
    let $alert = this.$el.find(".alert");
    $alert.stop().slideUp().queue(this.remove.bind(this));
  },
  onClick: function(){
    this.hide();
  }
});

module.exports = App;

let Backbone = require("backbone");
let Modal = require("./modal");
let SideView = require("./side-view");

let cardData = require("../../../assets/data/cards");
let deckData = require("../../../assets/data/deck");
let abilityData = require("../../../assets/data/abilities");

let BattleView = Backbone.View.extend({
  template: require("../../templates/battle.handlebars"),
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

    if (user.get("scenario") && (
      user.get("questProgress")[user.get("scenario")] === 4
    )) {
      bgm.setMode("finale", true);
    } else {
      bgm.setMode("battle", true);
    }
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
    "click .field-leader>.card-wrap": "clickLeader"
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
    this.stopListening();
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
    if(this.user.get("setHorn") != null && this.user.get("setHorn") !== false){
      if(id === this.user.get("setHorn")){
        this.user.set("setHorn", false);
        this.app.send("cancel:horn");
        this.render();
      }
      return;
    }
    if(this.user.get("waitForDecoy") != null && this.user.get("waitForDecoy") !== false){
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
    // if (self.$el.find(".field-hand").find('.card').length === 1 &&
    //   !$card.data("ability").includes("medic") &&
    //   !$card.data("ability").includes("commanders_horn_card") &&
    //   !$card.data("ability").includes("attack") &&
    //   !$card.data("ability").includes("monaka") &&
    //   !$card.data("ability").includes("taibu") &&
    //   !$card.data("ability").includes("guard") &&
    //   !$card.data("ability").includes("decoy")) {
    //   setTimeout(function() {
    //     self.onPassing();
    //   }, 0);
    // }
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
      $('.sunray-animation').addClass("sunray-animation-visible");
      setTimeout(() => {
        $('.sunray-animation').removeClass("sunray-animation-visible");
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
    if(this.user.get("waitForDecoy") != null && this.user.get("waitForDecoy") !== false){
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
    if(this.user.get("setHorn") != null && this.user.get("setHorn") !== false){
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
    let isSetHorn = self.user.get("setHorn") != null && self.user.get("setHorn") !== false;
    this.$el.html(this.template({
      cards: self.handCards,
      active: {
        close: self.user.get("setAgile") || isSetHorn,
        range: self.user.get("setAgile") || isSetHorn,
        siege: isSetHorn
      },
      isWaiting: self.user.get("waiting"),
      playerRemained: self.yourSide ? self.yourSide.infoData.deck : 0,
      foeRemained: self.otherSide ? self.otherSide.infoData.deck : 0,
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
    if(this.user.get("setHorn") != null && this.user.get("setHorn") !== false){
      let id = this.user.get("setHorn");
      this.$el.find("[data-id='" + id + "']").addClass("activeCard");
    }
    if(this.user.get("waitForDecoy") != null && this.user.get("waitForDecoy") !== false){
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
    this.user.get("app").trigger("timer:cancel");
  },
  setUpBattleEvents: function(){
    let self = this;
    let user = this.user;
    let app = user.get("app");

    app.on("update:hand", function(data){
      if(user.get("roomSide") == data._roomSide){
        self.handCards = data.cards;
        self.handCards.sort((a, b) => {
          let powerA = a._data.power + (String(a._data.ability).includes("hero") ? 100 : 0);
          let powerB = b._data.power + (String(b._data.ability).includes("hero") ? 100 : 0);
          if (powerA > powerB) return 1;
          else if (powerA < powerB) return -1;
          if (a._data.type > b._data.type) return 1;
          else if (a._data.type < b._data.type) return -1;
          return 0;
        });
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

    app.on("reDrawFinished", function() {
      if (localStorage.getItem("skipBattleGuide") || !self.user.get("withBot")) {
        return;
      }
      localStorage.setItem("skipBattleGuide", true);
      self.waitForAnimation = true;
      setTimeout(() => {
        introJs()
          .setOption('showStepNumbers', false)
          .setOption('disableInteraction', true)
          .setOption('highlightClass', 'intro-highlight')
          .onexit(() => {
            self.waitForAnimation = false;
            self.render();
          })
          .start();
      }, 500);
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

let MedicModal = Modal.extend({
  template: require("../../templates/modal.medic.handlebars"),
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
  template: require("../../templates/modal.emreis_leader4.handlebars"),
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
  template: require("../../templates/modal.redraw.handlebars"),
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
    this.model.get("app").trigger("reDrawFinished");
    this.model.set("isReDrawing", false);
  }
});

let ChooseSideModal = Modal.extend({
  template: require("../../templates/modal.side.handlebars"),
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

let Preview = Backbone.View.extend({
  template: require("../../templates/preview.handlebars"),
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

    let relatedCards = [];
    this.abilities = this.abilities.map((ability) =>{
      if (abilityData[ability].getRelatedCards) {
        relatedCards = relatedCards.concat(
          abilityData[ability].getRelatedCards(opt.key, cardData, deckData[this.card.faction]));
      }
      return i18n.getText(abilityData[ability].description);
    })
    this.relatedCards = relatedCards.map(c => {
      return {
        owned: true,
        name: cardData[c].name,
      }
    });
    // name is zh by default.
    if (i18n.hasText(opt.key)) {
      this.card.name = i18n.getText(opt.key);
    }
    this.attackPower = this.card.attackPower || 0;
    this.grade = this.card.grade || 0;
  },
  render: function(){
    let html = this.template({
      card: this.card,
      abilities: this.abilities,
      relatedCards: this.relatedCards,
      hasRelatedCards: this.relatedCards && this.relatedCards.length,
      attackPower: this.attackPower,
      hasAttackPower: this.attackPower > 0,
      grade: this.grade,
      hasGrade: this.grade > 0,
      size: this.size,
      previewB: this.previewB
    })
    this.$el.html(html);
    return this;
  }
});

module.exports = BattleView;

let socket = require("socket.io-client");
let Backbone = require("backbone");
require("./backbone.modal-min");
let Handlebars = require('handlebars/runtime').default;
let $ = require("jquery");

let Lobby = require("./view/lobby");
let CollectionsView = require("./view/collections");
let LoginView = require("./view/login");
let BattleView = require("./view/battle-view");
let Modal = require("./view/modal");
let LuckyDraw = require("./view/lucky-draw");
let Notification = require("./view/notification");
let I18n = require("./i18n");
const ContestResultModal = require("./view/contest-result");
const Config = require("../../public/Config");

window.$ = $;
window.i18n = new I18n("zh");

$.get("/hosts", function(data) {
  Config.SERVERS = data;
});

$.get("/version", function(version) {
  if (Config.MAJOR_VERSION < Number(version)) {
    $(".container").prepend('<div class="notification-left">检测到新版本，请下载！Please download latest version!</div>')
  }
});

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
    if (this.getCurrentView()) {
      this.getCurrentView().stopListening();
    }
    this.off();
    this.connect();
    if (this.user) {
      this.user.stopListening();
    }
    this.user = new User({app: this});

    /*Backbone.history.start();*/
    if (localStorage["token"]) {
      this.lobbyRoute();
    } else {
      this.loginRoute();
    }
  },
  connect: function(){
    if (this.socket) {
      // call off before close, otherwise will trigger reconnect callback
      this.socket.off();
      this.socket.close();
    }
    let region = localStorage["region"] || "aliyun";
    if (this.user) region = this.user.get("region");
    let hostname = Config.SERVERS[region];
    if (hostname === "localhost") hostname = location.hostname;
    this.socket = socket("http://" + hostname + ":" + Config.WS_SERVER_PORT);
    var self = this;
    console.log(this.socket.connected);
    this.socket.on("connect", function(socket){
      self.send("user:init", {
        token: localStorage["token"],
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
  loginRoute: function(){
    if(this.currentView){
      this.currentView.remove();
      if (!$(".gwent-battle").length) {
        $(".notifications").after('<div class="gwent-battle"></div>');
      }
      $(".notification-left").remove();
    }
    this.currentView = new LoginView({
      app: this,
      user: this.user
    });
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

let WinnerModal = Modal.extend({
  template: require("../templates/modal.winner.handlebars"),
  events: {
    "click .startMatchmaking": "onBtnClick"
  },
  onBtnClick: function(e) {
    this.remove();
    let gameResult = this.model.get("gameResult");
    if (gameResult.questState && gameResult.questState.completed) {
      let contestReport = new ContestResultModal({
        app: this.model.get("app"),
        user: this.model.get("user"),
        gameResult: gameResult,
      });
      $(".container").prepend(contestReport.render().el);
    } else if (gameResult.newCard && gameResult.newCard.length || gameResult.coins) {
      let luckyDraw = new LuckyDraw({
        app: this.model.get("app"),
        gameResult,
      });
      $(".container").prepend(luckyDraw.render().el);
    } else {
      this.model.get("app").initialize();
    }
  },
  beforeCancel: function() {
    return false;
  }
});

let InitialCardsModal = Modal.extend({
  template: require("../templates/modal.initialCards.handlebars"),
});

let User = Backbone.Model.extend({
  defaults: {
    userModel: null,
    name: typeof localStorage["bandName"] === "string" ? localStorage["bandName"].slice(0, 20) : null,
    deck: "random",
    scenario: null,
    locale: "zh",
    region: "aliyun",
    serverStatus: {},
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
      if (data.needLogin) {
        app.loginRoute();
      } else {
        self.setUserModel(data.model);
      }
    });

    app.receive("update:playerOnline", function(data) {
      self.set("serverStatus", data);
    });

    app.receive("response:name", function(data){
      self.set("name", data.name);
      localStorage["bandName"] = this.app.user.get("name");
    });

    app.receive("init:battle", function(data){
      //console.log("opponent found!");
      self.set("roomSide", data.side);
      self.set("roomFoeSide", data.foeSide);
      self.set("withBot", data.withBot);
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
      self.set("withBot", data.withBot);
      self.set("room", data.roomId);
      app.battleRoute();
    })

    app.receive("set:waiting", function(data){
      let waiting = data.waiting;
      if (!waiting && !self.get("withBot")) {
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
        user: self,
        winner: winner || i18n.getText("no_one"),
        gameResult: data.gameResult,
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
      $(".container").prepend(modal.render().el);
    })
    app.receive("request:chooseWhichSideBegins", function(){
      self.set("chooseSide", true);
    })
    app.receive("response:questProgress", function(data) {
      self.set("questProgress", data);
    });

    app.on("startMatchmakingWithBot", this.startMatchmakingWithBot, this);
    app.on("startMatchmaking", this.startMatchmaking, this);
    app.on("changeBandName", this.changeBandName, this);
    app.on("setDeck", this.setDeck, this);
    app.on("showInitialCards", this.showInitialCards, this);
    $("#locale").change(this.setLocale.bind(this));

    app.receive("notification", function(data){
      new Notification(data).render();
    })

    this.setDeck(localStorage["userDeck"] || "random");
    this.set("locale", localStorage["locale"] || "zh");
    this.set("region", localStorage["region"] || "aliyun");
    i18n.loadDict(this.get("locale"), () => {
      this.get("app").getCurrentView().render();
    });
  },
  startMatchmakingWithBot: function(data){
    data = data || {};
    this.set("scenario", data.scenario);
    this.get("app").send("request:matchmaking:bot", {
      scenario: data.scenario,
    });
  },
  startMatchmaking: function(data){
    data = data || {};
    this.set("scenario", data.scenario);
    this.get("app").send("request:matchmaking", {
      roomName: data.roomName,
      scenario: data.scenario,
    });
  },
  subscribeRoom: function(){
    let room = this.get("room");
    let app = this.get("app");
    //app.socket.subscribe(room);
  },
  setUserModel: function(model) {
    this.set("userModel", model);
    this.set("name", model.bandName);
    localStorage["bandName"] = name;
  },
  changeBandName: function(name){
    name = name.slice(0, 20);
    this.get("app").send("request:name", {name: name});
    localStorage["bandName"] = name;
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
  setRegion: function(region) {
    this.set("region", region);
    localStorage["region"] = region;
    localStorage.removeItem("token");
    localStorage.removeItem("connectionId");
    this.get("app").initialize();
  },
  chooseSide: function(roomSide){
    this.get("app").send("response:chooseWhichSideBegins", {
      side: roomSide
    })
  },
  showInitialCards: function(cards) {
    this.set("initialCards", cards);
    let modal = new InitialCardsModal({model: this});
    this.get("app").getCurrentView().$el.prepend(modal.render().el);
  },
  logout: function() {
    localStorage.removeItem("token");
    localStorage.removeItem("connectionId");
    location.reload();
  },
});

module.exports = App;

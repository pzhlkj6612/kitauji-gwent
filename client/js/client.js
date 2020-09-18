let socket = require("socket.io-client");
let Backbone = require("backbone");
require("./backbone.modal-min");
let Handlebars = require('handlebars/runtime').default;
let $ = require("jquery");

let Lobby = require("./view/lobby");
let CollectionsView = require("./view/collections");
let RoomView = require("./view/room");
let CompetitionView = require("./view/competition");
let TreeView = require("./view/tree");
let LuckyDrawLobbyView = require("./view/lucky-draw-lobby");
let LoginView = require("./view/login");
let BattleView = require("./view/battle-view");
let Modal = require("./view/modal");
let Notification = require("./view/notification");
let I18n = require("./i18n");
const Config = require("../../public/Config");
const util = require("./util");

window.$ = $;
window.i18n = new I18n("zh");

$.get("/hosts", function(data) {
  Config.SERVERS = data;
});

$.get(Config.DOMAIN + "/version", function(version) {
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
    "lobby": "lobbyRoute",
    "login": "loginRoute",
    "battle": "battleRoute",
    "collections": "collectionsRoute",
    "room": "roomRoute",
    "competition": "competitionRoute",
    "tree/:compId": "treeRoute",
    "luckyDraw": "luckyDrawRoute",
    "*path": "defaultRoute"
  },
  initialize: function(){
    this.reinitialize();
  },
  reinitialize: function() {
    if (this.getCurrentView()) {
      this.getCurrentView().stopListening();
    }
    this.off();
    this.connect();
    if (this.user) {
      this.user.stopListening();
    }
    this.user = new User({app: this});
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
  goBack: function() {
    window.history.back();
  },
  loginRoute: function(){
    this.removeCurrentView_();
    this.currentView = new LoginView({
      app: this,
      user: this.user
    });
  },
  lobbyRoute: function(){
    this.removeCurrentView_();
    this.currentView = new Lobby({
      app: this,
      user: this.user
    });
  },
  battleRoute: function(gameRecords){
    this.removeCurrentView_();
    this.currentView = new BattleView({
      app: this,
      user: this.user,
      isReplay: !!gameRecords,
      gameRecords: gameRecords,
    });
  },
  collectionsRoute: function() {
    this.removeCurrentView_();
    this.currentView = new CollectionsView({
      app: this,
      user: this.user
    });
  },
  roomRoute: function() {
    this.removeCurrentView_();
    this.currentView = new RoomView({
      app: this,
      user: this.user
    });
  },
  competitionRoute: function() {
    this.removeCurrentView_();
    this.currentView = new CompetitionView(this);
  },
  treeRoute: function(compId) {
    this.removeCurrentView_();
    this.currentView = new TreeView({
      app: this,
      compId,
    });
  },
  removeCurrentView_: function() {
    if(this.currentView){
      this.currentView.remove();
      if (!$(".gwent-battle").length) {
        $(".notifications").after('<div class="gwent-battle"></div>');
      }
    }
  },
  luckyDrawRoute: function() {
    this.removeCurrentView_();
    this.currentView = new LuckyDrawLobbyView({
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

let InitialCardsModal = Modal.extend({
  template: require("../templates/modal.initialCards.handlebars"),
  cancel: function() {
    setTimeout(() => {
      util.showIntro();
    }, 500);
  }
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
        app.navigate("login", {trigger: true, replace: true});
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
      self.initBattle(data);
    })

    app.receive("room:rejoin", function(data) {
      self.initBattle(data);
    })

    app.receive("set:waiting", function(data){
      app.trigger("set:waiting", data);
    })

    app.receive("set:passing", function(data){
      app.trigger("set:passing", data);
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
      app.trigger("reDrawFinished");
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
    });

    app.receive("gameover", function(data){
      app.trigger("gameover", data);
      localStorage.removeItem("connectionId");
      app.trigger("timer:cancel"); // cancel existing timer
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
      app.trigger("notification", data);
      new Notification(data).render();
    })

    this.setDeck(localStorage["userDeck"] || "random");
    this.set("locale", localStorage["locale"] || "zh");
    this.set("region", localStorage["region"] || "aliyun");
    i18n.loadDict(this.get("locale"));
  },
  startMatchmakingWithBot: function(data){
    data = data || {};
    this.set("scenario", data.scenario);
    this.get("app").send("request:matchmaking", {
      scenario: data.scenario,
      bot: true,
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
    i18n.loadDict(locale, function() {
      this.get("app").getCurrentView().render();
    }.bind(this));
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
  initBattle: function(data) {
    this.set("roomSide", data.side);
    this.set("roomFoeSide", data.foeSide);
    this.set("withBot", data.withBot);
    this.set("room", data.roomId);
    // route manually, since battle view may be routed multiple times
    this.get("app").navigate("battle", {trigger: false});
    this.get("app").battleRoute(data.gameRecords);
  },
  logout: function() {
    localStorage.removeItem("token");
    localStorage.removeItem("connectionId");
    location.reload();
  },
});

module.exports = App;

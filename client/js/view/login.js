let Backbone = require("backbone");
let CardData = require("../../../assets/data/cards");

let Login = Backbone.View.extend({
  template: require("../../templates/login.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this.app.receive("update:playerOnline", this.renderStatus.bind(this));
    this.app.receive("response:login", this.onLoginResponse.bind(this));
    this.app.receive("response:signin", this.onSignInResponse.bind(this));
    this.listenTo(this.user, "change:serverOffline", this.render.bind(this));
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .btn-login": "onLoginClick",
    "click .btn-signin": "onSignInClick",
  },
  render() {
    this.$el.html(this.template(this.user.attributes));
    return this;
  },
  renderStatus: function(data){
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  },
  onLoginClick: function() {
    let username = this.$el.find("#username").val();
    let password = this.$el.find("#password").val();
    if (!username || !password) return;
    this.app.send("request:login", {
      username: username,
      password: password,
    });
  },
  onSignInClick: function() {
    let modal = new SignInModal({model: this.user});
    this.$el.prepend(modal.render().el);
    this.signInModal = modal;
  },
  onLoginResponse: function(data) {
    if (data.success) {
      localStorage.setItem("token", data.token);
      this.user.setUserModel(data.model);
      this.app.lobbyRoute();
    }
  },
  onSignInResponse: function(data) {
    if (data.success) {
      localStorage.setItem("token", data.token);
      this.user.setUserModel(data.model);
      this.app.lobbyRoute();
      this.showInitialCards(data.initialCards);
    }
    this.signInModal &&
      this.signInModal.$el.find("#btnSignIn").removeClass("disabled");
  },
  showInitialCards(cards) {
    let data = {};
    for (let key of cards) {
      data[key] = {
        _data: CardData[key],
      };
    }
    this.app.trigger("showInitialCards", data);
  },
});

let SignInModal = Backbone.Modal.extend({
  template: require("../../templates/modal.signin.handlebars"),
  events: {
    "click #btnSignIn": "onBtnClick"
  },
  onBtnClick: function() {
    if(this.$el.find("#btnSignIn").hasClass("disabled")) return;
    let username = this.$el.find("#username").val();
    let password = this.$el.find("#password").val();
    let bandName = this.$el.find("#bandName").val();
    let initalDeck = this.$el.find("#initialDeck").val();
    if (!username || !password) {
      return;
    }
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
      return;
    }
    this.model.get("app").send("request:signin", {
      username: username,
      password: password,
      bandName: bandName,
      initalDeck: initalDeck,
    });
    this.$el.find("#btnSignIn").addClass("disabled");
  }
});

module.exports = Login;

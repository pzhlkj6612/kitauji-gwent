let Backbone = require("backbone");
let Notification = require("./notification");
let CardData = require("../../../assets/data/cards");

let Login = Backbone.View.extend({
  template: require("../../templates/login.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    this.app.receive("response:login", this.onLoginResponse.bind(this));
    this.app.receive("response:signin", this.onSignInResponse.bind(this));
    this.listenTo(this.user, "change:serverOffline", this.render.bind(this));
    this.listenTo(this.user, "change:serverStatus", this.renderStatus.bind(this));
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .btn-login": "onLoginClick",
    "click .btn-signin": "onSignInClick",
    "change #region": "setRegion",
  },
  render() {
    this.$el.html(this.template(this.user.attributes));
    this.$el.find("#region").val(this.user.get("region")).attr("selected", true);
    this.renderStatus();
    return this;
  },
  renderStatus: function(){
    let data = this.user.get("serverStatus");
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
      this.app.navigate("lobby", {trigger: true, replace: true});
    }
  },
  onSignInResponse: function(data) {
    if (data.success) {
      localStorage.setItem("token", data.token);
      this.user.setUserModel(data.model);
      this.app.navigate("lobby", {trigger: true, replace: true});
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
  setRegion(e) {
    let val = $(e.target).val();
    this.$el.find("#region option[value='" + val + "']").attr("selected", "selected");
    this.user.setRegion(val);
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
    let initialDeck = this.$el.find("#initialDeck").val();
    if (!username || !password) {
      return;
    }
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
      new Notification({
        msgKey: "username_validation",
      }).render();
      return;
    }
    this.model.get("app").send("request:signin", {
      username: username,
      password: password,
      bandName: bandName,
      initialDeck: initialDeck,
    });
    this.$el.find("#btnSignIn").addClass("disabled");
  }
});

module.exports = Login;

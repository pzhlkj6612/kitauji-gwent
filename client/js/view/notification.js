let Backbone = require("backbone");
const Config = require("../../../public/Config");

let Notification = Backbone.View.extend({
  className: "notification",
  template: require("../../templates/notification.handlebars"),
  events: {
    "click .alert": "onClick"
  },
  initialize: function(opt){
    this.msgKey = opt.msgKey;
    this.values = opt.values;
    $(".notifications").append(this.el);
  },
  render: function(){
    this.$el.html(this.template({message: i18n.getText(this.msgKey, this.values)}));
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

module.exports = Notification;

let Backbone = require("backbone");

let Const = require("../const");
let Util = require("../util");

let Room = Backbone.View.extend({
  template: require("../../templates/room/room.handlebars"),
  initialize: function(options){
    this.user = options.user;
    this.app = options.app;
    // this.app.receive("response:userCollections", this.onUserCollectionsResponse.bind(this));
    // this.app.send("request:userCollections");
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {

  },
  render: function() {
    this.$el.html(this.template({

    }));
    return this;
  },
});

module.exports = Room;

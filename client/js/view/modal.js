let Backbone = require("backbone");

let Modal = Backbone.Modal.extend({
  template: require("../templates/modal.handlebars"),
  cancelEl: ".bbm-close",
  cancel: function(){
    this.model.set("openDiscard", false);
  }
});

module.exports = Modal;

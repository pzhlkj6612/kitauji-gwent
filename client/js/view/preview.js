let Backbone = require("backbone");

let cardData = require("../../../assets/data/cards");
let deckData = require("../../../assets/data/deck");
let abilityData = require("../../../assets/data/abilities");

let Preview = Backbone.View.extend({
  template: require("../../templates/preview.handlebars"),
  initialize: function(opt){
    this.card = cardData[opt.key];
    this.size = opt.size || "lg";
    this.previewB = opt.previewB || false;
    this.hideDesc = opt.hideDesc || false;

    this.$el.addClass(this.previewB ? "preview-b" : "");

    if(!this.card || !this.card.ability || this.hideDesc) return;

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
      hideDesc: this.hideDesc,
      previewB: this.previewB
    })
    this.$el.html(html);
    return this;
  }
});

module.exports = Preview;

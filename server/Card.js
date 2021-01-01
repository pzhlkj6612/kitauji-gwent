var CardData = require("../assets/data/cards");
var AbilityData = require("../assets/data/abilities");

var Card = (function(){
  var Card = function(key, owner, id){
    if(!(this instanceof Card)){
      return (new Card(key, owner, id));
    }
    /**
     * constructor here
     */
    this._owner = owner;
    this._id = id;
    this.boost = 0;
    this._uidEvents = {};
    this.setDisabled(false);
    this._data = CardData[key] ? CardData[key] : CardData["none"];
    if(!(this._data = CardData[key])){
      console.warn("Card not found: " + key);
      this._data = CardData["none"];
      key = "none";
    }
    this._key = key;
    this._data.key = key;
    this._boost = {};
    this._forcedPower = -1;
    this._forcePowerBy = {};
    //this._init();
  };
  var r = Card.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r._key = null;
  r._data = null;
  r._id = null;
  r._owner = null;
  r._boost = null;
  r._forcedPower = null;
  r._forcePowerBy = null;
  r._disabled = null;
  r._changedType = null;
  //Card.__id = 0;
  Card.TYPE = {
    CLOSE_COMBAT: 0,
    RANGED: 1,
    SIEGE: 2,
    LEADER: 3,
    SPECIAL: 4,
    WEATHER: 5
  };

  r._uidEvents = null;
  r.boost = null;
  r.power = null;
  r.diff = null;
  r.diffPos = null;

  r.getUidEvents = function(key){
    return this._uidEvents[key];
  }

  r._init = function(){
    //this._id = ++Card.__id;
  }

  r.getName = function(){
    return this._data.name;
  }

  r.getBasePower = function(){
    var base = this._data.power;
    if(this._forcedPower > -1){
      base = Math.min(this._forcedPower, this._data.power);
    }
    for (let key in this._forcePowerBy) {
      let forcePower = this._forcePowerBy[key];
      if (forcePower > -1) {
        base = Math.min(forcePower, this._data.power);
      }
    }
    return base;
  }

  r.getPower = function(negPower){
    this.power = null;
    this.diff = null;
    this.diffPos = null;
    if(this._data.power === -1) return 0;
    this.power = (this.getBasePower() + this.getBoost());
    if (!negPower && this.power < 0) {
      this.power = 0;
    }
    this.diff = this.power - this.getRawPower();
    if(this.diff > 0) this.diffPos = true;
    else this.diffPos = false;
    if (this.diff < 0) this.diffNeg = true;
    else this.diffNeg = false;
    return this.power;
  }
  r.getRawPower = function(){
    return this._data.power;
  }
  r.setForcedPower = function(nr){
    this._forcedPower = nr;
    this.getBoost(); //recalculate
  }
  r.setForcePowerBy = function(nr, key) {
    this._forcePowerBy[key] = nr;
    this.getBoost(); //recalculate
  }
  r.getRawAbility = function(){
    return this._data.ability;
  }
  r.getAbility = function(){
    if(Array.isArray(this._data.ability)){
      var res = [];
      this._data.ability.forEach(function(ability){
        res.push(AbilityData[ability]);
      })
      return res;
    }
    return AbilityData[this._data.ability];
  }
  r.hasAbility = function(ability){
    var a = this.getRawAbility();
    if(Array.isArray(a)){
      for(var i = 0; i < a.length; i++) {
        var _a = a[i];
        if(_a === ability) return true;
      }
    }
    return a === ability;
  }
  r.getImage = function(){
    return "../assets/cards/" + this._data.img + ".png";
  }
  r.getFaction = function(){
    return this._data.faction;
  }
  r.getBondType = function(){
    return this._data.bondType || null;
  }
  r.getMusterType = function(){
    return this._data.musterType || null;
  }
  r.isMale = function() {
    return this._data.male || false;
  }
  r.getAttackPower = function() {
    return this._data.attackPower || 0;
  }
  r.getGrade = function() {
    return this._data.grade || 0;
  }
  r.getType = function(){
    return this._changedType == null ? this._data.type : this._changedType;
  }
  r.changeType = function(type){
    this._changedType = type;
  }
  r.getKey = function(){
    return this._key;
  }

  r.getID = function(){
    return this._id;
  }

  r.resetTightBond = function() {
    for(var key in this._boost) {
      if(this._boost[key] !== "tight_bond") continue;
      delete this._boost[key];
    }
  }

  r.getBoostByKey = function(key) {
    return this._boost[key] || 0;
  }

  r.resetNegBoost = function() {
    for (var key in this._boost) {
      if (this._boost[key] < 0) {
        this._boost[key] = 0;
      }
    }
    this._forcePowerBy = {};
    this.getBoost();
  }

  r.getBoost = function(){
    var res = 0;
    var doubles = 0;
    for(var key in this._boost) {
      if(key === "commanders_horn" || key === "commanders_horn_card") continue
      if(this._boost[key] === "tight_bond"){
        doubles++;
        continue;
      }
      res += this._boost[key];
    }

    let basePower = this.getBasePower();

    res = (res + basePower) * (1 + doubles);

    if(this._boost["commanders_horn"] || this._boost["commanders_horn_card"]){
      res *= 2;
    }
    res -= basePower;

    this.boost = res;
    return res;
  }

  r.setBoost = function(key, val){
    this._boost[key] = val;
    this.getBoost(); //to recalculate this.boost
  }

  r.isDisabled = function(){
    return this._disabled;
  }

  r.setDisabled = function(b){
    this._disabled = b;
  }

  r.getProperty = function(prop){
    if(!this._data[prop]) return {};
    return this._data[prop];
  }

  r.reset = function(){
    this._changedType = null;
    this._forcedPower = -1;
    this._forcePowerBy = {};
    this._boost = {};
    this.boost = 0;
  }

  return Card;
})();

module.exports = Card;
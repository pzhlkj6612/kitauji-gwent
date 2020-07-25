var CardData = require("../assets/data/cards");

let Util = {};

Util.canReplace = function(card) {
  return !(this.isHero(card) ||
    this.isWeather(card) ||
    this.isDecoy(card) ||
    card._data.ability === "scorch_card" ||
    card._data.ability === "commanders_horn_card");
}
Util.isSpy = function(card, includeHero) {
  return card._data.ability === "spy" ||
    (includeHero && String(card._data.ability).includes("spy"));
}
Util.isHero = function(card) {
  return String(card._data.ability).includes("hero");
}
Util.isScorch = function(card, isScorchCard) {
  if (isScorchCard) return card._data.ability === "scorch_card";
  return card._data.ability !== "scorch_card" && String(card._data.ability).includes("scorch");
}
Util.isScorchLeader = function(card) {
  return card._data.ability === "scorch_leader";
}
Util.isMedic = function(card, includeHero) {
  return card._data.ability === "medic" ||
    (includeHero && String(card._data.ability).includes("medic"));
}
Util.isMuster = function(card, opt_musterType) {
  return String(card._data.ability).includes("muster") &&
    (opt_musterType ? card._data.musterType === opt_musterType : true);
}
Util.isMoraleBoost = function(card, includeHero) {
  return card._data.ability === "morale_boost" ||
    (includeHero && String(card._data.ability).includes("morale_boost"));
}
Util.isHornLeader = function(card) {
  return card._data.ability === "ranged_horn_leader";
}
Util.isHorn = function(card, isHornCard) {
  if (isHornCard) {
    return card._data.ability === "commanders_horn_card";
  }
  return card._data.ability !== "commanders_horn_card" &&
    String(card._data.ability).includes("commanders_horn");
}
Util.isBond = function(card, opt_bondType) {
  return card._data.ability === "tight_bond" &&
    (opt_bondType ? card._data.bondType === opt_bondType : true);
}
Util.isMonaka = function(card) {
  return card._data.ability === "monaka";
}
Util.isAttack = function(card) {
  return String(card._data.ability).includes("attack");
}
Util.isTaibu = function(card) {
  return card._data.ability === "taibu";
}
Util.isGuard = function(card) {
  return card._data.ability === "guard";
}
Util.isLips = function(card) {
  return card._data.ability === "lips";
}
Util.isTunning = function(card) {
  return card._data.ability === "tunning";
}
Util.isKasa = function(card) {
  return card._data.ability === "kasa";
}
Util.isWeather = function(card) {
  return card._data.type === 5 ||
    card._data.ability === "clear_weather_leader" ||
    card._data.ability === "fog_leader" ||
    card._data.ability === "frost_leader";
}
Util.isClearWeather = function(card) {
  return Util.isWeather(card) &&
    (card._data.ability === "weather_clear" || card._data.ability === "clear_weather_leader");
}
Util.isDecoy = function(card) {
  return card._data.ability === "decoy";
}
Util.isEmreisLeader4 = function(card) {
  return card._data.ability === "emreis_leader4";
}
Util.isSkin = function(cardKey) {
  return CardData[cardKey].skinOf != null;
}
Util.getLimit = function(cardKey) {
  let card = {
    _data: CardData[cardKey],
  };
  if (Util.isHero(card) || Util.isSpy(card) || Util.isMedic(card)) {
    return 1;
  }
  if (Util.isBond(card)) {
    return 2;
  }
  if (Util.isMuster(card)) {
    return 3;
  }
  return 999;
}

module.exports = Util;

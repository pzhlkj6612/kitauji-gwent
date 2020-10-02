let CardData = require("../../assets/data/cards");
let funDecks = require("../../assets/data/fun-deck");

function toFactionText(faction) {
  switch (faction) {
    case "kumiko1":
      return "deck_ku1";
    case "kumiko1S2":
      return "deck_ku1S2";
    case "funDeck":
      return "funMode";
    case "kumiko2":
    default:
      return "deck_ku2";
  }
}

function toRarityText(rarity) {
  switch (rarity) {
    case 0:
      return "N";
    case 1:
      return "R";
    case 2:
      return "SR";
    case 3:
    default:
      return "SSR";
  }
}

function showIntro() {
  introJs()
    .setOption('showStepNumbers', false)
    .setOption('disableInteraction', true)
    .setOption('exitOnOverlayClick', false)
    .setOption('highlightClass', 'intro-highlight')
    .start();
}

function compress(card) {
  if (card) delete card._data;
  return card;
}

function uncompress(card) {
  if (card && card._key && !card._data) {
    card._data = CardData[card._key];
  }
  return card;
}

function validateGameRecords(data) {
  if (!data.version ||
    !data.gameRecords)  {
    return false;
  }
  return true;
}

function getFunDeckList() {
  let list = [];
  for (let key of Object.keys(funDecks)) {
    list.push({
      key,
      name: funDecks[key].name,
    });
  }
  return list;
}

function toTimeStr(date) {
  let h = date.getHours();
  let m = date.getMinutes();
  return `${date.toLocaleDateString()} ${h>9?h:'0'+h}:${m>9?m:'0'+m}`;
}

function toModeStr(mode, deck) {
  let modeStr = i18n.getText(mode);
  if (deck && funDecks[deck]) {
    modeStr += `(${funDecks[deck].name})`;
  }
  return modeStr;
}

const PRICE_LABEL = {
  0: "price_representative",
  1: "price_gold",
  2: "price_silver",
  3: "price_bronze",
};

const PRICE_CLASSNAME = {
  0: "price-gold",
  1: "price-gold",
  2: "price-silver",
  3: "price-bronze",
}

function toPriceLabel(price) {
  return PRICE_LABEL[price];
}

function toPriceClassName(price) {
  return PRICE_CLASSNAME[price];
}

module.exports = {
  toFactionText,
  toRarityText,
  showIntro,
  compress,
  uncompress,
  validateGameRecords,
  getFunDeckList,
  toTimeStr,
  toModeStr,
  toPriceLabel,
  toPriceClassName,
};

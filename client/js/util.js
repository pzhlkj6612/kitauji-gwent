let CardData = require("../../assets/data/cards");
let funDecks = require("../../assets/data/fun-deck");

function toFactionText(faction) {
  switch (faction) {
    case "kumiko1":
      return "deck_ku1";
    case "kumiko1S2":
      return "deck_ku1S2";
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
};

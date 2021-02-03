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

function getMainAbility(abilities) {
  if (!abilities || abilities.length === 0) return null;
  if(!Array.isArray(abilities)){
    abilities = [abilities];
  }
  for (let ability of abilities) {
    if (ability !== 'hero') return ability;
  }
  return null;
}

let EXIST = [
  "hashimoto",
  "hisaishi_kanade",
  "hitomi_lala",
  "inoue_junna",
  "inoue_shirabe",
  "iwata_keina",
  "kabe_tomoe",
  "kabutodani_eru",
  "kahashi_hiro",
  "kasaki_nozomi",
  "kase_maina",
  "kawashima_sapphire",
  "kenzaki_ririka",
  "kohinata_yume",
  "kousaka_reina",
  "maki_chikai",
  "nakagawa_natsuki",
  "nakano_tsubomi",
  "nakaseko_kaori",
  "niiyama",
  "noguchi_hideri",
  "oda_meiko",
  "ogasawara_haruka",
  "oka_mikino",
  "okamoto_raimu",
  "ono_miyoko",
  "oumae_kumiko",
  "saitou_aoi",
  "sakai_masako",
  "sawada_juri",
  "shima_rie",
  "taibu",
  "takahashi_sari",
  "takahisa_chieri",
  "taki_noboru",
  "takigawa_chikao",
  "tanabe_narai",
  "tanaka_asuka",
  "taura_mei",
  "tsukamoto_shuichi",
  "tubakun",
  "yoroizuka_mizore",
];
let PATTERN_KEY = /([_a-z]*)_(\d|shiki)/;
function getThemeImgName(card) {
  if (card && card._data) {
    let key = card._data.img;
    let matches = key.match(PATTERN_KEY);
    if (matches && matches[1]) {
      key = matches[1];
    }
    if (EXIST.includes(key)) {
      return key;
    }
  }
  return "oumae_kumiko";
}

function isDramaMode() {
  return false;
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
  getMainAbility,
  getThemeImgName,
  isDramaMode,
};

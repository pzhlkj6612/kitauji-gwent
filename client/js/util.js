
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

module.exports = {
  toFactionText,
  toRarityText,
  showIntro,
};

var Const = require("./Const");
var Cache = require("./dao/cache");

function getNextScenario(scenario) {
  switch (scenario) {
    case Const.SCENARIO_KANSAI:
    case Const.SCENARIO_ZENKOKU:
      return Const.SCENARIO_ZENKOKU;
    case Const.SCENARIO_KYOTO:
      return Const.SCENARIO_KANSAI;
    default:
      return Const.SCENARIO_KANSAI;
  }
}

async function updateQuestProgress(username, scenario, gameResult) {
  let result = {};

  let progress = await db.findProgressByUserQuest(username, scenario) || [];
  progress.push(gameResult);
  result.progress = progress;

  let gamesPerQuest = 5;
  if (progress.length < gamesPerQuest) {
    result.completed = false;
  } else {
    result.completed = true;
    // success condition: win all games in a quest
    let wins = progress.filter(g=>g.isWin).length;
    result.success = (wins === gamesPerQuest);
    // reset current task progress
    progress = [];
  }
  await db.updateProgress(this.userModel.username, this._scenario, progress);
  return result;
}

async function onQuestCompleted(username, scenario, success) {
  if (!success) {
    return;
  }
  // unlock next scenario
  await db.updateProgress(username, getNextScenario(scenario), []);
  // win zenkoku gold, unlock other decks
  if (scenario === Const.SCENARIO_ZENKOKU) {
    Cache.getInstance().setCondition(username, Const.COND_UNLOCK_ALL_DECK, true);
  }
}

module.exports = {
  updateQuestProgress,
  getNextScenario,
  onQuestCompleted,
}

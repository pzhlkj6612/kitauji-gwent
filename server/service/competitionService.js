const CompDao = require("../dao/competitionDao");
const Const = require("../Const");

let instance_;

class CompetitionService {
  constructor() {
    this.cache_ = {};
  }

  static getInstance() {
    if (!instance_) instance_ = new CompetitionService();
    return instance_;
  }

  async getCompetitionInfo(compId) {
    if (!this.cache_[compId]) {
      this.cache_[compId] = await this.loadCompetitionInfo(compId);
    }
    return this.cache_[compId];
  }

  async loadCompetitionInfo(compId) {
    let competition = await CompDao.getInstance().getCompetitionById(compId);
    if (!competition) return null;
    let gameRecords = await CompDao.getInstance().loadCompGameRecords(compId);
    let tree = this.rebuildTree_(gameRecords);
    return {
      competition,
      tree,
    };
  }

  async startCompetition(comp) {
    // get candidates
    let candidates = await CompDao.getInstance().getCandidates(comp.id);
    if (!candidates) return false;
    let tree = Array(2 * this.nearestPowerOf2_(candidates.length) - 1);
    console.info("tree size: ", tree.length);
    
    // arrange candidates according to rank
    candidates.sort((a, b) => a.userRank - b.userRank);
    this.arrangeCandidates_(tree, 0, candidates);

    // update and persist comp. state
    comp.state = Const.COMP_STATE_STARTED;
    await CompDao.getInstance().updateCompetition(comp);
    await CompDao.persistCompGameRecords(tree.filter(node => !!node));
    return true;
  }

  arrangeCandidates_(tree, top, candidates) {
    if (!candidates.length) return;
    if (candidates.length <= 2) {
      tree[top] = {
        compId: candidates[0].compId,
        nodeIndex: top,
        players: candidates.map(c=>c.username),
      };
      return;
    }
    let left = [], right = [];
    candidates.forEach((c, i) => {
      if (i % 2 === 0) left.push(c);
      else right.push(c);
    });
    this.arrangeCandidates_(tree, 2 * top + 1, left);
    this.arrangeCandidates_(tree, 2 * top + 2, right);
  }

  rebuildTree_(gameRecords) {
    let tree = [];
    for (let node of gameRecords) {
      tree[node.nodeIndex] = node;
    }
    return tree;
  }

  /**
   * Round up to the previous power of 2
   * e.g. 15 -> 8, 29 -> 16, 57 -> 32
   */
  nearestPowerOf2_(n) {
    return 1 << 31 - Math.clz32(n);
  }
}
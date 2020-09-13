const CompDao = require("../dao/competitionDao");
const Const = require("../Const");
const Cache = require("../dao/cache");

let instance_;

class CompetitionService {
  constructor() {
    this.cache_ = {};
    this.pending_ = [];
    this.timer_ = null;
    this.startTimer_();
  }

  static getInstance() {
    if (!instance_) instance_ = new CompetitionService();
    return instance_;
  }

  async addCompetition(data) {
    let result = await CompDao.getInstance().addCompetition(data);
    this.pending_.push(result);
  }

  async getCompetitions() {
    return await CompDao.getInstance().getCompetitions();
  }

  async getCompetitionInfo(compId) {
    if (!this.cache_[compId]) {
      this.cache_[compId] = await this.loadCompetitionInfo(compId);
    }
    return this.cache_[compId];
  }

  async loadCompetitionInfo(compId) {
    let info = {};
    let competition = await CompDao.getInstance().getCompetitionById(compId);
    if (!competition) return null;
    info.comp = competition;

    let candidates = await CompDao.getInstance().getCandidates(compId);
    info.candidateMap = {};
    for (let c of candidates) {
      info.candidateMap[c.username] = c;
    }

    let gameRecords = await CompDao.getInstance().loadCompGameRecords(compId);
    if (gameRecords && gameRecords.length) {
      info.tree = this.rebuildTree_(gameRecords);
    }
    return info;
  }

  async enroll(userModel, compId) {
    let {username} = userModel;
    let userRank = Cache.getInstance().getUserRank(username);
    await CompDao.getInstance().enroll(userModel, compId, userRank);
    if (this.cache_[compId]) {
      this.cache_[compId].candidateMap[username] = await CompDao.getInstance().getCandidate(username, compId);
    }
  }

  async quit(userModel, compId) {
    let {username} = userModel;
    await CompDao.getInstance().quit(username, compId);
    if (this.cache_[compId]) {
      delete this.cache_[compId].candidateMap[username];
    }
  }

  async startTimer_() {
    this.pending_ = await this.getCompetitions();
    let task = () => {
      try {
        this.pending_ = this.pending_
          .filter(comp => comp.state === Const.COMP_STATE_NOT_STARTED);
        let now = new Date().getTime();
        for (let comp of this.pending_) {
          if (comp.startTime < now) {
            await this.startCompetition_(comp);
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        this.timer_ = setTimeout(task, 60 - new Date().getSeconds());
      }
    }
    // round to next minute
    this.timer_ = setTimeout(task, 60 - new Date().getSeconds());
  }

  async startCompetition_(comp) {
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
    if (this.cache_[comp.id]) {
      this.cache_[comp.id].tree = tree;
    }
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

module.exports = CompetitionService;

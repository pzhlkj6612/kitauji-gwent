const CompDao = require("../dao/competitionDao");
const Const = require("../Const");
const Cache = require("../dao/cache");
const SchoolData = require("../../assets/data/schools");

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
    await this.mockCandidates_(result.id, result.capacity);
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

  async enroll(userModel, compId, userRank) {
    let {username} = userModel;
    userRank = userRank || Cache.getInstance().getUserRank(username);
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

  async endGame(username, compId, nodeIndex, isWin) {
    if (isWin) {
      await this.winGame(username, compId, nodeIndex);
    } else {
      await this.loseGame(username, compId, nodeIndex);
    }
  }

  async loseGame(username, compId, nodeIndex) {
    await CompDao.getInstance().updateGrade(
      username, compId, this.nodeIndexToGrade(nodeIndex));

      let node = this.cache_[compId].tree[nodeIndex];
      let foeIndex = 1 - node.players.indexOf(username);

      if (node.withBot) {
        await this.winGame(node.players[foeIndex], compId, nodeIndex);
      }
  }

  async winGame(username, compId, nodeIndex) {
    let tree = this.cache_[compId].tree;
    let node = tree[nodeIndex];
    if (node.winner ||
      node.players.length < 2 ||
      !node.players.includes(username)) {
      return;
    }
    node.winner = username;
    //TODO: set record url
    await CompDao.getInstance().updateGameRecord(node);

    if (nodeIndex === 0) {
      //TODO: handle end of competition
      let comp = this.cache_[compId];
      comp.state = Const.COMP_STATE_ENDED;
      await CompDao.getInstance().updateCompetition(comp);
      await CompDao.getInstance().updateGrade(username, compId, 1);
      return;
    }
    // trigger next round
    await this.triggerNextRound_(compId, Math.floor((nodeIndex - 1) / 2),
      username, node.bandNames[node.players.indexOf(username)], node.withBot);
  }

  async compReady(user, compId, nodeIndex) {
    let comp = this.cache_[compId].comp;
    let node = this.cache_[compId].tree[nodeIndex];
    let username = user.getUserModel().username;
    let index = node.players.indexOf(username);
    if (index < 0) {
      return null;
    }
    let botOptions;
    if (node.withBot && node.players.length > 1) {
      botOptions = {
        deck: comp.mode === Const.FUN_MODE ? comp.funDeck : null,
        bandName: node.bandNames[1 - index],
      }
    }
    return matchmaking.makeOrJoinCompetitionRoom(user, comp, nodeIndex, botOptions);
  }

  async triggerNextRound_(compId, parentIndex, username, bandName, withBot) {
    let tree = this.cache_[compId].tree;
    let parent = tree[parentIndex];
    if (parent.players && parent.players.length >= 2) {
      return;
    }
    parent.players = parent.players || [];
    parent.players.push(username);
    parent.bandNames = parent.bandNames || [];
    parent.bandNames.push(bandName);
    parent.withBot = parent.withBot || withBot;
    await CompDao.getInstance().updateGameRecord(parent);
  }

  async startTimer_() {
    this.pending_ = await CompDao.getInstance().getNotStartedCompetitions();
    let task = async () => {
      try {
        let now = new Date().getTime();
        for (let comp of this.pending_) {
          if (comp.startTime < now + 1000) {
            await this.startCompetition_(comp);
          }
        }
        this.pending_ = this.pending_
          .filter(comp => comp.state === Const.COMP_STATE_NOT_STARTED);
      } catch (e) {
        console.warn(e);
      } finally {
        // round to next minute
        this.timer_ = setTimeout(task, (60 - new Date().getSeconds()) * 1000);
      }
    }
    task();
  }

  async startCompetition_(comp) {
    // get candidates
    let candidates = await CompDao.getInstance().getCandidates(comp.id);
    if (!candidates || !candidates.length) return false;
    let tree = [];
    console.info("tree size: ", 2 * this.nearestPowerOf2_(candidates.length) - 1);
    
    // arrange candidates according to rank
    candidates.sort((a, b) => a.userRank - b.userRank);
    this.arrangeCandidates_(tree, 0, candidates);

    // update and persist comp. state
    comp.state = Const.COMP_STATE_STARTED;
    await CompDao.getInstance().updateCompetition(comp);
    await CompDao.getInstance().persistCompGameRecords(tree.filter(node => !!node));
    if (this.cache_[comp.id]) {
      this.cache_[comp.id].tree = tree;
      this.cache_[comp.id].comp.state = Const.COMP_STATE_STARTED;
    }
    return true;
  }

  arrangeCandidates_(tree, top, candidates) {
    if (!candidates.length) return;
    tree[top] = {
      compId: candidates[0].compId,
      nodeIndex: top,
      players: [],
      bandNames: [],
    };
    if (candidates.length <= 2) {
      tree[top].players = candidates.map(c=>c.username);
      tree[top].bandNames = candidates.map(c=>c.bandName);
      tree[top].withBot = candidates.some(c=>c.isBot);
      if (candidates.length === 1) {
        // no opponent, pass directly
        tree[top].winner = candidates[0].username;
        let parentIndex = Math.floor((top - 1) / 2);
        if (parentIndex < 0) return;
        let parent = tree[parentIndex];
        parent.players = [candidates[0].username];
        parent.bandNames = [candidates[0].bandName];
      }
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

  async mockCandidates_(compId, capacity) {
    capacity = (Math.random() * capacity) | 0;
    for (let i = 0; i < capacity; i++) {
      await this.enroll({
        username: "bot" + i,
        bandName: SchoolData["zenkoku"][(Math.random() * SchoolData["zenkoku"].length) | 0],
        isBot: true,
      }, compId, i + 1);
    }
  }

  /**
   * Round up to the previous power of 2
   * e.g. 15 -> 8, 29 -> 16, 57 -> 32
   */
  nearestPowerOf2_(n) {
    return 1 << 31 - Math.clz32(n);
  }

  /**
   * 0 -> 2; 1,2 -> 4; 3,4,5,6 -> 8
   */
  nodeIndexToGrade(index) {
    return this.nearestPowerOf2_(index + 1) * 2;
  }
}

module.exports = CompetitionService;

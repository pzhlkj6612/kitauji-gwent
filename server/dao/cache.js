var SortedSet = require('redis-sorted-set');

let instance_;

class Cache {
  constructor() {
    // ranking based on win count
    this.winRanking = new SortedSet();
    this.conditions = {};
  }

  static getInstance() {
    if (!instance_) instance_ = new Cache();
    return instance_;
  }

  async initialize() {
    let allUser = await db.getAllUser();
    for (let user of allUser) {
      if (!user.winCount) continue;
      this.winRanking.set(user.username, user.winCount);
    }
  }

  async getCondition(username, conditionKey, opt_defaultValue) {
    this.conditions[username] = this.conditions[username] || {};
    let condition = this.conditions[username][conditionKey];
    if (condition != null) {
      return condition;
    }
    condition = this.conditions[username][conditionKey] = await db.getCondition(username, conditionKey);
    return condition != null ? conditionKey : opt_defaultValue;
  }

  async setCondition(username, conditionKey, value) {
    this.conditions[username] = this.conditions[username] || {};
    this.conditions[username][conditionKey] = value;
    await db.setCondition(username, conditionKey, value);
  }

  async recordUserWin(username, isWin) {
    await db.recordUserWin(username, isWin);
    if (isWin) {
      this.winRanking.set(username, (this.winRanking.get(username) || 0) + 1);
    }
  }

  getUserRank(username) {
    return this.winRanking.rank(username);
  }

  async getTopK(k) {
    let topKUsers = this.winRanking.range(0, k);
    return await db.findUserByNames(topKUsers);
  }
}

module.exports = Cache;

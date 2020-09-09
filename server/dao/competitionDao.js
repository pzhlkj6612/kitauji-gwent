const shortid = require("shortid");
const DB = require("./db");
const Const = require("../Const");

/**
 * id
 * name
 * startTime
 * capacity
 * mode
 * funDeck
 * state
 */
const TABLE_COMPETITION = "competition";
/**
 * username
 * compId
 * compName
 * grade
 * userRank
 */
const TABLE_USER_COMP_REL = "user_competition_rel";
/**
 * compId
 * nodeIndex
 * players: Array
 * winner
 * recordUrl
 */
const TABLE_COMP_GAME_RECORD = "competition_game_record";

let instance_;

class CompetitionDao {
  constructor() {}
  
  static getInstance() {
    if (!instance_) instance_ = new CompetitionDao();
    return instance_;
  }

  async addCompetition(comp) {
    const table = DB.getInstance().db.collection(TABLE_COMPETITION);
    comp = CompetitionDao.toCompetitionDto_(comp);
    await table.insertOne(comp);
    return comp;
  }

  async getCompetitions() {
    const table = DB.getInstance().db.collection(TABLE_COMPETITION);
    return await table.find({}).toArray();
  }

  async getCompetitionById(id) {
    const table = DB.getInstance().db.collection(TABLE_COMPETITION);
    return await table.findOne({
      id
    });
  }

  async updateCompetition(comp) {
    let id = comp.id;
    if (!id) return false;
    const table = DB.getInstance().db.collection(TABLE_COMPETITION);
    await table.updateOne({
      id,
    }, {
      state: comp.state,
    });
  }

  async persistCompGameRecords(records) {
    const table = DB.getInstance().db.collection(TABLE_COMP_GAME_RECORD);
    table.insertMany(records);
  }

  async updateGameRecord(record) {
    await table.updateOne({
      compId: record.compId,
      nodeIndex: record.nodeIndex,
    }, {
      $set: {
        winner: record.winner,
        recordUrl: record.recordUrl,
      }
    });
  }

  async enroll(username, compId, userRank) {
    let comp = await this.getCompetitionById(compId);
    if (!comp) {
      return false;
    }
    const table = DB.getInstance().db.collection(TABLE_USER_COMP_REL);
    await table.updateOne({
      username,
      compId,
    }, {
      $set: {
        compName: comp.name,
        grade: comp.capacity,
        userRank: userRank || 999,
      }
    }, {
      upsert: true,
    });
  }

  async quit(username, compId) {
    const table = DB.getInstance().db.collection(TABLE_USER_COMP_REL);
    await table.remove({
      username,
      compId,
    });
  }

  static toCompetitionDto_(comp) {
    return {
      id: shortid.generate(),
      name: comp.name,
      startTime: Math.max(new Date().getTime(), comp.startTime),
      capacity: comp.capacity,
      mode: comp.mode,
      funDeck: comp.funDeck,
      state: Const.COMP_STATE_NOT_STARTED,
      candidates: [],
    };
  }

}
const MongoClient = require('mongodb').MongoClient;
const Util = require("./util");

const MONGODB_PORT = 27017;
const DB_NAME = "mydb";

const TABLE_USER = "user";
const TABLE_CARD = "card";
const TABLE_DRAW_STATS = "draw_stats";
const TABLE_PROGRESS = "progress";

class DB {
  constructor() {
    this.connectPromise = MongoClient.connect(`mongodb://localhost:${MONGODB_PORT}`).then((client) => {
      console.info("mongodb connected");
      this.client = client;
      this.db = client.db(DB_NAME);
  
      this.db.createCollection(TABLE_USER, function(err) {
        if (err) throw err;
        console.log("user table created!");
      });
      this.db.createCollection(TABLE_CARD, function(err) {
        if (err) throw err;
        console.log("card table created!");
      });
      this.db.createCollection(TABLE_DRAW_STATS, function(err) {
        if (err) throw err;
        console.log("draw stats table created!");
      });
      this.db.createCollection(TABLE_PROGRESS, function(err) {
        if (err) throw err;
        console.log("progress table created!");
      });
    });
  }
  
  // user
  
  async addUser(user) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    await table.insertOne(Util.toUserDto(user));
  }
  
  async findUserByName(username) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    return await table.findOne({
      username,
    });
  }
  
  // card
  
  async findAllCardsByUser(username) {
    await this.connectPromise;
    return await this.db.collection(TABLE_CARD).find({
      username,
    }).toArray();
  };
  
  async findCardsByUser(username, deck) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    let result = await table.findOne({
      username,
      deck,
    });
    if (result) {
      return result.cards;
    }
    return null;
  };
  
  async addCards(username, deck, cardList) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
  
    let exist = await this.findCardsByUser(username, deck);
    if (exist) {
      let existCards = exist["cards"];
      for (let key of cardList) {
        if (existCards[key]) existCards[key]++;
        else existCards[key] = 1;
      }
      return await table.updateOne({username, deck}, {
        $set: {
          cards: existCards,
        }
      });
    }
    let cardMap = {};
    for (let key of cardList) {
      if (cardMap[key]) cardMap[key]++;
      else cardMap[key] = 1;
    }
    return await table.insertOne({
      username,
      deck,
      cardMap,
    });
  };

  async loadDrawStats(username, scenario) {
    await this.connectPromise;
    let result = await this.db.collection(TABLE_DRAW_STATS).findOne({
      username,
      scenario,
    });
    if (result) {
      return result.stats;
    }
    return null;
  }

  async storeDrawStats(username, scenario, stats) {
    await this.connectPromise;
    return this.db.collection(TABLE_DRAW_STATS).updateOne({
      username,
      scenario,
    }, {
      $set: stats,
    }, {
      upsert: true,
    });
  }

  // progress
  
  async findProgressByUser(username) {
    await this.connectPromise;
    return await this.db.collection(TABLE_PROGRESS).find({
      username,
    }).toArray();
  };
  
  async findProgressByUserQuest(username, questName) {
    await this.connectPromise;
    return await this.db.collection(TABLE_PROGRESS).findOne({
      username,
      questName,
    });
  }
  
  async updateProgress(username, questName, progress) {
    await this.connectPromise;
    return await this.db.collection(TABLE_PROGRESS).updateOne({
      username,
      questName,
    }, {
      $set: progress,
    }, {
      upsert: true,
    });
  };
}

module.exports = DB;

const MongoClient = require('mongodb').MongoClient;
const Util = require("./util");
const CardData = require("../../assets/data/cards");
const Const = require("../Const");
const Config = require('../../public/Config');

const MONGODB_PORT = 27017;
const DB_NAME = "mydb";

const TABLE_USER = "user";
const TABLE_CARD = "card";
const TABLE_DRAW_STATS = "draw_stats";
const TABLE_PROGRESS = "progress";
const TABLE_CONDITION = "condition";

class DB {
  constructor() {
    this.connectPromise = MongoClient.connect(`mongodb://${Config.MONGODB_HOST}:${MONGODB_PORT}`).then((client) => {
      console.info("mongodb connected");
      this.client = client;
      this.db = client.db(DB_NAME);
    }).catch(e => {
      console.warn("Database not started. But you can still connect to online servers");
      console.warn("本地未安装数据库，请忽略报错并在游戏中选择线上服务器。>_<");
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

  async findUserByNames(usernames) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    return await table.find({
      username: {
        $in: usernames,
      }
    }).toArray();
  }

  async getAllUser() {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    return await table.find({}).toArray();
  }

  /**
   * update bandName, currentDeck
   */
  async updateUser(userModel) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    return await table.updateOne({
      username: userModel.username
    }, {
      $set: {
        bandName: userModel.bandName,
        currentDeck: userModel.currentDeck,
      }
    });
  }

  async recordUserWin(username, isWin) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    let update;
    if (isWin) {
      update = {winCount: 1};
    } else {
      update = {loseCount: 1}
    };
    return await table.updateOne({username}, {
      $inc: update,
    });
  }

  async recordZenkokuGold(username) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    let zenkokuGold = await table.findOne({username}).zenkokuGold || 0;
    zenkokuGold += 1;
    return await table.updateOne({username}, {
      $set: {zenkokuGold},
    });
  }

  async updateWallet(username, coins, isSpend) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_USER);
    let exist = await table.findOne({username});
    let wallet = Math.max(0, exist.wallet || 0);
    wallet = isSpend ? (wallet - coins) : (wallet + coins);
    if (wallet < 0) {
      return false;
    }
    await table.updateOne({username}, {
      $set: {
        wallet
      },
    });
    return true;
  }

  // card
  
  async findAllCardsByUser(username) {
    await this.connectPromise;
    return await this.db.collection(TABLE_CARD).find({
      username,
    }).toArray();
  };
  
  async findCardsByUser(username, deck, includeNeutral) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    let result = await table.findOne({
      username,
      deck,
    });
    let cards = {};
    if (result) {
      cards = result.cards;
    }
    if (includeNeutral) {
      let neutral = await table.findOne({
        username,
        deck: Const.NEUTRAL_DECK,
      });
      if (neutral) {
        for (let card of Object.keys(neutral.cards)) {
          cards[card] = neutral.cards[card];
        }
      }
    }
    return cards;
  };
  
  async findLeaderCardsByUser(username) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    let result = await table.findOne({
      username,
      isLeaderCard: true,
    });
    if (result) {
      return result.cards;
    }
    return null;
  }

  async addCards(username, deck, cardList) {
    if (!cardList || !cardList.length) return;
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
  
    let cardMap = await this.findCardsByUser(username, deck) || {};
    let neutralCardMap = await this.findCardsByUser(username, Const.NEUTRAL_DECK) || {};
    let updateNeutral = false, updateDeck = false;
    for (let key of cardList) {
      if (CardData[key].faction === Const.NEUTRAL_DECK) {
        updateNeutral = true;
        if (neutralCardMap[key]) neutralCardMap[key]++;
        else neutralCardMap[key] = 1;
      } else {
        updateDeck = true;
        if (cardMap[key]) cardMap[key]++;
        else cardMap[key] = 1;
      }
    }
    if (Object.keys(cardMap).length && updateDeck) {
      await table.updateOne({username, deck}, {
        $set: {
          cards: cardMap,
        }
      }, {
        upsert: true,
      });
    }
    if (Object.keys(neutralCardMap).length && updateNeutral) {
      await table.updateOne({
        username,
        deck: Const.NEUTRAL_DECK,
      }, {
        $set: {
          cards: neutralCardMap,
        }
      }, {
        upsert: true,
      });
    }
  };

  async removeCard(username, deck, key, amount) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);

    let cardMap = await this.findCardsByUser(username, deck) || {};
    let neutralCardMap = await this.findCardsByUser(username, Const.NEUTRAL_DECK) || {};
    let updateNeutral = false, updateDeck = false;
    if (CardData[key].faction === Const.NEUTRAL_DECK) {
      updateNeutral = true;
      if (!neutralCardMap[key] || neutralCardMap[key] < amount) return false;
      else neutralCardMap[key] -= amount;
    } else {
      updateDeck = true;
      if (!cardMap[key] || cardMap[key] < amount) return false;
      else cardMap[key] -= amount;
    }
    if (Object.keys(cardMap).length && updateDeck) {
      await table.updateOne({username, deck}, {
        $set: {
          cards: cardMap,
        }
      }, {
        upsert: true,
      });
    }
    if (Object.keys(neutralCardMap).length && updateNeutral) {
      await table.updateOne({
        username,
        deck: Const.NEUTRAL_DECK,
      }, {
        $set: {
          cards: neutralCardMap,
        }
      }, {
        upsert: true,
      });
    }
    return true;
  };

  async addLeaderCards(username, cardList) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    let cards = {};
    let exist = await this.findLeaderCardsByUser(username);
    if (exist) {
      cards = exist;
    }
    for (let key of cardList) {
      if (!cards[key]) cards[key] = 1;
    }
    return await table.updateOne({
      username,
      isLeaderCard: true,
    }, {
      $set: {cards},
    }, {
      upsert: true,
    });
  }

  async loadAllCustomDeck(username) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    return await table.find({
      username,
      isCustomDeck: true,
    }).toArray();
  }

  async loadCustomDeck(username, deck) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    let result = await table.findOne({
      username,
      deck,
      isCustomDeck: true,
    });
    if (result) {
      return result.customDeck;
    }
    return {};
  }

  async storeCustomDeck(username, deck, customDeck) {
    await this.connectPromise;
    const table = this.db.collection(TABLE_CARD);
    return await table.updateOne({
      username,
      deck,
      isCustomDeck: true,
    }, {
      $set: {customDeck},
    }, {
      upsert: true,
    });
  }

  async storeCustomDeckByList(username, deck, cardList) {
    let leader = cardList.find(c=>CardData[c].type === 3);
    let cardInDeck = {};
    for (let key of cardList) {
      if (CardData[key].type !== 3) {
        cardInDeck[key] = cardInDeck[key] ? cardInDeck[key] + 1 : 1;
      }
    }
    return await this.storeCustomDeck(username, deck, {
      deck,
      cardInDeck,
      leader,
    });
  }

  // draw stats

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
      $set: {stats},
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
    let result = await this.db.collection(TABLE_PROGRESS).findOne({
      username,
      questName,
    });
    if (result) {
      return result.progress;
    }
    return null;
  }
  
  async updateProgress(username, questName, progress, ifNotExist) {
    await this.connectPromise;
    if (ifNotExist) {
      let exist = await this.findProgressByUserQuest(username, questName);
      if (exist) return;
    }
    return await this.db.collection(TABLE_PROGRESS).updateOne({
      username,
      questName,
    }, {
      $set: {progress},
    }, {
      upsert: true,
    });
  };

  // condition

  async setCondition(username, conditionKey, value) {
    await this.connectPromise;
    return await this.db.collection(TABLE_CONDITION).updateOne({
      username,
    }, {
      $set: {
        [conditionKey]: value,
      },
    }, {
      upsert: true,
    });
  }

  async getCondition(username, conditionKey) {
    await this.connectPromise;
    let result = await this.db.collection(TABLE_CONDITION).findOne({
      username,
    }, {
      [conditionKey]: true
    });
    if (result) {
      return result[conditionKey];
    }
    return null;
  }
}

module.exports = DB;

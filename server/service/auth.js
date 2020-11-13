// TODO: put name list in database
const ADMIN = [
  "brotherjing",
  "kyoaniCorpus",
];

const BLACKLIST = [
  "haibara",
];

const ADMIN_SET = {};
const BLACK_SET = {};
for (let u of ADMIN) ADMIN_SET[u] = true;
for (let u of BLACKLIST) BLACK_SET[u] = true;

class Auth {
  constructor() {
  }

  static isBlack(username) {
    return BLACK_SET[username];
  }

  static isAdmin(username) {
    return ADMIN_SET[username];
  }

  static canCreateComp(username) {
    return ADMIN_SET[username];
  }
}

module.exports = Auth;

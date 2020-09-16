const ADMIN = [
  "brotherjing",
  "kyoaniCorpus",
];

const ADMIN_SET = {};
for (let u of ADMIN) ADMIN_SET[u] = true;

class Auth {
  constructor() {
  }

  static isAdmin(username) {
    return ADMIN_SET[username];
  }

  static canCreateComp(username) {
    return ADMIN_SET[username];
  }
}

module.exports = Auth;

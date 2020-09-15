const ADMIN = [
  "brotherjing",
  "kyoaniCorpus",
];

class Auth {
  constructor() {
  }

  static canCreateComp(username) {
    return ADMIN.includes(username);
  }
}

module.exports = Auth;

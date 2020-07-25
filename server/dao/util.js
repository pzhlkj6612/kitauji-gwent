var Util = (function() {
  var Util = {};
  Util.toUserDto = function(user) {
    return {
      "username": user.username,
      "password": user.password,
      "bandName": user.bandName,
      "initialDeck": user.initialDeck,
      "currentDeck": user.currentDeck || user.initialDeck,
      "winCount": user.winCount || 0,
      "loseCount": user.loseCount || 0,
      "zenkokuGold": 0,
      "wallet": 0,
    };
  }

  return Util;
})();

module.exports = Util;

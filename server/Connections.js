var Connections = (function(){
  var Connections = function(){
    if(!(this instanceof Connections)){
      return (new Connections());
    }
    /**
     * constructor here
     */
    this._connections = {};
    this.roomCollection = {};

  };
  var r = Connections.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */

  r._connections = null;
  r.roomCollection = null;
  r._length = 0;

  r.add = function(user) {
    this._connections[user.getID()] = user;
    this._length++;
  }

  r.remove = function(user) {
    if (this._connections[user.getID()]) {
      delete this._connections[user.getID()];
      this._length--;
    }
  }

  r.get = function() {
    return this._connections;
  }

  r.hasUser = function(user) {
    return !!this._connections[user.getID()];
  }

  r.findById = function(id) {
    return this._connections[id];
  }

  r.length = function() {
    return this._length;
  }

  r.getIdleUserCount = function() {
    return Object.values(this._connections).filter(user => user.isIdle()).length;
  }

  return Connections;
})();

module.exports = Connections;
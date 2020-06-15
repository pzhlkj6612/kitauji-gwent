var argv = require('minimist')(process.argv.slice(2));
var http = require("http");
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var app = express();
var Config = require("../public/Config")
var DB = require("./dao/db");

global.connections = require("./Connections")();
global.matchmaking = require("./Matchmaker")();
global.db = new DB();

global.Room = require("./Room");

global.User = require("./User");

var server = http.createServer(app);
global.io = require("socket.io")(server, {
  handlePreflightRequest: (req, res) => {
      const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
  }
});
io.set('origins', '*:*');
server.listen(Config.Server.port);

app.use(function(req, res, next) {
  res.setHeader("Content-Security-Policy-Report-Only", "default-src 'self'");
  return next();
});

app.use(express.static(__dirname + '/../public'));
app.use('/public', express.static(__dirname + '/../public'));
app.use('/assets', express.static(__dirname + '/../assets'));
app.use(favicon(path.join(__dirname, '/../assets/texture', 'favicon.ico')))

app.listen(Config.WebServer.port);

var admin = io.of("/admin");

io.on("connection", function(socket) { //global connection
  socket.on("user:init", function(data) {
    let user = null;
    if (data.connId != null) {
      user = connections.findById(data.connId);
      if (user && user.getRoom()) {
        console.log("user ", user.getName(), " reconnect");
        try {
          user.reconnect(socket);
        } catch (e) {
          console.warn(e);
          user = null;
        }
      }
    }
    if (!user) {
      connections.add(user = User(socket, data.token));
      console.log("new user ", user.getName());
    }

    socket.on("disconnect", function() {
      user.waitForReconnect();
    })


    io.emit("update:playerOnline", {
      online: connections.length(),
      idle: connections.getIdleUserCount(),
    });
  });

})

admin.on("connection", function(socket) {
  socket.on("sendMessage", function(msg) {
    console.log("admin send msg: " + msg);
    io.emit("notification", {
      message: msg
    })
  })
})
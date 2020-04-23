# Kitauji Gwent

[![Build Status](https://travis-ci.org/kitauji-gwent/kitauji-gwent.svg?branch=master)](https://travis-ci.org/kitauji-gwent/kitauji-gwent)

# Introduction

Kitauji Gwent is a Gwent card game adaptation which features a new set of cards for the characters from the TV animation *Hibike Euphonium*

# Install
## - Requirements
- [node.js](https://nodejs.org/) installed
- [GraphicsMagick](http://www.graphicsmagick.org) installed (for generating sprites)

## - Build

```sh
cd ~/myWebserverRoot
git clone https://github.com/kitauji-gwent/kitauji-gwent.git
cd kitauji-gwent
npm install
npm run build
```


## - Config
- go to /public and open Config.js
- change hostname to your address. (e.g., "192.168.123.1") <br>Make sure you don't have a trailing slash after your IP or address. (e.g., "192.168.123.1/")

## - Start Server
```sh
cd ~/myProjectDirectory/kitauji-gwent
node server/server.js
```

## - Start Client
- Open your browser and go to e.g. "http://192.168.123.1:3000"

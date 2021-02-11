# Kitauji Gwent

English|[中文](/README-zh.md)

[![Build Status](https://travis-ci.org/kitauji-gwent/kitauji-gwent.svg?branch=master)](https://travis-ci.org/kitauji-gwent/kitauji-gwent)
[![Github All Releases](https://img.shields.io/github/downloads/kitauji-gwent/kitauji-gwent/total.svg)]()

# Introduction

Kitauji Gwent is a Gwent card game adaptation which features a new set of cards for the characters from the TV animation *Hibike! Euphonium*

# How to play

- Download latest version from [release page](https://github.com/kitauji-gwent/kitauji-gwent/releases).
- Run the executable.
- Open your browser and go to http://localhost:3000.

# Install

Do the following steps or see the ci build [script](/.travis.yml).

## - Requirements
- [node.js](https://nodejs.org/) installed
- [GraphicsMagick](http://www.graphicsmagick.org) installed (for generating sprites)

## - Build

```sh
git clone https://github.com/kitauji-gwent/kitauji-gwent.git
cd kitauji-gwent
npm install
npm run build
```

## - Config
- go to /public and open Config.js

## - Start Server
```sh
cd kitauji-gwent
node server/server.js
```

## - Start Client
- Open your browser and go to e.g. "http://192.168.123.1:3000"

## - Troubleshooting

[npm build error](https://github.com/kitauji-gwent/kitauji-gwent/issues/6)

# 北宇治昆特牌

[English](/README.md)|中文

[![Build Status](https://travis-ci.org/kitauji-gwent/kitauji-gwent.svg?branch=master)](https://travis-ci.org/kitauji-gwent/kitauji-gwent)
[![Github All Releases](https://img.shields.io/github/downloads/kitauji-gwent/kitauji-gwent/total.svg)]()

# 介绍

北宇治昆特牌改编自巫师3昆特牌，包含了一套以动画《吹响吧！上低音号》中的人物为主题的卡牌。

# 如何运行

- 从[这里](https://github.com/kitauji-gwent/kitauji-gwent/releases)下载最新版本.
- 双击运行.
- 打开浏览器访问 http://localhost:3000.

或者访问线上版本：http://kitauji-gwent.club

# 从源码安装

执行以下步骤或参考[ci脚本](/.travis.yml).

## - 安装依赖
- [node.js](https://nodejs.org/)
- [GraphicsMagick](http://www.graphicsmagick.org) (用于生成sprite)

## - 构建

```sh
git clone https://github.com/kitauji-gwent/kitauji-gwent.git
cd kitauji-gwent
npm install
npm run build
```

## - 配置
- go to /public and open Config.js

## - 运行server
```sh
cd kitauji-gwent
node server/server.js
```

## - Start Client
- Open your browser and go to e.g. "http://192.168.123.1:3000"

## - Troubleshooting

[npm build error](https://github.com/kitauji-gwent/kitauji-gwent/issues/6)

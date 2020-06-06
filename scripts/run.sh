#!/bin/bash

# usage:
# ./run.sh <new_version>

if [ "$1" = "" ]
then
  echo "Usage: $0 <new image version>"
  exit
fi

echo "pulling $1"
sudo docker pull \
    registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:$1

echo "stop old version"
sudo docker rm $(sudo docker stop gwent)

echo "run new version"
sudo docker run \
    -p 80:3000 \
    -p 16918:16918 \
    -d --restart unless-stopped \
    --name gwent \
    registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:$1

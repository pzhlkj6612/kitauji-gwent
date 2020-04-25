Build before publish.

```bash
docker build -t registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version> .

docker push registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>
```

On remote machine:

```bash
sudo docker pull registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>

docker run -p 80:3000 -p 16918:16918 -d registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>
```

```
aws s3 cp assets/ s3://brotherjing-static/assets --recursive --exclude "cards/**" --exclude "original_cards/**" --cache-control max-age=86400
aws s3 cp public s3://brotherjing-static/public --recursive
```

```
aws s3 cp for-docker/Config.js s3://brotherjing-static/public/Config.js
```
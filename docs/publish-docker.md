Build before publish.

In `gulpfile.js`, change `debug` to false.

```bash
docker build -t registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version> .

docker push registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>
```

On remote machine:

```bash
sudo docker pull registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>

sudo docker run -p 80:3000 -p 16918:16918 -d --restart unless-stopped --network=host registry.cn-hangzhou.aliyuncs.com/kitauji/kitauji-gwent:<version>
```

```
aws s3 cp assets/ s3://brotherjing-static/assets --recursive --exclude "cards/**" --exclude "original_cards/**" --cache-control max-age=86400
aws s3 cp public s3://brotherjing-static/public --recursive
```

```
aws s3 cp for-docker/Config.js s3://brotherjing-static/public/Config.js
```

Start mongodb:

```
docker run -d -p 27017-27019:27017-27019 --name mongodb --rm mongo
```
To connect to mongodb from docker container, use docker0 interface(172.17.0.1).

### EC2 Setup

```
2  sudo yum update
4  sudo yum install docker-io -y
5  systemctl start docker
9  sudo service docker start
10  sudo usermod -a -G docker ec2-user
16  sudo docker login --username=brotherjing0129 registry.cn-hangzhou.aliyuncs.com
```
FROM node:7.5.0

WORKDIR /usr/src/app

COPY for-docker/package.json ./
RUN npm install

COPY for-docker/gulpfile.js ./
COPY assets ./assets
COPY public ./public
COPY server ./server

RUN npm run build

EXPOSE 3000
EXPOSE 16918

CMD ["node", "server/server.js"]

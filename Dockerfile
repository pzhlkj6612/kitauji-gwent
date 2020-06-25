FROM node:7.5.0

WORKDIR /usr/src/app

COPY for-docker/package.json ./
RUN npm install

COPY for-docker/gulpfile.js ./
COPY assets/js ./assets/js
COPY assets/texture/favicon.ico ./assets/texture/favicon.ico
COPY assets/data ./assets/data
COPY public ./public
COPY server ./server

RUN npm run build

COPY for-docker/Config.js ./public/

EXPOSE 3000
EXPOSE 16918

CMD ["node", "--harmony-async-await", "server/server.js"]

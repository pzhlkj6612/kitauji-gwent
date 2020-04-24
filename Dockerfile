FROM node:7.5.0

WORKDIR /usr/src/app

COPY lib/GraphicsMagick-1.3.35.tar.gz ./
RUN tar -xvf GraphicsMagick-1.3.35.tar.gz && \
    cd GraphicsMagick-1.3.35 && \
    ./configure && \
    make && \
    make install && \
    cd ..

COPY package*.json ./
RUN npm install --silent --progress=false --production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "server/server.js"]

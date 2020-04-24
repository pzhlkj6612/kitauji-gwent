FROM node:7.5.0

WORKDIR /usr/src/app

COPY lib/GraphicsMagick-1.3.35.tar.gz ./
RUN tar -xvf GraphicsMagick-1.3.35.tar.gz
RUN cd GraphicsMagick-1.3.35
RUN ./configure
RUN make
RUN make install
RUN cd ..
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "server/server.js"]

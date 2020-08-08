FROM node:10.13.0-alpine

ENV PORT=3000
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run tsc
RUN npm run lessc style.less style.css

CMD npm start

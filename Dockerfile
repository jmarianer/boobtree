FROM node:10.13.0-alpine

ENV PORT=3000
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
CMD npm start

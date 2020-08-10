FROM node:10.13.0-alpine

ENV PORT=3000
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run tsc && \
    npm run lessc && \
    npm run browserify -- main_ui.ts -o boobtree.js && \
    npm run browserify -- join.ts -o join.js && \
    npm run browserify -- newgame.ts -o new.js

CMD npm start

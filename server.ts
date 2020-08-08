// tslint:disable:no-console
import * as async from 'async';
import * as browserify from 'browserify';
import concat = require('concat-stream');
import * as express from 'express';
import * as fs from 'fs';
import * as less from 'less';
import { Collection, MongoClient, ObjectID } from 'mongodb';
import * as path from 'path';
import * as io from 'socket.io';
import Route = require('route-parser');

import { Game } from './game';

import newGameTemplate = require('./templates/newgame');
import joinTemplate = require('./templates/join');
import archiveTemplate = require('./templates/archive');

function serveStatic(app: express.Express, url: string, filename: string) {
  app.get(url, (req, res) => {
    res.sendFile(path.resolve(__dirname, filename));
  });
}

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
})

const app = express();
const userRoute = '/game/:game/user/:user';
const newRoute = '/game/:game/new';
let games : { [gameid:string] : Game } = {};

serveStatic(app, '/js/boobtree.js', 'main_ui.js');
serveStatic(app, '/js/join.js', 'join.js');
serveStatic(app, '/js/new.js', 'newgame.js');
serveStatic(app, '/style/style.css', 'style.css');

MongoClient.connect(process.env.MONGODB, (err, client) => {
  if (err) {
    throw err;
  }

  let db: Collection = client.db('boobtree').collection('boobtree');

  app.get(userRoute, (request, response) => {
    if (request.params.game in games) {
      async.waterfall([
        async.apply(fs.readFile, 'main_ui.html'),
        async.asyncify((data: Buffer) => response.send(data.toString())),
      ]);
    } else {
      response.status(404).send("No such game");
    }
  });
  app.get('/newgame', (request, response) => {
    db.insertOne({}, (err, result) => {
      if (err) {
        throw err;
      }

      let game = result.ops[0]._id.toHexString();
      games[game] = new Game(db, game);

      response.redirect('/game/' + game + '/new');
    });
  });
  app.get(newRoute, (request, response) => {
    response.send(newGameTemplate(request.params.game));
  });
  app.get('/game/:game/join', (request, response) => {
    response.send(joinTemplate(request.params.game));
  });
  app.get('/game/:game/start', (request, response) => {
    if (request.params.game in games) {
      games[request.params.game].start();
      response.send("Game started. Please close this window");
    } else {
      response.status(404).send("No such game");
    }
  });
  app.get('/game/:game/archive', (request, response) => {
    db.findOne({ _id: new ObjectID(request.params.game)}, (err, result) => {
      if (err) {
        throw err;
      }

      if (result && result.archive) {
        response.send(archiveTemplate(result.archive));
      } else {
        response.status(404).send("No such game");
      }
    });
  });

  let listener = app.listen(process.env.PORT, () => {
    console.log('Your app is up');
  });

  let ioListener = io(listener);
  ioListener.on('connection', (socket) => {
    let referer = new URL(socket.client.request.headers.referer).pathname;
    if (path.basename(referer) == 'new') {
      let { game } = new Route(newRoute).match(referer) as unknown as {
        game : string;
      };

      if (game in games) {
        games[game].set_socket(socket);
      }
    } else {
      let { game, user } = new Route(userRoute).match(referer) as unknown as {
        game : string;
        user : string;
      };

      if (game in games) {
        games[game].add_player(user, socket);
      }
    }
  });
});

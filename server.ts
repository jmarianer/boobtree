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

// Helpers for serving Typescript and Less as JS and CSS.
// TODO: Factor out of both here and the crosswords site.
function serveJs(app: express.Express, url: string, tsFilename: string,
                 callback: async.AsyncResultArrayCallback<string, string>) {
  let errors = false;
  console.log('Compiling ' + tsFilename);
  browserify(tsFilename)
    .plugin('tsify', { noImplicitAny: true, jsx: 'react' })
    .bundle()
    .on('error', (error: Error) => {
      console.error(error.toString());
      errors = true;
    })
    .pipe(concat((buf: Buffer) => {
      if (errors) {
        callback('Error compiling ' + tsFilename, null);
      }
      console.log('Finished compiling ' + tsFilename);
      app.get(url, (req, res) => {
        res.set('Content-Type', 'text/javascript');
        res.send(buf.toString());
      });
      callback(null, null);
    }));
}

function serveCss(app: express.Express, url: string, lessFilename: string,
                  callback: async.AsyncResultArrayCallback<string, string>) {
  console.log('Compiling ' + lessFilename);
  async.waterfall([
    async.apply(fs.readFile, lessFilename),
    async.asyncify((data: Buffer) => data.toString()),
    // TODO: Figure out why this is not the same as just "less.render".
    (data: string, cb: (error: Less.RenderError, output: Less.RenderOutput) => void) => less.render(data, cb),
    async.asyncify((data: Less.RenderOutput) => {
      app.get(url, (req, res) => {
        res.set('Content-Type', 'text/css');
        res.send(data.css);
      });
      console.log('Finished compiling ' + lessFilename);
      callback(null, null);
    }),
  ]);
}

// Main begins here.
const app = express();
const userRoute = '/game/:game/user/:user';
const newRoute = '/game/:game/new';
let games : { [gameid:string] : Game } = {};

async.parallel([
  async.apply(async.waterfall, [
    async.apply(MongoClient.connect, process.env.MONGODB),
    async.asyncify((client: MongoClient) => client.db('boobtree').collection('boobtree')),
  ]),
  async.apply(serveJs, app, '/js/boobtree.js', 'main_ui.ts'),
  async.apply(serveJs, app, '/js/join.js', 'join.ts'),
  async.apply(serveJs, app, '/js/new.js', 'newgame.ts'),
  async.apply(serveCss, app, '/style/style.css', 'style.less'),
], (err, results) => {
  if (err) {
    throw err;
  }

  let db: Collection = results[0];

  app.get(userRoute, (request, response) => {
    async.waterfall([
      async.apply(fs.readFile, 'main_ui.html'),
      async.asyncify((data: Buffer) => response.send(data.toString())),
    ]);
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
    games[request.params.game].start();
  });
  app.get('/game/:game/archive', (request, response) => {
    db.findOne({ _id: new ObjectID(request.params.game)}, (err, result) => {
      if (err) {
        throw err;
      }

      response.send(archiveTemplate(result.archive));
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

// tslint:disable:no-console
import * as async from 'async';
import * as browserify from 'browserify';
import concat = require('concat-stream');
import * as express from 'express';
import * as fs from 'fs';
import * as less from 'less';
import * as path from 'path';
import * as io from 'socket.io';
import Route = require('route-parser');

import { Game } from './game';

// Helpers for serving Typescript and Less as JS and CSS.
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
const route = '/game/:game/user/:user';
let games : { [gameid:number] : Game } = {};

async.parallel([
  async.apply(serveJs, app, '/js/boobtree.js', 'main_ui.ts'),
  async.apply(serveCss, app, '/style/style.css', 'style.less'),
], (err, _results) => {
  if (err) {
    throw err;
  }

  app.get(route, (request, response) => {
    async.waterfall([
      async.apply(fs.readFile, 'main_ui.html'),
      async.asyncify((data: Buffer) => response.send(data.toString())),
    ]);
  });

  let listener = app.listen(process.env.PORT, () => {
    console.log('Your app is up');
  });

  let ioListener = io(listener);
  ioListener.on('connection', (socket) => {
    let referer = new URL(socket.client.request.headers.referer);
    let { game, user } = new Route(route).match(referer.pathname) as unknown as {
      game : string;
      user : string;
    };
    if (!(+game in games)) {
      games[+game] = new Game(2);
    }

    games[+game].add_player(user, socket);
  });
});

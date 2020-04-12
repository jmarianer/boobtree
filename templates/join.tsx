import * as React from './noreact';
import base = require('./base');

export = (game : string) => base('join.js', 'Join Boobtree game',
    <div>Name: <input id='name' /></div>,
    <input type='hidden' id='game' value={ game } />,
    <button id='join'>Join</button>,
    );

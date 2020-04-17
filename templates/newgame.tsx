import * as React from './noreact';
import base = require('./base');

export = (game : string) => base('new.js', 'New Boobtree game',
    <a href={ '/game/' + game  + '/join' }>Join</a>,
    <a href={ '/game/' + game  + '/start' }>Start</a>,
    <div id='players' />,
    );


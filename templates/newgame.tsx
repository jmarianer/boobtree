import * as React from './noreact';
import base = require('./base');

export = (game : string, shortId : string) => base('new.js', 'New Boobtree game',
    <a id="join" href={ '/game/' + game  + '/join' }>Join the game</a>,
    <span>({ shortId })</span>,
    <div id="sharelink">
      Please share this link or the code with the rest of your party
    </div>,
    <div id="player-container">
      The following players have already joined:
      <div id="players">
        No one yet!
      </div>
    </div>,
    <a id="start" href={ '/game/' + game  + '/start' }>That's everyone!</a>,
    );


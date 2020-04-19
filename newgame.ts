import * as $ from 'jquery';
import * as io from 'socket.io-client';

let socket = io();

socket.on('players', (players : string[]) => {
  $('#players').text(players.join('\n'));
});

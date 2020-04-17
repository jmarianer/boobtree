import * as $ from 'jquery';
import * as io from 'socket.io-client';

let socket = io();
let players : string[] = [];

socket.on('player', (name : string) => {
  players.push(name);
  $('#players').text(players.join('\n'));
});

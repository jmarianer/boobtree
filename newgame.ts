import * as $ from 'jquery';
import * as io from 'socket.io-client';

let socket = io();
socket.on('player', (name : string) => {
  alert(name);
});

$(() => {
  alert(5);
});

import * as $ from 'jquery';
import * as io from 'socket.io-client';

var
  prev : JQuery<HTMLElement>,
  next : JQuery<HTMLElement>,
  transition_stage : number,
  next_offset : JQuery.Coordinates,
  prev_offset : JQuery.Coordinates;

function done() {
  transition_stage = 0;
  next_offset = next.offset();
  prev_offset = prev.offset();

  next.animate({top: prev_offset.top - next_offset.top}, () => {
    prev.css({visibility: 'hidden'});
    next.animate({left: -1000 - next_offset.left});
  });
}

let socket = io();

$(() => {
  prev = $('#previous');
  next = $('#next');
  $('#done').click(done);
  /*
  canvas = new fabric.Canvas('c', {
    isDrawingMode: true
  });
  */
});

socket.on('start', () => { 
  $('#initial').show();
  $('#next-phrase').show();

  prev.animate({opacity: 1});
  next.animate({opacity: 1});
})

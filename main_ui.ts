import * as $ from 'jquery';
import {fabric} from 'fabric';
import * as io from 'socket.io-client';

enum Mode { phrase, drawing }

var
  prev : JQuery<HTMLElement>,
  next : JQuery<HTMLElement>,
  transition_stage : number,
  next_offset : JQuery.Coordinates,
  prev_offset : JQuery.Coordinates,
  current_mode: Mode;

function done() {
  next_offset = next.offset();
  prev_offset = prev.offset();

  $('#done').prop('disabled', true);
  transition_stage = 0;
  $('#instructions').css({visibility: 'hidden'});

  next.animate({top: prev_offset.top - next_offset.top}, () => {
    prev.css({visibility: 'hidden'});
    next.animate({left: -1000 - next_offset.left}, () => {
      next.css({opacity: 0});
      next.offset(next_offset);

      switch (current_mode) {
        case Mode.phrase:
          let val = $('#next-phrase').val();
          socket.emit('phrase', val);
          break
        case Mode.drawing:
          socket.emit('phrase', canvas.toDataURL({format: 'png'}));
      }
    });
  });
}

let socket = io();
let canvas : fabric.Canvas;

$(() => {
  prev = $('#previous');
  next = $('#next');
  $('#done').click(done);
});

function waitmode() {
  $('#instructions').css({visibility: 'visible'});
  $('#previous-phrase').hide();
  $('#previous-drawing').hide();
  $('#next-drawing').hide();
  $('#next-phrase').hide();
  $('#done').prop('disabled', true);
}
function drawmode() {
  $('#instructions').css({visibility: 'visible'});
  $('#previous-text').show();
  $('#previous-drawing').hide();
  $('#next-drawing').show();
  if (canvas) {
    canvas.clear();
  } else {
    canvas = new fabric.Canvas('next-drawing-canvas', {
      isDrawingMode: true
    });
    canvas.setDimensions({width: 500, height: 300});
  }
  $('#next-phrase').hide();
  $('#done').prop('disabled', false);

  current_mode = Mode.drawing;
}
function phrasemode() {
  $('#instructions').css({visibility: 'visible'});
  $('#previous-text').hide();
  $('#previous-drawing').show();
  $('#next-drawing').hide();
  $('#next-phrase').show();
  $('#next-phrase').val('');
  $('#done').prop('disabled', false);

  current_mode = Mode.phrase;
}
function startmode() {
  phrasemode();
  $('#previous-drawing').hide();
}

socket.on('wait', () => { 
  waitmode();
  $('#instructions').text('Please wait for the rest of your party');
});
socket.on('wait1', () => { 
  waitmode();
  $('#instructions').text('Please wait for other players to finish the round');
});

socket.on('start', () => { 
  startmode();
  $('#instructions').text('Write a phrase here');

  next.animate({opacity: 1});
});

socket.on('phrase', (phrase : string) => {
  drawmode();
  $('#previous-text').text(phrase);
  $('#instructions').text('Draw that phrase below');

  prev.offset({left: 1000});
  prev.css({opacity: 1, visibility: 'visible'});
  prev.animate({left: 0}, () => {
    next.animate({opacity: 1});
  });
});

socket.on('drawing', (phrase : string) => {
  phrasemode();
  $('#previous-drawing').attr("src", phrase);
  $('#instructions').text('Describe that drawing below');

  prev.offset({left: 1000});
  prev.css({opacity: 1, visibility: 'visible'});
  prev.animate({left: 0}, () => {
    next.animate({opacity: 1});
  });
});

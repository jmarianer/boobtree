import * as $ from 'jquery';
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
      }
    });
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
  $('#instructions').text('Write a phrase here');
  $('#initial').show();
  $('#next-phrase').show();
  current_mode = Mode.phrase;

  prev.animate({opacity: 1});
  next.animate({opacity: 1});
});

socket.on('phrase', (phrase : string) => {
  prev.offset({left: 1000});
  prev.css({visibility: 'visible'});
  prev.children().hide();
  $('#previous-text').show();
  $('#previous-text').text(phrase);
  prev.animate({left: 0}, () => {
    next.animate({opacity: 1});
  });

  next.children().hide();
  $('#next-phrase').show();
  $('#next-phrase').val('');

  $('#instructions').css({visibility: 'visible'});
  $('#instructions').text('Draw that phrase below');

  $('#done').prop('disabled', false);
});

import * as $ from 'jquery';
import * as io from 'socket.io-client';

var
  prev : JQuery<HTMLElement>,
  next : JQuery<HTMLElement>,
  transition_stage : number,
  next_offset : JQuery.CoordinatesPartial,
  prev_offset : JQuery.CoordinatesPartial;

function done() {
  transition_stage = 0
  next_offset = next.offset()
  prev_offset = prev.offset()

  next.css('transition-property', 'all')
  next.offset(next_offset)
  next.offset(prev_offset)
}

function animend() {
  // console.log(transition_stage)
  switch(transition_stage) {
    case 0:
      prev.offset({left: window.innerWidth + 1000})
      next.offset({left: -1000})
      break
    case 1:
      next.css('transition-property', 'none')
      next.offset(next_offset)
      next.css('opacity', 0)
      setTimeout(animend, 500)
      break
    case 2:
      prev.css('transition-property', 'all')
      prev.offset(prev_offset)
      break
    case 3:
      next.css('transition-property', 'all')
      next.css('opacity', 1)
      next.offset(next_offset)
      break
    case 4:
      prev.css('transition-property', 'none')
      next.css('transition-property', 'none')
      break
  }
  transition_stage++
}

$(() => {
  prev = $('#previous')
  next = $('#next')
  prev.on('transitionend', animend)
  next.on('transitionend', animend)
  $('#done').click(done)
});

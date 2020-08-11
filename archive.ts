import * as $ from 'jquery';

$(() => {
  $('html').height('100vh');
  $('body').innerHeight($(window).height() * $('.archive > div').length);
  $('body > h1').css({position: 'fixed'})

  function setPos(elt: JQuery<HTMLElement>, position: number,
    startTop: number, endTop: number,
    startLeft: number, endLeft: number,
    startScale: number, endScale: number) {

    let scrollTop = $('body').scrollTop()
    elt.offset({
      top: startTop + position * (endTop - startTop) + scrollTop,
      left: startLeft + position * (endLeft - startLeft)
    });

    let scale = startScale + position * (endScale - startScale);
    elt.css({ transform: 'scale('+scale+','+scale+')' })
  }

  $(window).scroll(() => {
    let scroll = $('body').scrollTop()
    let frameSize = $(window).height();

    let frameNo = Math.floor(scroll / frameSize)
    let frameStart = frameNo * frameSize;
    let frameEnd = frameStart + frameSize;

    let framePos = (scroll - frameStart) / frameSize

    let height = $(window).height()
    let width = $(window).width()

    $('.archive > div').hide()

    let prev2 = $($('.archive > div')[frameNo - 1]).show()
    let prev = $($('.archive > div')[frameNo]).show()
    let cur = $($('.archive > div')[frameNo + 1]).show()

    let centerTop = (height - 300) / 2 ;//- $(cur.find('.card-content')[0]).position().top
    let centerLeft = (width - 500) / 2

    setPos(cur, framePos, height, centerTop, centerLeft, centerLeft, 1, 1)
    setPos(prev, framePos, centerTop, centerTop/4, centerLeft, centerLeft/4, 1, 0.5)
    setPos(prev2, framePos, centerTop/4, 0, centerLeft/4, 0, 0.5, 0)
  });

  $(window).scroll();
})


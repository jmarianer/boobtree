import * as $ from 'jquery';

$(() => {
  let frameSize = $(window).height() * 2;

  $(window).resize(() => {
    $('html').height('100vh');
    frameSize = $(window).height() * 2;
    $('body').innerHeight(frameSize * $('.archive > div').length);
    $('body > h1').css({position: 'fixed'})
    $(window).scroll();
  });

  $(window).keydown((e) => {
    var arrow = { left: 37, up: 38, right: 39, down: 40 };

    switch (e.which) {
      case arrow.up:
        $('body').scrollTop($('body').scrollTop() - frameSize)
        $(window).scroll();
        return false;
      case arrow.down:
        $('body').scrollTop($('body').scrollTop() + frameSize)
        $(window).scroll();
        return false;
    }
  });

  function setPos(elt: JQuery<HTMLElement>, position: number,
    startTop: number, endTop: number,
    startLeft: number, endLeft: number,
    startScale: number, endScale: number) {

    if (position > 0.5) {
      position = 1
    } else {
      position = position * 2;
    }

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

    let centerTop = (height - 300) / 2
    let centerLeft = (width - 500) / 2
    let centerLeftForHeaders = (width - 1100) / 2

    // 1. end, header, card (or very-first-header, card)
    // 2. header, card, card
    // 3. card, card, card (default case)
    // 4. card, card, end
    // 5. card, end, header
    if (prev.hasClass('chain-header')) { // 1
      prev2.hide()
      setPos(prev, framePos, centerTop, centerTop, centerLeftForHeaders, centerLeftForHeaders, 1, 1)
      setPos(cur, framePos, height, centerTop, centerLeft, centerLeft, 1, 1)
    } else if (prev2.hasClass('chain-header')) {  // 2
      prev2.hide()
      setPos(prev, framePos, centerTop, centerTop/4, centerLeft, centerLeft/4, 1, 0.5)
      setPos(cur, framePos, height, centerTop, centerLeft, centerLeft, 1, 1)
    } else if (cur.hasClass('start-and-end')) {  // 4
      setPos(prev2, framePos, centerTop/4, 0, centerLeft/4, 0, 0.5, 0)
      setPos(prev, framePos, centerTop, centerTop, centerLeft, centerLeft, 1, 1)
      setPos(cur, framePos, height, centerTop, centerLeftForHeaders, centerLeftForHeaders, 1, 1)
    } else if (prev.hasClass('start-and-end')) {  // 5
      prev2.hide()
      setPos(prev, framePos, centerTop, centerTop, centerLeftForHeaders, centerLeftForHeaders, 1, 1)
      setPos(cur, framePos, height, centerTop, centerLeftForHeaders, centerLeftForHeaders, 1, 1)
    } else {  // 3
      setPos(prev2, framePos, centerTop/4, 0, centerLeft/4, 0, 0.5, 0)
      setPos(prev, framePos, centerTop, centerTop/4, centerLeft, centerLeft/4, 1, 0.5)
      setPos(cur, framePos, height, centerTop, centerLeft, centerLeft, 1, 1)
    }
  });

  $(window).resize()
})


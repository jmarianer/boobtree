import * as $ from 'jquery';

$(() => {
  $('#join').click(() => {
    window.location.href = `/game/${$('#game').val()}/user/${$('#name').val()}`;
  });
});

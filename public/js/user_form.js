$(document).ready(function() {
  $('#user-res').click(function() {
    $('#user-form').show();
    $('.dialog-screen').show();
  });
  $('.dialog-screen').click(function() {
    $('#user-form').hide();
    $(this).hide();
  });
  $('.dialog-close').click(function() {
    $('#user-form').hide();
    $('.dialog-screen').hide();
  })
});

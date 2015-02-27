$(document).ready(function() {
  $('#user-res').click(function() {
    $('#user-form').show();
    $('.dialog-screen').show();
  });
  $('#user-error').click(function() {
    $('#user-form-error').show();
    $('.dialog-screen').show();
  });
  $('#user-info').click(function() {
    $('#user-form-info').show();
    $('.dialog-screen').show();
  });
  $('.dialog-screen').click(function() {
    $('#user-form').hide();
    $('#user-form-info').hide();
    $('#user-form-error').hide();
    $(this).hide();
  });
  $('.dialog-close').click(function() {
    $('#user-form').hide();
    $('#user-form-info').hide();
    $('#user-form-error').hide();
    $('.dialog-screen').hide();
  })
});

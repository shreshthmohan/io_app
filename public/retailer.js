$(function() {
  $('#change_address').click(function() {
    $('#address_field').after("<input type='text' name='address_field' value='"+ $('#address_field').text() + "'></input>");
    $('#address_field').detach();
    $('#change_address').detach();
  });
});

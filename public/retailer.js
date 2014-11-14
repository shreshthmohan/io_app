$(function() {
  $('#change_address').click(function() {
    $('#address_field').after("<input type='text' name='address_field' value='"+ $('#address_field').text() + "'></input>");
    $('#address_field').detach();
    $('#change_address').detach();
  });
});

$(function() {
  $('#change_website_url').click(function() {
    $('#website_url').after("<input type='text' name='website_url' value='"+ $('#website_url').attr("href") + "'></input>");
    $('#website_url').detach();
    $('#change_website_url').detach();
  });
});


// To enable editing of address field
$(function() {
  $('#change_address').click(function() {
    $('#address_field').after("<input type='text' name='address_field' value='"+ $('#address_field').text() + "'></input>");
    $('#address_field').detach();
    $('#change_address').detach();
  });
});

// To enable editing of website URL
$(function() {
  $('#change_website_url').click(function() {
    $('#website_url').after("<input type='text' name='website_url' value='"+ $('#website_url').attr("href") + "'></input>");
    $('#website_url').detach();
    $('#change_website_url').detach();
  });
});

// To enable editing of location URL
$(function() {
  $('#change_location_url').click(function() {
    $('#location_url').after("<input type='text' name='location_url' value='" + $('#location_url').attr("href") + "'></input>");
    $('#location_url').detach();
    $('#change_location_url').detach();
  });
});

// To enable editing of primary phone 
$(function() {
  $('#change_phone_primary').click(function() {
    $('#phone_primary').after("<input type='text' name='phone_primary' value='" + $('#phone_primary').text() + "'></input>");
    $('#phone_primary').detach();
    $('#change_phone_primary').detach();
  });
});

// To enable editing of secondary phone 
$(function() {
  $('#change_phone_secondary').click(function() {
    $('#phone_secondary').after("<input type='text' name='phone_secondary' value='" + $('#phone_secondary').text() + "'></input>");
    $('#phone_secondary').detach();
    $('#change_phone_secondary').detach();
  });
});

// To enable editing of tertiary phone 
$(function() {
  $('#change_phone_tertiary').click(function() {
    $('#phone_tertiary').after("<input type='text' name='phone_tertiary' value='" + $('#phone_tertiary').text() + "'></input>");
    $('#phone_tertiary').detach();
    $('#change_phone_tertiary').detach();
  });
});

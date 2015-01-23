// For individual city (city.jade)
$(function() {
  $('#change_city_name').click(function() {
    $('#city_name').after('<input type="text" name="new_city_name" value="'+ $('#city_name').text() + '"></input>');
    $('#city_name').detach();
    $('#change_city_name').detach();
  });
});

// For tag (tag.jade)
// Enable editing of tag name
$(function() {
  $('#change_tag_name').click(function() {
    $('#tag_name').after('<input type="text" name="new_tag_name" value="'+ $('#tag_name').text() + '"></input>');
    $('#tag_name').detach();
    $('#change_tag_name').detach();
  });
});

// For individual city (city.jade)
// For tag (tag.jade)
$(function() {
  $('#change_image_url').click(function() {
    $('#image_url').after('<input type="text" name="new_image_url" value="'+ $('#image_url').text() + '"></input>');
    $('#image_url').detach();
    $('#change_image_url').detach();
  });
});

// For individual group (group.jade)
// To enable editing of group URL
$(function() {
  $('#change_group_url').click(function() {
    $('#group_url').after("<input type='text' name='group_url' value='"+ $('#group_url').attr("href") + "'></input>");
    $('#group_url').detach();
    $('#change_group_url').detach();
  });
});

// For individual event (event.jade)
// To enable editing of Event URL
$(function() {
  $('#change_event_url').click(function() {
    $('#event_url').after("<input type='text' name='event_url' value='"+ $('#event_url').attr("href") + "'></input>");
    $('#event_url').detach();
    $('#change_event_url').detach();
  });
});

// For individual event (event.jade)
// To enable editing of Organiser name
$(function() {
  $('#change_organiser_name').click(function() {
    $('#organiser_name').after('<input type="text" name="organiser_name" value="' + $('#organiser_name').text() + '"></input>');
    $('#organiser_name').detach();
    $('#change_organiser_name').detach();
  });
});

// For individual event (event.jade)
// To enable editing of Organiser URL
$(function() {
  $('#change_organiser_url').click(function() {
    $('#organiser_url').after("<input type='text' name='organiser_url' value='"+ $('#organiser_url').attr("href") + "'></input>");
    $('#organiser_url').detach();
    $('#change_organiser_url').detach();
  });
});

// For individual event (event.jade)
// For individual retailer (retailer.jade)
// For individual school (school.jade)
// To enable editing of address field
$(function() {
  $('#change_address').click(function() {
    $('#address_field').after('<input type="text" name="address_field" value="'+ $('#address_field').text() + '"></input>');
    $('#address_field').detach();
    $('#change_address').detach();
  });
});

// For individual event (event.jade)
// For individual retailer (retailer.jade)
// For individual school (school.jade)
// To enable editing of location URL
$(function() {
  $('#change_location_url').click(function() {
    $('#location_url').after("<input type='text' name='location_url' value='" + $('#location_url').attr("href") + "'></input>");
    $('#location_url').detach();
    $('#change_location_url').detach();
  });
});

// For individual school (school.jade)
// For individual retailer (retailer.jade)
// For individual event (event.jade)
// To enable editing of square image URL
$(function() {
  $('#change_img_url_square').click(function() {
    $('#img_url_square').after("<input type='text' name='img_url_square' value='" + $('#img_url_square').attr("src") + "'></input>");
    $('#img_url_square').detach();
    $('#change_img_url_square').detach();
  });
});

// For individual event (event.jade)
// To enable editing of start date
$(function() {
  $('#change_start_date').click(function() {
    $('#start_date').after('(yyyy-mm-dd)<input type="text" name="start_date" value="' + $('#start_date').text() + '"></input>');
    $('#start_date').detach();
    $('#change_start_date').detach();
  });
});

// For individual event (event.jade)
// To enable editing of end date
$(function() {
  $('#change_end_date').click(function() {
    $('#end_date').after('(yyyy-mm-dd)<input type="text" name="end_date" value="' + $('#end_date').text() + '"></input>');
    $('#end_date').detach();
    $('#change_end_date').detach();
  });
});

// For individual retailer (retailer.jade)
// For individual event (event.jade)
// For individual school (school.jade)
// To enable editing of comments 
$(function() {
  $('#change_comments').click(function() {
    $('#comments').after('<input type="text" name="comments" value="' + $('#comments').text() + '"></input>');
    $('#comments').detach();
    $('#change_comments').detach();
  });
});
//TODO: Reminder about using " and '

// For individual retailer(retailer.jade)
// To enable editing of website URL
$(function() {
  $('#change_website_url').click(function() {
    $('#website_url').after("<input type='text' name='website_url' value='"+ $('#website_url').attr("href") + "'></input>");
    $('#website_url').detach();
    $('#change_website_url').detach();
  });
});

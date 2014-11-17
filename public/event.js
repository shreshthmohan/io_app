// To enable editing of Event URL
$(function() {
  $('#change_event_url').click(function() {
    $('#event_url').after("<input type='text' name='event_url' value='"+ $('#event_url').attr("href") + "'></input>");
    $('#event_url').detach();
    $('#change_event_url').detach();
  });
});

// To enable editing of Social Event URL
$(function() {
  $('#change_event_url_social').click(function() {
    $('#event_url_social').after("<input type='text' name='event_url_social' value='"+ $('#event_url_social').attr("href") + "'></input>");
    $('#event_url_social').detach();
    $('#change_event_url_social').detach();
  });
});

// To enable editing of Organiser name
$(function() {
  $('#change_organiser_name').click(function() {
    $('#organiser_name').after('<input type="text" name="organiser_name" value="' + $('#organiser_name').text() + '"></input>');
    $('#organiser_name').detach();
    $('#change_organiser_name').detach();
  });
});

// To enable editing of Organiser URL
$(function() {
  $('#change_organiser_url').click(function() {
    $('#organiser_url').after("<input type='text' name='organiser_url' value='"+ $('#organiser_url').attr("href") + "'></input>");
    $('#organiser_url').detach();
    $('#change_organiser_url').detach();
  });
});

// To enable editing of address field
$(function() {
  $('#change_address').click(function() {
    $('#address_field').after('<input type="text" name="address_field" value="'+ $('#address_field').text() + '"></input>');
    $('#address_field').detach();
    $('#change_address').detach();
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

// To enable editing of start date
$(function() {
  $('#change_start_date').click(function() {
    $('#start_date').after('(yyyy-mm-dd)<input type="text" name="start_date" value="' + $('#start_date').text() + '"></input>');
    $('#start_date').detach();
    $('#change_start_date').detach();
  });
});

// To enable editing of end date
$(function() {
  $('#change_end_date').click(function() {
    $('#end_date').after('(yyyy-mm-dd)<input type="text" name="end_date" value="' + $('#end_date').text() + '"></input>');
    $('#end_date').detach();
    $('#change_end_date').detach();
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

// To enable editing of event email
$(function() {
  $('#change_email').click(function() {
    $('#email').after("<input type='text' name='email' value='" + $('#email').text() + "'></input>");
    $('#email').detach();
    $('#change_email').detach();
  });
});

// To enable editing of comments 
$(function() {
  $('#change_comments').click(function() {
    $('#comments').after('<input type="text" name="comments" value="' + $('#comments').text() + '"></input>');
    $('#comments').detach();
    $('#change_comments').detach();
  });
});
//TODO: Reminder about using " and '

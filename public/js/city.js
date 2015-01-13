$(function() {
  $('#change_city_name').click(function() {
    $('#city_name').after('<input type="text" name="new_city_name" value="'+ $('#city_name').text() + '"></input>');
    $('#city_name').detach();
    $('#change_city_name').detach();
  });
});

$(function() {
  $('#change_image_url').click(function() {
    $('#image_url').after('<input type="text" name="new_image_url" value="'+ $('#image_url').text() + '"></input>');
    $('#image_url').detach();
    $('#change_image_url').detach();
  });
});

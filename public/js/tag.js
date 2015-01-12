$(function() {
  $('#change_tag_name').click(function() {
    $('#tag_name').after('<input type="text" name="new_tag_name" value="'+ $('#tag_name').text() + '"></input>');
    $('#tag_name').detach();
    $('#change_tag_name').detach();
  });
});

$(function() {
  $('#change_image_url').click(function() {
    $('#image_url').after('<input type="text" name="new_image_url" value="'+ $('#image_url').text() + '"></input>');
    $('#image_url').detach();
    $('#change_image_url').detach();
  });
});

$(document).ready(function() {
  $('input[type=radio][name=search]').change(function() {
    if (this.value == 'gear') {
      $('.gear').show();
    } else {
      $('.gear').hide();
    }
    if (this.value == 'events') {
      $('.events').show();
    } else {
      $('.events').hide();
    }
    if (this.value == 'groups') {
      $('.groups').show();
    } else {
      $('.groups').hide();
    }
    if (this.value == 'learn') {
      $('.learn').show();
    } else {
      $('.learn').hide();
    }
  });
});

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
  $('#event-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.events-explore').addClass("active").siblings().removeClass("active");
  })
  $('#gear-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.gear-explore').addClass("active").siblings().removeClass("active");
  })
  $('#learn-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.learn-explore').addClass("active").siblings().removeClass("active");
  })
  $('#group-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.group-explore').addClass("active").siblings().removeClass("active");
  })
});

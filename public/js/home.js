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

  $('input[type=radio][name=choose-event]').change(function() {
    if (this.value == 'activity') {
      $('.event-activity').show();
    } else {
      $('.event-activity').hide();
    }
    if (this.value == 'location') {
      $('.event-location').show();
    } else {
      $('.event-location').hide();
    }
  });

  $('input[type=radio][name=choose-gear]').change(function() {
    if (this.value == 'activity') {
      $('.gear-activity').show();
    } else {
      $('.gear-activity').hide();
    }
    if (this.value == 'location') {
      $('.gear-location').show();
    } else {
      $('.gear-location').hide();
    }
  });

  $('input[type=radio][name=choose-group]').change(function() {
    if (this.value == 'activity') {
      $('.group-activity').show();
    } else {
      $('.group-activity').hide();
    }
    if (this.value == 'location') {
      $('.group-location').show();
    } else {
      $('.group-location').hide();
    }
  });

  $('input[type=radio][name=choose-school]').change(function() {
    if (this.value == 'activity') {
      $('.school-activity').show();
    } else {
      $('.school-activity').hide();
    }
    if (this.value == 'location') {
      $('.school-location').show();
    } else {
      $('.school-location').hide();
    }
  });
});

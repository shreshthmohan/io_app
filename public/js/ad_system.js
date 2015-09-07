
$(document).ready(function(){
    $.ajax({
      url: "http://www.indiaoutside.org/api/get_ad",
      context: document.body
    })
    .done(function(data) {
      var data_parsed = JSON.parse(data)
      for(i= 0; i < data_parsed.length; i++) {
        $('#featured > .col-md-12')
        .append('<a id="ad' + i + '" target="_blank"><div class="category-el"><div class="info clearfix"><div class="info-text col-xs-12"><h2 class="sm uppercase bob absolute padding-tb-5 padding-lr-10"><span class="block fs-16 padding-b-5">' + data_parsed[i].title + '</span><span class="block fs-12 number">' + data_parsed[i].description + '</span></h2></div><div class="info-overlay"></div></div></div></a>')
        $('#featured > .col-md-12 > #ad' + i + ' > .category-el > .info')
        .css('background-image', 'url(' + data_parsed[i].image_url + ')')
        $('#ad' + i).attr("href", data_parsed[i].web_url)
      }
    })
    .fail(function(error) {
      alert(JSON.stringify(error))
    })
})



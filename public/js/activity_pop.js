$(document).ready(function(){
  $("a[id^='event-info-']").click(function(){
    var num = $(this).attr("id");
    var num_ex = num.split("-")[2];
    $("#details" + num_ex).show();
    $('.event-tab').addClass("active").siblings().removeClass("active")
    $(".events-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("a[id^='retailer-info-']").click(function(){
    var num = $(this).attr("id");
    var num_ex = num.split("-")[2];
    $("#details" + num_ex).show();
    $('.gear-tab').addClass("active").siblings().removeClass("active")
    $(".retailers-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("a[id^='group-info-']").click(function(){
    var num = $(this).attr("id");
    var num_ex = num.split("-")[2];
    $("#details" + num_ex).show();
    $('.group-tab').addClass("active").siblings().removeClass("active")
    $(".groups-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("a[id^='school-info-']").click(function(){
    var num = $(this).attr("id");
    var num_ex = num.split("-")[2];
    $("#details" + num_ex).show();
    $('.learn-tab').addClass("active").siblings().removeClass("active")
    $(".schools-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $(".dialog-screen").click(function(){
    $("div[id^='details']").hide();
    $(this).hide()
  });
  $(".dialog-close").click(function(){
    $("div[id^='details']").hide();
    $(".dialog-screen").hide()
  });

  // tab head, click to brighten/activate
  $('.event-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.events-info').addClass("active").siblings().removeClass("active");
  })
  $('.gear-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.retailers-info').addClass("active").siblings().removeClass("active");
  })
  $('.learn-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.schools-info').addClass("active").siblings().removeClass("active");
  })
  $('.group-tab').click(function() {
    $(this).addClass("active").siblings().removeClass("active")
    $('.groups-info').addClass("active").siblings().removeClass("active");
  })
});

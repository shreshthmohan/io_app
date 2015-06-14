$(document).ready(function(){
  $("a[id^='event-info-']").click(function(){
    var num = $(this).attr("id");
    var num_ex = num.split("-")[2];
    console.log(num);
    console.log(num_ex);
    $("#details" + num_ex).show();
    $(".events-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("#retailer-info-1").click(function(){
    $("#details1").show();
    $(".retailers-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("#group-info-1").click(function(){
    $("#details1").show();
    $(".groups-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $("#school-info-1").click(function(){
    $("#details1").show();
    $(".schools-info").addClass("active").siblings().removeClass("active");
    $(".dialog-screen").show()});
  $(".dialog-screen").click(function(){
    $("#details1").hide();
    $(this).hide()
  });
  $(".dialog-close").click(function(){
    $("#details1").hide();
    $(".dialog-screen").hide()
  });
});

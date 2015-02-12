$(function() {
  $( "#from" ).datepicker({
    dateFormat: "dd-mm-yy",
    minDate: 0,
    onClose: function(selectedDate) {
      $("#to").datepicker("option", "minDate", selectedDate); 
    }
  });
  $( "#to" ).datepicker({
    dateFormat: "dd-mm-yy",
    onClose: function(selectedDate) {
      $("#from").datepicker("option", "maxDate", selectedDate); 
    }
  });
});

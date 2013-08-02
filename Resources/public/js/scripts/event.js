
$(document).ready(function(){
  if( document.location.href == "http://v3.dev3.myskreen.typhon.net/app_dev.php/") {
    $('body').prepend('<a class="background">');
    $('body').append('</a>');
    $('body .background').attr("href","http://www.myskreen.com/film/comedies/4896210-mariage-a-l-anglaise/");
    $('#header').addClass('event');
    $('#view-home').addClass('event');
   
  }
});
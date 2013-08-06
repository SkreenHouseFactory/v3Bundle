
$(document).ready(function(){
  if( $('body').hasClass('home')) {
    $('.absolute').addClass('hide')
    $('body').prepend('<a class="background">');
    $('body').append('</a>');
    $('body .background').attr("href","http://www.myskreen.com/film/comedies/4896210-mariage-a-l-anglaise/");
    $('#header').addClass('event');
    $('#view-home').addClass('event');
  }
});
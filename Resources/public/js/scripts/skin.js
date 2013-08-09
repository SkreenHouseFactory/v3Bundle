$(document).ready(function(){
  Skin.initHome();
});


var Skin;
Skin = {
  initHome: function() {
    console.log('initSkinHome');
    if( $('body').hasClass('home skin')) {
      $('.absolute').addClass('hide');
      $('body').prepend('<a class="background">');
      $('body').append('</a>');
      $('body .background').attr("href","http://www.myskreen.com/film/comedies/4896210-mariage-a-l-anglaise/");
    }
  }
}
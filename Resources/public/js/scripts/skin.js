var Skin;

$(document).ready(function(){
  Skin.initHome();
});

Skin = {
  initHome: function() {
    console.log('initSkinHome');
    if( $('body').hasClass('skin home')) {
      $('.absolute').addClass('hide');
      $('body').prepend('<a class="background">');
      $('body').append('</a>');
      $('body .background').attr("href","http://www.myskreen.com/film/comedies/4896210-mariage-a-l-anglaise/");
    }
  }
}
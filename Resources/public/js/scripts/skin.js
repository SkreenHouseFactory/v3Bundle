$(document).ready(function(){
  Skin.initHome();
});


var Skin;
Skin = {
  initHome: function() {
    console.log('initSkinHome');
    if( $('body').hasClass('home') && $('body').hasClass('skin')) {
      $('.absolute').addClass('hide');
      $('body').prepend('<a class="background">');
      $('body').append('</a>');
      $('body .background').attr("href","http://www.myskreen.com//mariage-a-l-anglaise/");
      $('#carousel-a-la-une .item a').each(function(){
        var background_image=$(this).css('background-image');
        background_image = background_image.replace('/1500/', '/990/');
        console.log(background_image);
        $(this).css('background-image',background_image);
      });
    }
  }
}
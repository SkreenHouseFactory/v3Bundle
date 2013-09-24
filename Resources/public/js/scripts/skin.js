$(document).ready(function(){
  Skin.initHome();
  if (typeof Skinema != 'undefined') {
    Skinema.initHome();
  }
});


var Skin;
Skin = {
  initHome: function() {
    console.log('initSkinHome');
    if( ($('body').hasClass('home') || $('body').hasClass('home-cinema')) && $('body').hasClass('skin')) {
      $('.absolute').addClass('hide');
      $('#view-home').prepend('<a class="background"></a>');
      $('#view-home .background').attr("href","http://www.myskreen.com/les-conquerants/");
      $('#carousel-a-la-une .carousel-inner .item a , #carousel-selection-cinema .carousel-inner .item a').each(function(){
        var background_image = $(this).css('background-image');
        background_image = background_image.replace('/1500/', '/970/');
        console.log(background_image);
        $('.carousel-caption a:contains("Les conquérants")').parent().parent().addClass('hide');
        $(this).css('background-image',background_image);
      });
    }
  }
}

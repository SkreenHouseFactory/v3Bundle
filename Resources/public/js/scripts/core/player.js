// -- player
$(document).ready(function(){
  //affichage versions au hover
  $('.player').hover(function(){
      $('.player-meta.has-versions').fadeIn('slow');
    }, function(){
      $('.player-meta.has-versions').fadeOut();
  })
  // ui -- player : close player
  $('#couchmode-close, #couchmode-inner > *:not(#couchmode-player)').on('click', function(){
    Couchmode.unload();
  });
  // -- ui redirect autoload
  if ($('#redirect iframe').length > 0) {
    console.log('UI.loadRedirect()', $('#redirect iframe').length);
    UI.loadRedirect();
  }

});
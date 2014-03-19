// -- player
$(document).ready(function(){
  
  //affichage versions au hover
  $('.player').hover(function(){
      $('.player-meta.has-versions').fadeIn('slow');
    }, function(){
      $('.player-meta.has-versions').fadeOut();
  })
  // Stop player au lancement du direct - uniquement si data-autoplay est défini
  $('.player-stop').on('click', function(){
    console.log('scripts/core/player.js', 'player-stop');
    Player.stop();
  });
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
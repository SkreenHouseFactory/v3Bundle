/* TOUCH */
$(document).ready(function(){
  //alert('touch:' + $('html').hasClass('touch'));
  if ($('html').hasClass('touch')) {
    $('html.touch').on('touchstart', function(e){
        console.log('scripts/core/ui.js', 'touch trigger click');
        //alert('touch trigger click: ' + this.className);
       if (typeof $(this).attr('href') == 'undefined') {
          $(this).trigger('click');
       }
       Player.stop();
    });
    
    // Warning for iOS users
    if(!$.cookie('myskreen_alert_mobile')){
      UI.editSkModal('','Attention, mySkreen n\'est pas optimisé pour votre appareil, néanmoins vous pouvez continuer à naviguer et découvrir nos offres.','Continuer','',2,false);
      $('#skModal').css('top','40%');
      $('body').append('<div class="modal-backdrop in"></div>');
      $('#skModal').removeClass('hide');
    }
    $('#skModal .modal-footer button').on('click', function(){
      $('.modal-backdrop').remove();
      $('#skModal').addClass('hide');
      API.cookie('alert_mobile','true');
    });

   // Changement du fonctionnement des boutons du header pour les appareils iOS/touch
   $('.with-caret.tv-component').on('click',function(event) {
     if( !$(this).parent().hasClass('open')){
       $(this).siblings('.a-caret').trigger('click');
       event.preventDefault();
     }
     else{
       window.location = $(this).attr('href');
     }
   });
   $('.a-caret').on('click', function(){
     if(!$(this).parent().hasClass('open')){
       Player.stop();
     }
   });
    
  }
});

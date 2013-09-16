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

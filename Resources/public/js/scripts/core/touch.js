/* TOUCH */
$(document).ready(function(){
  //alert('touch:' + $('html').hasClass('touch'));
  if ($('html').hasClass('touch')) {
    /*
    $('html.touch').on('touchstart', function(e){
        console.log('scripts/core/ui.js', 'touch trigger click');
        //alert('touch trigger click: ' + this.className);
       if (typeof $(this).attr('href') == 'undefined') {
          $(this).trigger('click');
       }
       Player.stop();
    });
    */
    if ('matchMedia' in window) {
      if (window.matchMedia('(max-width:767px)').matches) {
        $('.bande_listes .btn.meslistes-plus').addClass('no-toggle-touch');
      }
    }
  }
});
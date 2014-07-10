// Sticky page selection
$(document).ready(function(){

  if ($('html').hasClass('no-touch')) {
      $('.view-selections #selection-related').stick_in_parent({offset_top: 70})
        .on('sticky_kit:bottom', function(e) {
          $('#selection-related').parent().attr('style', function(i, style) {
            return style.replace(/position[^;]+;?/g, '');
          });
          $('.view-selections #selection-related').css({
            position: 'absolute',
            bottom: '0px',
            top: 'auto'
          });
      });
      // on page selection, modify sticky behaviour depending on display of bande_couleur_degrade
      $(document).on('click', '[data-toggle-display]', function () {
        setTimeout(function(){
          $(document.body).trigger('sticky_kit:recalc');
        }, 500);
      });
  }

});
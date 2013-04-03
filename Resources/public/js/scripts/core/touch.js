/* TOUCH */
$(document).ready(function(){
  //alert('touch:' + $('html').hasClass('touch'));
  if ($('html').hasClass('touch')) {
    $('html.touch .tv-component').on('touchstart', function(e){
      console.log('scripts/core/ui.js', 'touch trigger click');
      //alert('touch trigger click: ' + this.className);
      e.preventDefault();

      $(this).trigger('click');
      return false;
    });
  }
});
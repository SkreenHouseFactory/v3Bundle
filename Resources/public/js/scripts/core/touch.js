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


    //load
    console.log('script', 'beead', 'load');
    $('body').append('<script type="text/javascript" src="http://as.ebz.io/api/choixPubJS.htm?pid=305331&screenLayer=1&mode=NONE&home=http://www.myskreen.com"></script>');
  }
});
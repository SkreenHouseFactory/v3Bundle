// var test_device = function(){
//   if ('matchMedia' in window) {
//     if (window.matchMedia('(min-width:450px)').matches) {
//       $('head meta[name="viewport"]').remove();
//     }
//   }
// }
// test_device();

/* TOUCH */
$(document).ready(function(){
  // auto focus on search box
  if ($('html').hasClass('touch')){

    //swipe Ipad
  	$('.carousel').hammer().on('swipeleft', function(){
  		$(this).carousel('next'); 
  	});
  	$('.carousel').hammer().on('swiperight', function(){
  		$(this).carousel('prev'); 
  	});
    // no tooltip on listing of tnt channels
    $('.chaines-listing .logo_chaine').removeAttr('data-toggle data-original-title');
    // handle no double-click on tv grid
    $(document).on('mouseover mousemove', '.channel-wrap .nav-list a.link[data-ajax]', function(){
      $(this).click();
    });
    //load beead
   /* console.log('scripts/touch.js', 'beead', 'load');
    $('body').append('<script type="text/javascript" src="http://as.ebz.io/api/choixPubJS.htm?pid=305331&screenLayer=1&mode=NONE&home=http://www.myskreen.com"></script>');*/
  }

});
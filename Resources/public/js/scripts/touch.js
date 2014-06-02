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
    $('.chaines-listing .logo_chaine').removeAttr('data-toggle data-original-title');
    
    //load beead
   /* console.log('scripts/touch.js', 'beead', 'load');
    $('body').append('<script type="text/javascript" src="http://as.ebz.io/api/choixPubJS.htm?pid=305331&screenLayer=1&mode=NONE&home=http://www.myskreen.com"></script>');*/
  }

});
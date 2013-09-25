/* TOUCH */
$(document).ready(function(){
  // auto focus on search box
  if (!$('html').hasClass('touch')){
  $('.search-query').trigger('focus');

  //swipe Ipad
	$('.carousel').hammer().on('swipeleft', function(){
		$(this).carousel('next'); 
	});
	$('.carousel').hammer().on('swiperight', function(){
		$(this).carousel('prev'); 
	});
}
      

});

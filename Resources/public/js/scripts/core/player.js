// -- player
$(document).ready(function(){
	//affichage versions au hover
	$('.player').hover(function(){
			$('.player-meta.has-versions').fadeIn('slow');
		}, function(){
			$('.player-meta.has-versions').fadeOut();
	})
	// ui -- player : close player
	$('#couchmode-close, #couchmode-inner > *:not(#couchmode-player)').live('click', function(){
	  Couchmode.unload();
	});
	// -- ui redirect autoload
	if ($('#redirect iframe').length > 0) {
	  console.log('UI.loadRedirect()', $('#redirect iframe').length);
	  UI.loadRedirect();
	}
	$('[data-redirect]').live('click', function(){
	    console.log('script', 'player redirect', $(this));
			if ($(this).data('redirect') == 'unload') {
		    UI.unloadRedirect();
			} else {
		    UI.loadRedirect($(this).data('redirect'));
			}
			return false;
	});

});
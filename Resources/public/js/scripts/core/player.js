// -- player
$(document).ready(function(){
	//affichage versions au hover
	$('.player').hover(function(){
			$('.player-meta.has-versions').fadeIn('slow');
		function(){
			$('.player-meta.has-versions').fadeOut();
	})
	// ui -- player : close player
	$('#couchmode-close, #couchmode-inner > *:not(#couchmode-player)').live('click', function(){
	  Couchmode.unload();
	});
	// -- play deporte
	$('[data-play]').live('click', function(){
	  console.log('script', 'data-play', $(this).data('play'), $(this).data('play-args'), Player.state);
	  if (Player.state == 'playing') {
	    console.log('script', 'data-play', 'Pause current player');
	    Player.pause();
	  }
	  API.play($(this).data('play'), $(this).data('play-args'));
	  return false;
	});
	// -- couchmode
	$('[data-couchmode]').live('click', function(){
	  if (Player.state == 'playing') {
	    console.log('script', 'data-play', 'Pause current player');
	    Player.pause();
	  }
	  var args = $.extend({session_uid: Skhf.session.uid}, $(this).data('couchmode'));
	  console.log('script', 'data-couchmode', $(this).data('couchmode'), args);
	  Couchmode.init(args);

	  //hack close player
	  if ($('#couchmode #couchmode-close').length == 0) {
	    $('#couchmode').prepend('<div id="couchmode-close"><i class="icon-remove icon-white"></i> Fermer</div>');
	  }
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

	// -- couchmode autoplay
	$('a[data-couchmode-autoplay="1"]').each(function(){
	  console.log('script', 'couchmode autoplay', $(this));
	  $(this).trigger('click');
	  return false;
	});

	// -- player autoload
	$('[data-play-autoload]').each(function(){
	  var trigger = $(this);
	  console.log('script', 'play autoload', trigger.data('play-autoload'), trigger);
	  Player.init(trigger, $(trigger.data('play-meta-elmt')));
	  Player.playOccurrence(trigger.data('play-autoload'), function(){
	    if (trigger.data('play-muted')) {
	      Player.mute();
	    }
	  }, trigger.data('play-args'));

	  $(this).data('play-loaded', 1);
	});
});
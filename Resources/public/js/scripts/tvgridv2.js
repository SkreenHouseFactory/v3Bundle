// -- tvgrid
$(document).ready(function(){
	if ($('#view-tvgrid').length) {
		API.context = 'v2';
		API.skXdmSocket =new easyXDM.Socket({
      remote: API.config.env == 'dev' ? 'http://beta.benoit.myskreen.typhon.net:40011/programme-tv/' : 'http://v2.myskreen.com/programme-tv/',
      container: 'grid',
      props: {
          frameborder: 'no',
          scrolling: 'no',
          width: '100%',
          height: '100%',
          allowTransparency: 'true'
      },
      lazy: false,
      onMessage: function(message, origin) {
	      message = JSON.parse(message);
	      console.log('API.syncV2', 'onMessage', message);
	      if (message[0] == 'preference') {
					//emule trigger
					var trigger = $('<a data-id="' + message[2] + '" class="fav fav-like" href="#"></a>');
					UI.togglePlaylist(trigger);

	      } else if (message[0] == 'redirect') {
	        window.open('/redirect?target=' + escape(message[1]));
	        //Player.redirect(message[1]);

	      }
	    }
	  });
	}
});
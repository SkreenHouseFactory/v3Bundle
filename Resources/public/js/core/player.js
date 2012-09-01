// -- Player
var Player;
Player = {
  elmt: null,
  timeout: null,
  timeoutdelay: 5000,
  type: 'flowplayer',
  is_playing: false,
  //player
  init: function(elmt) {
    this.elmt = elmt;
    this.elmt.empty();

    var idevice = /ip(hone|ad|od)/i.test(navigator.userAgent);
    var flashversion = flashembed.getVersion()[0];
    if (idevice || !flashversion) {
      this.type = 'html5';
    }

  },
  load: function(trigger) {
    var self = this;
    console.log('Player.load', trigger);

    var url      = trigger.attr('href');
    var embed    = trigger.data('player-embed');
    var title    = trigger.data('player-title');
    var subtitle = trigger.data('player-subtitle');
    var icon     = trigger.data('player-icon') ? '<img src="' + trigger.data('player-icon') + '"/> ' : '';
    var program  = trigger.data('player-program');

    this.elmt = $('#player');
    this.elmt.css('height', window.height)
    $('.title', this.elmt).html(icon + title);
    $('.subtitle', this.elmt).html(subtitle);
    if (program) {
      this.loadMetaProgram(program);
    }

    // -- embed
    if (embed) {
      this.play(embed);

      //overlay
      self.timeout = setTimeout(function(){
        $('.player-overlay').fadeOut('slow');
      }, self.timeoutdelay);
      $(window).mousemove(function(e) {
        if ($('.player-overlay').css('display') == 'none') {
          console.log('Player.load', 'mousemove');
          $('.player-overlay').show();
          self.timeout = setTimeout(function(){
            $('.player-overlay').fadeOut('slow');
          }, self.timeoutdelay);
        }
      });
      $('.player-overlay').show();

      //resize
      $(document).keyup(function(e) {
        if (e.keyCode == 27) { self.minify(); }
      });
      $('> i.icon-white', this.elmt).unbind().bind('click', function(){
        if ($(this).hasClass('icon-resize-full')) {
          $(this).removeClass('icon-resize-full').addClass('icon-resize-small');
          self.expand();
        } else {
          $(this).removeClass('icon-resize-small').addClass('icon-resize-full');
          self.minify();
        }
      });

      //insert playlist
      $('.player-playlist').prependTo(this.elmt);

    // -- redirect
    } else if (url) {
      this.remove();
      this.redirect(url);
    }

  },
  redirect: function(url) {
    var iframe = $('#redirect');
    if (typeof url != 'undefined') {
      iframe.html('<iframe src="' + url + '"></iframe>')
    }
    iframe.show().css('height', ($(window).height() - 100) + 'px');
    $('#top-nav').collapse('hide');
  },
  play: function(player, callback) {
    this.is_playing = true;

    switch(this.type) {

      /*
        http://flowplayer.org/documentation/api/player.html
        
        100	Plugin initialization failed
        200	Stream not found
        201	Unable to load stream or clip file
        202	Provider specified in clip is not loaded
        300	Player initialization failed
        301	Unable to load plugin
        302	Error when invoking plugin external method
        303	Failed to load resource such as stylesheet or background image
      */
      case 'html5':
      case 'flowplayer':

        var flashArgs = {
              "src": player.swf || "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf",
              "wmode":"opaque",
        	    "allowfullscreen":"true",
              "cachebusting": "false",
        	    "width": player.width || "100%",
        	    "height": player.height || "100%",
        	    "allowscriptaccess":"always"
        };

        flowArgs = player.config ? JSON.parse(player.config) : {"clip":{"url":player.url}};
        flowArgs.onMouseOver = function() {};
        flowArgs.onMouseOut = function() {};
        flowArgs.onBegin = function() {};
        flowArgs.onFinish = function() {
          if (typeof callback != 'undefined') {
            callback();
          }
        }
        flowArgs.onError = function(errorCode,errorMessage) {
          console.error('Player.flowplayer', player, errorCode, errorMessage);
        };

        if (this.type == 'html5') {
          console.warn('Player.flowplayer', 'iOs/noflash', player, flowArgs);
          Player.elmt.css('height', document.body.clientHeight);
          $f(this.elmt.attr('id'), flashArgs, flowArgs).ipad({simulateiDevice: true, controls: false});
        } else {
          console.warn('Player.flowplayer', 'flash:v' + flashversion, player, flowArgs);
          $f(this.elmt.attr('id'), flashArgs, flowArgs);
        }
      break;
      case 'flash':
        this.elmt.html(player);
      break;
      case 'android':
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'launch', player.url]);
        }
      break;
      case 'iframe':
        this.elmt.html('<iframe src="' + embed.url + '" frameborder="0"></iframe>');
      break;
    }
  },
  pause: function(player) {
    switch(this.type) {
      case 'android':
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'pause']);
        }
      break;
      case 'html5':
      case 'flowplayer':
        $f(this.elmt.attr('id')).pause();
      break;
    }
  },
  resume: function(player) {
    switch(this.type) {
      case 'android':
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'play']);
        }
      break;
      case 'html5':
      case 'flowplayer':
        $f(this.elmt.attr('id')).resume();
      break;
    }
  },
  stop: function(player) {
    switch(this.type) {
      case 'android':
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'stop']);
        }
      break;
      case 'html5':
      case 'flowplayer':
        $f(this.elmt.attr('id')).stop();
      break;
    }

    if (this.elmt.data('playing-id')) {
      this.elmt.data('playing-id', '');
    }
  },
  playProgram: function(id, callback) {
    var self = this;
    return API.query('GET',
                     'player/program/' + id + '.json',
                     {
                      player_width: '100%', 
                      player_height: '100%',
                      control: 'disabled',
                      player: this.type,
                      fullHD: true
                     },
                     function(media){
                      console.log('Player.playProgram', media.player);

                      if (!media.player || typeof media.player == 'undefined') {
                        return false;
                      }
                      self.play(media.player, callback);
                      self.elmt.data('playing-id', id);

                      return true;
                     }, 
                     true);
  },
  loadMetaProgram: function(p) {
    var el = $('.actions', this.elmt);
    el.data('id', p.id);
    el.data('title', 'Ajout à vos playlists<br/><small>' + p.title + ', ' + p.format + ' - ' + p.year + '</small>');
    el.html('<b>' + p.title + '</b></span><br/><a class="btn btn-large fav">Suivre / voir plus tard</a><span>');
  },
  minify: function() {
    $('#header, #top-nav').collapse('show');
    $('#top-playlist').collapse('hide');
  },
  expand: function() {
    $('#header, #top-nav, #top-playlist').collapse('hide');
  },
  remove: function() {
    this.timeout = null;
    $('#player .title, #player .subtitle, #player .embed').empty();
    $('#player').removeClass('on');
    $('#header').collapse('show');
    $('#redirect').empty().collapse('hide');
  },
  setType: function(type) {
    this.type = type;
  }
}
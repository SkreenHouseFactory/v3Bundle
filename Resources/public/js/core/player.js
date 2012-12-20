// -- Player
var Player;
Player = {
  elmt: null,
  timeout: null,
  timeoutdelay: 5000,
  type: 'flowplayer',
  state: 'stopped',
  elmt_meta: '<div id="player-meta" class="actions couchmode-overlay"></div>',
  //player
  init: function(elmt) {
    this.elmt = elmt;
    this.reset();

    var flashversion = flashembed.getVersion()[0];
    if (UI.ios || !flashversion) {
      //this.type = 'html5';
    }

    return this;
  },
  reset: function() {
    $(this.elmt_meta).remove();
    $(this.elmt_meta).insertBefore(this.elmt);
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
      if (url.match(/\/redirection\//)) {
        document.location = url;
      } else {
        iframe.html('<iframe src="' + url + '"></iframe>');
      }
    }
    iframe.show().css('height', ($(window).height() - 100) + 'px');
    //$('#top-nav').collapse('hide');
  },
  play: function(player, callback) {
    console.log('Player.play', player, this.type, callback);
    this.state = 'playing';
    if (typeof player.format != 'undefined') {
      this.type = player.format;
    }

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

        //non compatible
        if (player.format == 'flash') {
          this.type = 'flash';
          this.elmt.html(player.embed);
          return;
        }

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
          UI.error('Erreur de lecture !');
          if (typeof callback != 'undefined') {
            callback();
          }
          //console.error('Player.flowplayer', player, errorCode, errorMessage);
        };

        if (this.type == 'html5') {
          console.warn(['Player.flowplayer', 'iOs/noflash', player.url]);
          Player.elmt.css('height', document.body.clientHeight/2);
          $f(this.elmt.attr('id'), flashArgs, flowArgs).ipad({simulateiDevice: true, 
                                                              controls: false, 
                                                              ipadUrl: player.url, 
                                                              validExtensions: null});
          /*this.elmt.html('<video width="' + flashArgs.width + '" height="' + flashArgs.height + '" tabindex="0" x-webkit-airplay="allow" controls="false" autoplay="true" id="PlayerHtml5">' + 
                         '<source type="video/mp4" src="' + player.url + '"></source>' +
                         '</video>');
          this.elmt.find('video:first').play();*/
          console.warn(['Player.flowplayer', 'html', Player.elmt.html()]);
          
        } else {
          console.warn(['Player.flowplayer', 'flash', flowArgs, flowArgs]);
          $f(this.elmt.attr('id'), flashArgs, flowArgs);
        }
      break;
      case 'flash':
        this.elmt.html(player.embed != 'undefined' ? player.embed : player);
      break;
      case 'android':
        if (typeof Webview != 'undefined') {
          //player.url = 'http://www.pocketjourney.com/downloads/pj/video/famous.3gp';
          //player.url = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov';
          //player.url = 'rtsp://a2047.v1411b.c1411.g.vq.akamaistream.net/5/2047/1411/1_h264_650/1a1a1ae454c430950065de4cbb2f94c226950c7ae655b61a48a91475e243acda3dac194879adde0f/080690210abcn_2a_650.mov';
          Webview.postMessage(['player', 'launch', player.url]);
        }
      break;
      case 'iframe':
        this.elmt.html('<iframe src="' + embed.url + '" frameborder="0"></iframe>');
      break;
    }
  },
  pause: function() {
    this.state = 'paused';
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
  resume: function() {
    this.state = 'playing';
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
  stop: function() {
    this.state = 'stopped';
    switch(this.type) {
      case 'android':
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'stop']);
        }
      break;
      case 'html5':
      case 'flowplayer':
        if (this.elmt != null) {
          if (player = $f(this.elmt.attr('id'))) {
            player.stop();
          }
        }
      break;
    }

    if (this.elmt != null) {
      if (this.elmt.data('playing-id')) {
        this.elmt.data('playing-id', '');
      }
      this.reset();
    }
  },
  playProgram: function(id, callback, args) {
    var self = this;
    var args = $.extend(true,
                        {
                          player_width: '100%', 
                          player_height: '100%',
                          control: 'disabled',
                          player: this.type,
                          fullHD: true
                        }, 
                        typeof args != 'undefined' ? args : {});
    API.query('GET',
              'player/program/' + id + '.json',
              args,
              function(media){
                console.log('Player.playProgram', media.player, args);

                if (!media.player || typeof media.player == 'undefined') {
                  //TODO handle errors
                  callback('unvailable');
                  //UI.error('Oups : vidéo indisponible !');
                  return false;
                }
                self.play(media.player, callback);
                self.elmt.data('playing-id', id);
  
                return true;
              }, 
              true);
  },
  loadMetaProgram: function(p) {
    var el = $('#player-meta');
    console.log('Player.loadMetaProgram', this.elmt, el, p);
    el.data('id', p.id);
    el.data('title', 'Ajout à vos playlists<br/><small>' + p.title + ', ' + p.format + ' - ' + p.year + '</small>');
    el.html('<h4>' + p.title + '<br/><small>' + p.format + ' - ' + p.year + '</small></h4>');//<br/><a class="btn btn-large fav">Suivre / voir plus tard</a><span>');
  },
  minify: function() {
    $('#header').collapse('show');
    $('#top-playlist').collapse('hide');
  },
  expand: function() {
    $('#header, #top-playlist').collapse('hide');
  },
  remove: function() {
    this.timeout = null;
    $('#player .title, #player .subtitle, #player .embed').empty();
    $('#player').removeClass('on');
    $('#header').collapse('show');
    $('#redirect').empty().collapse('hide');
  },
  setType: function(type) {
    console.warn(['Player.setType', type]);
    this.type = type;
  }
}
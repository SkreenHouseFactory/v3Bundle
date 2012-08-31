// -- Player
var Player;
Player = {
  elmt: null,
  timeout: null,
  timeoutdelay: 5000,
  type: 'flash',
  is_playing: false,
  //player
  init: function(elmt) {
    this.elmt = elmt;
    this.elmt.empty();
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
  play: function(player) {
    this.is_playing = true;

    switch(this.type) {
      case 'flash':
        this.elmt.html(player);
      break;
      case 'android':
        //Webview.postMessage(['player', 'launch', 'rtsp://v5.cache1.c.youtube.com/CjYLENy73wIaLQnhycnrJQ8qmRMYESARFEIJbXYtZ29vZ2xlSARSBXdhdGNoYPj_hYjnq6uUTQw=/0/0/0/video.3gp']);
        //Webview.postMessage(['player', 'launch', 'http://benoit.myskreen.typhon.net/48316914.mp4']);
        if (typeof Webview != 'undefined') {
          Webview.postMessage(['player', 'launch', player.url]);
        }
      break;
      case 'html5':
        this.elmt.html('loading embed html5 ...' + embed.url);
      break;
      case 'iframe':
        this.elmt.html('<iframe src="' + embed.url + '" frameborder="0"></iframe>');
      break;
    }
  },
  pause: function(player) {
    if (this.type == 'android' && typeof Webview != 'undefined') {
      Webview.postMessage(['player', 'pause']);
    }
  },
  resume: function(player) {
    if (this.type == 'android' && typeof Webview != 'undefined') {
      Webview.postMessage(['player', 'play']);
    }
  },
  stop: function(player) {
    this.is_playing = false;
    if (this.type == 'android' && typeof Webview != 'undefined') {
      Webview.postMessage(['player', 'stop']);
    }

    if (this.elmt.data('playing-id')) {
      this.elmt.data('playing-id', '');
    }
  },
  playProgram: function(id) {
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
                      self.play(media.player);
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
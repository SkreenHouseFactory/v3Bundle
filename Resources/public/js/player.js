// -- Player
var Player;
Player = {
  player: null,
  timeout: null,
  timeoutdelay: 5000,
  //player
  load: function(trigger) {
    var self = this;
    console.log('Player.load', trigger);

    var url      = trigger.attr('href');
    var embed    = trigger.data('player-embed');
    var title    = trigger.data('player-title');
    var subtitle = trigger.data('player-subtitle');
    var icon     = trigger.data('player-icon') ? '<img src="' + trigger.data('player-icon') + '"/> ' : '';
    var program  = trigger.data('player-program');

    this.player = $('#player');
    this.player.css('height', window.height)
    $('.title', this.player).html(icon + title);
    $('.subtitle', this.player).html(subtitle);
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
      $('> i.icon-white', this.player).unbind().bind('click', function(){
        if ($(this).hasClass('icon-resize-full')) {
          $(this).removeClass('icon-resize-full').addClass('icon-resize-small');
          self.expand();
        } else {
          $(this).removeClass('icon-resize-small').addClass('icon-resize-full');
          self.minify();
        }
      });

      //insert playlist
      $('.player-playlist').prependTo(this.player);

    // -- redirect
    } else if (url) {
      this.remove();
      this.redirect(url);
    }

  },
  redirect: function(url) {
    var iframe = $('#redirect');
    if (typeof url != "undefined") {
      iframe.append('<iframe src="' + url + '"></iframe>')
    }
    iframe.show().css('height', ($(window).height() - 100) + 'px');
    $('#top-playlist, #top-nav').collapse('hide');
  },
  play: function(embed) {
    $('.embed', this.player).html(embed);
    $('#player').addClass('on');
    $('#header').collapse('hide');
    //UI.appendLoader(this.player);

    switch(embed.type) {
      case 'html5':
        this.player.html('loading embed html5 ...'+embed.url);
      break;
      case 'swf':
        this.player.html('loading embed swf …'+embed.url);
      break;
      case 'iframe':
        this.player.html('<iframe src="'+embed.url+'" frameborder="0"></iframe>');
      break;
    }
  },
  loadMetaProgram: function(p) {
    var el = $('.actions', this.player);
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
  }
}
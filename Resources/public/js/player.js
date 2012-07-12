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
    this.player = $('#player');

    var url      = trigger.attr('href');
    var embed    = trigger.data('player-embed');
    var title    = trigger.data('player-title');
    var subtitle = trigger.data('player-subtitle');
    var icon     = trigger.data('player-icon') ? '<img src="' + trigger.data('player-icon') + '"/> ' : '';
    $('.title', this.player).html(icon + title);
    $('.subtitle', this.player).html(subtitle);

    if (embed) { //embed
      this.play(embed);
      $(document).keyup(function(e) {
        if (e.keyCode == 27) { self.minify(); }
      });
      self.timeout = setTimeout(function(){
        $('.player-overlay').fadeOut('slow');
      }, self.timeoutdelay);
      $('#player').mousemove(function(e) {
        $('.player-overlay').fadeIn();
        self.timeout = setTimeout(function(){
          $('.player-overlay').fadeOut('slow');
        }, self.timeoutdelay);
      });
      
    } else if (url) { //player
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
  minify: function() {
    $('#header').collapse('show');
    $('#top-playlist').collapse('hide');
  },
  remove: function() {
    this.timeout = null;
    $('#player .title, #player .subtitle, #player .embed').empty();
    $('#player').removeClass('on');
    $('#header').collapse('show');
  }
}
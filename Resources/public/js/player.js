// -- Player
var Player;
Player = {
  player: null,
  redirect: null,
  //player
  load: function(trigger) {
    console.log('Player.load', trigger);
    var url     = trigger.attr('href');
    var embed   = trigger.data('embed');
    if (embed) {
      this.play(embed);
    } else if (url) {
      this.redirect(url);
    }

    console.log('Player.load', 'collapse');
  },
  redirect: function(url) {
    this.redirect = $('#top-redirect');
    this.redirect.empty();
    UI.appendLoader(this.redirect);
    $('#top-playlist').collapse('hide');
    this.redirect.slideDown();

    this.redirect.html('<iframe src="'+url+'" frameborder="0"></iframe>');
  },
  play: function(embed) {
    this.player = $('#top-player');
    this.player.empty();
    UI.appendLoader(this.player);
    this.player.slideDown();

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
  }
}
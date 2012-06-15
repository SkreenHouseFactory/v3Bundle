// -- Session
var Session;
Session = {
  uid: null,
  datas: null,
  context: 'v3',
  skXdmSocket: null,
  playlist: null,
  playlist_item_width: null,
  init: function(callback) {

    this.uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_uid');
    this.syncSession(callback);
    this.playlist = $('ul#playlist');

    //v2
    if (window.parent != window) {
      this.syncV2();
    }

  },
  syncV2: function() {
    var self = this;

    this.context = 'v2';
    this.skXdmSocket = new easyXDM.Socket({
      onMessage:function(message, origin) {
        message = JSON.parse(message);
        console.log('msg v2', message);
        if (message[0] == "sessionData") {
          self.signin(message[1]);

        } else if (message[0] == "history.back") {
          if (message[1] == "add") {
            $('#history-back').show(); //UI.addHistoryBack();
          } else {
            $('#history-back').hide(); //UI.removeHistoryBack();
          }
        }
      }
    });
    this.postMessage(["sync"]);

    //height header
    $('a[data-target="#top-playlist"]').click(function (e) {
      self.postMessage(["header", $('#top-playlist').hasClass('in') ? "remove_playlist": "add_playlist"]);
    });
  },
  postMessage: function(message) {
    this.skXdmSocket.postMessage(JSON.stringify(message));
  },
  syncSession: function(callback, args) {
    var self = this;
    console.warn("syncSession", this.uid);

    if (this.uid != null) {
      if( !args ) {
        var args = { with_selector:1, short:1, img_width: 150, img_height: 200 };
      }

      API.query("GET", "session/" + this.uid + ".json", args, function(sessionData) {
        if (typeof sessionData != "object") {
          console.error('!! Error by getting session object. Session restart...', sessionData);

          //Erase cookie
          if( typeof window != 'undefined' ) {
            $.cookie('myskreen_uid', null);
            self.uid = null;
          }
        }

        if (callback) {
          callback(sessionData);
        }
      });
    }
  },
  signin: function(sessionData) {
    if (sessionData.email) {
      console.log('Session.signin', sessionData);
      this.loadUser(sessionData.email);
      this.datas = sessionData;
      this.initPlaylist(top.location);
    }
  },
  signout: function() {
    this.unloadUser();
  },
  loadSelector: function() {
    var groups = Session.datas.queue_selector;
    for (key in groups) {
      var group = groups[key];
      var li = $('li#' + key, this.playlist);

      li.removeClass('empty');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.css('background', 'url('+group.img+') no-repeat');
      li.find('.badge').removeClass('opacity').addClass('badge-info').html(group.count);
      li.find('a').remove();
    }
  },
  loadPlaylist: function(id, access){
    this.playlist_item_width = $('ul#playlist li').css('width');
    console.log('original_width', this.playlist_item_width);
    var name = $('li#'+id, this.playlist).data('name');
    $.get(this.playlist.data('load-url').replace('session.uid', this.uid).replace('group.name', id), 
          {}, 
          function(programs){
            $('li:not(.selector, #item)', Session.playlist).remove(); 
            for (key in programs) {
              var program = programs[key];
              var item = $('<div>').append($('#playlist li#item').clone().attr('id','').addClass('to_animate')).html();
              var title = program.format != 'Film' ? program.title : '';
              Session.playlist.append(item.replace('%title%',title).replace('%img%',program.picture).replace('%url%',program.seo_url));
            }
            $('li.selector', Session.playlist).animate({width:0}, 500, function() {
              $(this).hide();
              $('li.to_animate', Session.playlist).animate({width:Session.playlist_item_width}, 500);
            });
            $('#selector-back').show().find('a:last').html(name);
            UI.loadSlider($('#top-playlist .slider'));
          },
          'json');
  },
  unloadPlaylist: function() {
    $(this).parent().hide();
    $('li:not(.selector, #item)', this.playlist).animate({width:0}, 500, function() {
      $(this).hide();
      $('li.selector', Session.playlist).show().animate({width:Session.playlist_item_width}, 500);
      UI.unloadSlider($('#top-playlist .slider'));
    });
  },
  initPlaylist: function(url) {
    switch (url) { 
    //load vod 
    case '/selection-...': 
      this.loadPlaylist('vod', 'films');
    break; 
    //load replay
    case '':  
      this.loadPlaylist('replay', 'emissions');
    break; 
    //load tv 
    case '/programme-tv':
      this.loadPlaylist('tv');
    break; 
    //load cinema 
    case '/selection-...': 
      this.loadPlaylist('cine');
    break; 
    //load selector
    default: 
      this.loadSelector();
    break; 
    }
  },
  loadUser: function(email) {
      $('#signin').hide();
      $('#signed-in span').html(email);
      $('#signed-in').fadeIn();
  },
  unloadUser: function() {
      $('#signed-in span').empty();
      $('#signed-in').hide();
      $('#signin').fadeIn();
  }
}
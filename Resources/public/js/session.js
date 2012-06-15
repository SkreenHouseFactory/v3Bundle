// -- Session
var Session;
Session = {
  uid: null,
  datas: null,
  context: 'v3',
  skXdmSocket: null,
  init: function(callback) {

    this.uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_uid');
    this.syncSession(callback);
    
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
    var playlist = $('#playlist');
    var groups = Session.datas.queue_selector;
    for (key in groups) {
      var group = groups[key];
      var li = $('li#' + key, playlist);

      li.removeClass('empty');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.css('background', 'url('+group.img+') no-repeat');
      li.find('.badge').removeClass('opacity').addClass('badge-info').html(group.count);
      li.find('a').remove();
    }
  },
  loadPlaylist: function(id, access){
    var playlist = $('ul#playlist');
    var name = $('li#'+id, playlist).data('name');
    $.get(playlist.data('load-url').replace('session.uid', this.uid).replace('group.name', id), 
          {}, 
          function(programs){
            $('li:not(.selector, #item)', playlist).remove(); 
            for (key in programs) {
              var program = programs[key];
              var item = $('<div>').append($('#playlist li#item').clone().attr('id','').addClass('to_animate')).html();
    
              playlist.append(item.replace('%title%',program.title).replace('%img%',program.picture).replace('%url%',program.seo_url));
            }
            $('li.selector', playlist).animate({width:0}, 500, function() {
              $(this).hide();
              $('li.to_animate', playlist).animate({width:original_width}, 500);
            });
            $('#selector-back').show().find('a:last').html(name);
            UI.loadSlider($('#top-playlist .slider'));
          },
          'json');
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
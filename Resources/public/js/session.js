// -- Session
var Session;
Session = {
  uid: null,
  datas: {},
  context: 'v3',
  skXdmSocket: null,
  playlist: null,
  init: function(callback) {

    this.uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_uid');
    this.syncSession(callback);
    this.playlist = $('#playlist');

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
        var args = { with_notifications:1, with_selector:1, short:1 };
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
    this.unloadSelector();
    this.unloadPlaylist();
  },
  notify: function(notifications) {
    console.log('Session.notify', notifications);
    for (key in notifications) {
      if (notifications[key].new > 0) {
        if (key == 'programs') {
          $('.subnav-toggle ul li:first a').prepend('<span class="badge badge-info">'+notifications[key].new+'</span>');
        } else {
          $('#nav-toggle .badge-'+key+' a').prepend('<span class="badge badge-info">'+notifications[key].new+'</span>');
        }
      }
    }
  },
  loadSelector: function() {
    var groups = Session.datas.queue_selector;
    for (key in groups) {
      var group = groups[key];
      var li = $('li#' + key, this.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+group.img+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity').addClass('label-inverse').find('span').html(group.count);
      li.find('a').hide();
    }
  },
  unloadSelector: function() {
    var lis = $('li.selector', this.playlist);
    lis.addClass('empty').css('background', 'none');
    lis.find('.label').addClass('opacity').removeClass('label-inverse').find('span').html('?');
    lis.find('a').show();
  },
  loadPlaylist: function(id, access){
    var name = $('li#'+id, this.playlist).data('name');
    Slider.load(this.playlist, 
                this.playlist.data('pager-url').replace('session.uid', this.uid).replace('group.name', id).replace('app_dev.php/', ''),
                function(){
                  $('#selector-back').show().find('a:last').html(name);
                  $('li.selector', Session.playlist).animate({width:0}, 500, function() {
                    $(this).hide();
                  });
                });
  },
  unloadPlaylist: function() {
    $('li:not(.selector, #item)', this.playlist).animate({width:0}, 500, function() {
      $(this).hide();
      $('li.selector', Session.playlist).show().animate({width:Slider.item_width}, 500);
      Slider.remove(Session.playlist);
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
// -- Session
var Session;
Session = {
  uid: null,
  datas: {},
  playlist: null,
  onglet: null,
  init: function(callback) {

    this.uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_uid');
    this.syncSession(callback);
    this.playlist = $('#playlist');

    //v2
    if (window.parent != window) {
      API.syncV2();
    }
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
          $('.subnav-toggle ul li:first a').prepend(UI.badge_notification.replace('%count%', notifications[key].new));
        } else {
          $('#nav-toggle .badge-'+key+' a').prepend(UI.badge_notification.replace('%count%', notifications[key].new));
        }
      }
    }
  },
  loadSelector: function(onglet) {
    console.log('Session.loadSelector', this.onglet, onglet);
    var self = this;
    
    //gestions des différents formats
    if (this.onglet != onglet) {
      this.onglet = onglet;
      if (this.onglet && this.onglet != "undefined") {
        API.query('GET', 
                  'www/slider/selector/' + this.uid + '.json', 
                  {onglet: this.onglet, with_count_favoris: true}, 
                  function(queue_selector) {
                    console.log('Session.loadSelector', 'reload', queue_selector);
                    self.unloadSelector();
                    self.updateSelector(queue_selector);
                  });
      } else {
      this.unloadSelector();
        this.updateSelector(this.playlist.data('selector'));
      }
    } else {
      this.unloadSelector();
      this.updateSelector(Session.datas.queue_selector);
    }
  },
  updateSelector: function(datas) {
    for (key in datas) {
      var group = datas[key];
      console.log('Session.updateSelector', key, group);
      var li = $('li#' + key, this.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+group.img+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.find('span.badge').remove();
      if (key == 'all') {
        li.find('.label span').html(group.count);
      } else {
        if (group.nb_notifs > 0){
          li.prepend(UI.badge_notification.replace('%count%', group.nb_notifs));
        }
      }
      li.find('a').hide();
    }
    this.playlist.data('queue_selector', datas);
  },
  unloadSelector: function() {
    var lis = $('li.selector', this.playlist);
    lis.addClass('empty').css('background', 'none');
    lis.find('.label').addClass('opacity').removeClass('label-inverse');
    lis.find('span.badge').remove();
    lis.prepend($(UI.badge_notification.replace('%count%', '0')).removeClass('badge-info'));
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
    console.log('Session.initPlaylist', url);
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
    //load selector onglet
    case '/films': 
    case '/documentaires': 
    case '/series': 
    case '/emissions': 
    case '/spectacles': 
      this.loadSelector(url.replace('/', ''));
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
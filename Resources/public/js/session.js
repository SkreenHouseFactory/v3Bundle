// -- Session
var Session;
Session = {
  uid: '',
  datas: {},
  playlist: null,
  onglet: null,
  access: null,
  init: function(callback) {
    this.playlist = $('#playlist');

    //session
    this.uid = $.cookie('myskreen_uid');
    this.sync(callback);
  },
  sync: function(callback, args) {
    var self = this;
    console.warn('Session.sync', this.uid, 'cookie:'+$.cookie('myskreen_uid'));

    if (this.uid) {
      $.extend(args, { with_notifications:1, with_selector:1, short:1 });
      API.query("GET", "session/" + this.uid + ".json", args, function(sessionData) {
        Session.signin(sessionData);

        if (callback) {
          callback(sessionData);
        }
      });
    } else {
      $.extend(args, { short:1 });
      API.query("POST", "session.json", args, function(sessionData) {
        Session.signin(sessionData);

        if (callback) {
          callback(sessionData);
        }
      });
    }
  },
  signin: function(sessionData) {
    console.log('Session.signin', sessionData);
    this.datas = sessionData;
    this.uid = this.datas.uid;
    if (sessionData.email) {

      UI.loadUser();
      Session.notify(this.datas.notifications);
      Session.initPlaylist(top.location.pathname);
    }
    $.cookie('myskreen_uid', this.uid);
  },
  signout: function() {
    this.datas = '';
    this.uid = '';
    UI.loadUser();
    UI.unloadSelector();
    UI.unloadPlaylist();
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
  loadSocial: function(onglet, offset) {
    if (Session.datas.fb_uid) {
      var offset = offset != 'undefined' ? offset : 0;
      var cookie_name = 'myskreen_social_'+onglet+'_'+offset;
      var cookie = $.cookie(cookie_name);
      if (cookie) {
        var json = JSON.parse(cookie);
        UI.loadFriends(json);
        Session.datas.friends = json.friends;
      } else {
        UI.appendLoader($('li#friends'));
        API.query('GET', 
                  'www/slider/social/' + this.uid + '.json', 
                  {onglet: this.onglet, nb_results: 1}, 
                  function(json) {
                    console.log('Session.loadSocial', 'offset:'+offset, json);
                    $.cookie(cookie_name, JSON.stringify(json), { expires: 1 });
                    Session.datas.friends = json.friends;
                    UI.removeLoader($('li#friends'));
                    UI.loadFriends(json);
                  });
      }
    }
  },
  loadSelector: function(onglet, reload) {
    console.log('Session.loadSelector', this.onglet, onglet, 'reload:'+reload);
    var self = this;

    //already loaded
    //if (this.onglet == onglet) {
    //  console.log('Session.loadSelector', 'already loaded');
    //  return;
    //}

    //chargement initial avec data dans session
    if (this.onglet == null && onglet == 'undefined') {
      console.log('Session.loadSelector', 'this.datas.queue_selector', this.datas.queue_selector);
      UI.loadSelector(this.datas.queue_selector);

    //requete
    } else if (typeof reload == 'undefined') {
      console.log('Session.loadSelector', 'remote', 'www/slider/selector/' + this.uid + '.json');
      this.onglet = onglet;
      API.query('GET', 
                'www/slider/selector/' + this.uid + '.json', 
                {onglet: this.onglet, with_count_favoris: true}, 
                function(json) {
                  console.log('Session.loadSelector', 'reload', json);
                  UI.loadSelector(json, true);
                });

      console.log('Session.loadSelector', 'loadSocial');
      this.loadSocial();
    }
  },
  loadPlaylist: function(access){
    this.access = access;
    var name = $('li#'+this.access, this.playlist).data('name');
    var url = this.playlist.data('pager-url').replace('session.uid', this.uid)
                                             .replace('group.name', this.access)
                                             .replace('app_dev.php/', '');
    url = this.onglet ? url + '?onglet=' + this.onglet : url;
    console.log('Session.loadPlaylist', url);
    Slider.load(this.playlist, 
                url,
                function(){
                  $('#top-playlist h2 small:last').html('» ' + name);
                  $('li.selector', Session.playlist).animate({width:0}, 500, function() {
                    $(this).hide();
                  });
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
  }
}
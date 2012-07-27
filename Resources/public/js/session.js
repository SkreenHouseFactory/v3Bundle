// -- Session
var Session;
Session = {
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  init: function(callback) {
    UI.playlist = $('#playlist');

    //session
    this.uid = $.cookie('myskreen_uid');
    if (API.context == 'v3') {
      this.sync(callback);
    }
  },
  sync: function(callback, args) {
    var self = this;
    var args = typeof args == 'undefined' ? new Array() : args;
    console.warn('Session.sync', this.uid, 'cookie:'+$.cookie('myskreen_uid'));

    if (this.uid) {
      $.extend(args, { with_notifications:1, with_selector:1, short:1 });
      API.query('GET', 'session/' + this.uid + '.json', args, function(sessionData) {
        self.signin(sessionData);

        if (callback) {
          callback(sessionData);
        }
      });
    } else {
      $.extend(args, { short:1 });
      API.query('POST', 'session.json', args, function(sessionData) {
        self.signin(sessionData);

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
    $.cookie('myskreen_uid', this.uid);
    if (this.datas.email) {
      UI.loadUser();
    }

    this.initPlaylist();
  },
  signout: function() {
    if (API.context == 'v2') {
      API.postMessage(["signout"]);
    } else {
      API.query('POST', 'session/signout.json', {session_uid: this.uid});
    }

    this.datas = '';
    this.uid = '';
    UI.loadUser();
    UI.unloadSelector();
    UI.unloadPlaylist();

    $.cookie('myskreen_uid', '');
  },
  initSocial: function(onglet, offset, force_remote) {
    var self = this;
    if (this.datas.fb_uid) {
      var offset = typeof offset != 'undefined' ? offset : 0;
      var onglet = typeof onglet != 'undefined' ? onglet : null;
      var cookie_name = 'myskreen_social_' + onglet + '_' + offset;
      var cookie = $.cookie(cookie_name);
      console.log('Session.initSocial', this.datas.fb_uid, cookie_name, cookie, 'force_remote:' + force_remote);
      if (cookie && typeof force_remote == 'undefined') {
        var json = JSON.parse(cookie);
        console.log('Session.initSocial', this.datas.fb_uid, 'cookie');
        if (json.statusText == 'error') {
          console.warn('Session.initSocial', this.datas.fb_uid, 'cookie error');
          return this.initSocial(onglet, offset, true);
        }
        Session.datas.friends = json.friends;
        UI.loadSocialSelector(json);
      } else {
        UI.appendLoader($('li#friends'));
        API.query('GET', 
                  'www/slider/social/' + this.uid + '.json', 
                  {onglet: this.onglet, nb_results: 1}, 
                  function(json) {
                    console.log('Session.initSocial', 'offset:' + offset, 'error:' + json.error);
                    if (typeof json.error == 'undefined') {
                      $.cookie(cookie_name, JSON.stringify(json));
                      self.datas.friends = json.friends;
                      UI.removeLoader($('li#friends'));
                      UI.loadSocialSelector(json);
                    }
                  });
      }
    }
  },
  initSelector: function(onglet, reload) {
    if (!this.datas.email) {
      return null;
    }

    console.log('Session.initSelector', this.datas.email, this.onglet, onglet, 'reload:' + reload);
    var self = this;

    //already loaded
    //if (this.onglet == onglet) {
    //  console.log('Session.initSelector', 'already loaded');
    //  return;
    //}

    //chargement initial avec data dans session
    if (this.onglet == null && onglet == 'undefined') {
      console.log('Session.initSelector', 'this.datas.queue_selector', this.datas.queue_selector);
      UI.loadSelector(this.datas.queue_selector);

    //requete
    } else if (typeof reload == 'undefined' && this.uid) {
      console.log('Session.initSelector', 'remote', 'www/slider/selector/' + this.uid + '.json');
      this.onglet = onglet;
      API.query('GET', 
                'www/slider/selector/' + this.uid + '.json', 
                {onglet: this.onglet, with_count_favoris: true}, 
                function(json) {
                  console.log('Session.initSelector', 'remote', 'reload', json);
                  UI.loadSelector(json, true);
                });

    }
  },
  initPlaylist: function(url) {

    if (typeof url == 'undefined') {
      url = API.context == 'v2' ? API.currentUrl : top.location.pathname;
    }
    url = url.replace('/app_dev.php','').replace('/app.php','');
    console.log('Session.initPlaylist', 'url:' + url);

    // -- keep
    console.log('Session.initPlaylist', 'keep', url.match(/keepPlaylist=1/));
    if (url.match(/keepPlaylist=1/)) {
      return;
    }

    // -- autoload
    console.log('Session.initPlaylist', 'autoload', document.location.href.match(/access=.+/));
    if (API.context == 'v3') {
      var access = document.location.href.match(/access=.+/g);
      if (typeof access[0] != 'undefined') {
        UI.loadPlaylist(access[0].replace('access=', ''));
        return;
      }
    }

    // -- default
    switch (url) {
     //load tv 
     case '/tv':
     case '/les-chaines-en-direct':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv');
     break;
     case '/programme-tv':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv', 'grid-main');
       $('.tv-grid-filter').show();
     break;
     //load cinema 
     case '/cinema/box-office/a':
       UI.loadFilters('cine', 'box-office');
     break;
     case '/cine':
     case '/selection/3520923-a-voir-au-cinema':
     case '/selection/4588325-prochainement-dans-les-salles':
       UI.loadPlaylist('cine');
       UI.loadFilters('cine');
     break;
     //load selector onglet
     case '/replay-vod':
       UI.loadPlaylist('replay-vod');
       UI.loadFilters('vod', url.replace('/', '').replace('replay-vod', ''));
     break;
     case '/films':
     case '/documentaires':
     case '/series':
     case '/emissions':
     case '/spectacles':
       UI.loadPlaylist('vod');
       UI.loadFilters('vod', url.replace('/', '').replace('replay-vod', ''));
     break;
     //load selector
     case '/':
       UI.unloadFilters();
       this.initSelector();
     break;
     default:
       this.initSelector();
     break;
    }
  }
}
// -- Session
//console.log('BASESESSION', BaseSession.prototype);
var Session = BaseSession.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  sync: function(callback, args) {
    var args = $.extend({with_notifications: 1}, args);
    this.__base(callback, args);
    
    if (API.context == 'v2') {
      API.postMessage(['sync']);
    }

  },
  signin: function(sessionData) {
    this.__base(sessionData)

    this.initPlaylist();
  },
  signout: function() {
    this.__base()

    UI.loadUser();
    UI.unloadSelector();
    UI.unloadPlaylist();
  },
  loadSocialSelector: function(onglet, offset, force_remote) {
    console.log('Session.loadSocialSelector', 'fb_uid', this.datas.fb_uid)
    var self = this;

    var offset = typeof offset != 'undefined' ? offset : 0;
    var onglet = typeof onglet != 'undefined' ? onglet : null;

    UI.appendLoader($('li#friends'));
    Skhf.session.getFriendsUids(function(friends_uids) {
      API.query('GET',
                'www/slider/social/' + self.uid + '.json', 
                {
                  onglet: self.onglet, 
                  nb_results: 1, 
                  img_width: API.config.slider.width, 
                  img_height: API.config.slider.height,
                  friends_uids: friends_uids
                }, 
                function(json) {
                  console.log('Session.loadSocialSelector', 'offset:' + offset, 'error:' + json.error);
                  if (typeof json.error == 'undefined') {
                    UI.removeLoader($('li#friends'));
                    UI.loadSocialSelector(json);
                  }
                });
    });
  },
  initSelector: function(onglet, reload) {
    var self = this;
    console.log('Session.initSelector', this.datas.email, this.onglet, onglet, 'reload:' + reload);

    //require authenticated user
    if (!this.datas.email) {
      UI.loadSelector();
      return null;
    }

    //console.log('Session.initSelector', 'remote', 'www/slider/selector/' + this.uid + '.json');
    this.onglet = onglet;
    API.query('GET', 
              'www/slider/selector/' + this.uid + '.json', 
              {onglet: this.onglet, 
                with_count_favoris: true,
                img_width: API.config.slider.width,
                img_height: API.config.slider.height
              },
              function(json) {
                console.log('Session.initSelector', 'remote', 'reload', json);
                UI.loadSelector(json);
                UI.playlist.elmt.removeClass('loading');
              });
  },
  initPlaylist: function(url) {

    if (typeof url == 'undefined') {
      url = API.context == 'v2' ? API.currentUrl : top.location.pathname;
    }
    url = url.replace('/app_dev.php','').replace('/app.php','');
    console.log('Session.initPlaylist', 'url:' + url);

    // -- keep
    if (url.match(/keepPlaylist/)) {
      console.log('Session.initPlaylist', 'keep');
      return;
    }

    // -- autoload
    if (API.context == 'v3') {
      console.warn('Session.initPlaylist', 'autoload', document.location.href.match(/access=.+/));
      var access = document.location.href.match(/access=.+/g);
      if (access != null && typeof access[0] != 'undefined') {
        UI.loadPlaylist(access[0].replace('access=', ''));
        return;
      }
    }

    // -- default
    switch (url) {
     //load tv 
     case '/tv-replay':
     case '/les-chaines-en-direct':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv');
     break;
     case '/emissions':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv'); //??
     break;
     case '/programme-tv':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv', 'grid');
       //add grid filters
     break;
     //load cinema 
     case '/cinema/box-office/a':
       UI.loadFilters('cine', 'box-office');
     break;
     case '/cine':
       UI.loadPlaylist('cine');
       UI.loadFilters('cine');
     break;
     case '/selection/7845147-a-voir-au-cinema':
       UI.loadPlaylist('cine');
       UI.loadFilters('cine', 'new');
     break;
     case '/selection/7845150-prochainement-dans-les-salles':
       UI.loadFilters('cine', 'coming');
     break;
     //load selector onglet
     case '/vod':
       UI.loadPlaylist('vod');
       UI.loadFilters('vod');
     break;
     case '/films':
     case '/documentaires':
     case '/series':
     case '/spectacles':
     case '/jeunesse':
       UI.loadPlaylist('vod');
       UI.loadFilters('vod', url.replace('/', ''));
     break;
     //load selector
     case '/':
     case '':
       //UI.unloadFilters();
       UI.loadFilters('home');
       this.initSelector();
     break;
     default:
       UI.loadFilters('home');
       this.initSelector();
     break;
    }
  }
});
//console.log('SESSION', Session.prototype);
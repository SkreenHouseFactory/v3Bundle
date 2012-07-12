// -- Session
var Session;
Session = {
  uid: '',
  datas: {},
  onglet: null,
  access: null,
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
      API.query("GET", "session/" + this.uid + ".json", args, function(sessionData) {
        self.signin(sessionData);

        if (callback) {
          callback(sessionData);
        }
      });
    } else {
      $.extend(args, { short:1 });
      API.query("POST", "session.json", args, function(sessionData) {
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
    if (this.datas.email) {
      UI.loadUser();
    }
    if (this.datas.email || API.context == 'v3') {
      this.initPlaylist();
    }
    $.cookie('myskreen_uid', this.uid);
  },
  signout: function() {
    this.datas = '';
    this.uid = '';
    UI.loadUser();
    UI.unloadSelector();
    UI.unloadPlaylist();

    API.postMessage(["signout"]);
  },
  initSocial: function(onglet, offset, force_remote) {
    var self = this;
    if (this.datas.fb_uid) {
      var offset = offset != 'undefined' ? offset : 0;
      var cookie_name = 'myskreen_social_'+onglet+'_'+offset;
      var cookie = $.cookie(cookie_name);
      if (cookie && force_remote == 'undefined') {
        var json = JSON.parse(cookie);
        console.log('Session.initSocial', this.datas.fb_uid, 'cookie', json);
        if (json.statusText == 'error') {
          console.warn('Session.initSocial', this.datas.fb_uid, 'cookie error');
          return this.initSocial(onglet, offset, true);
        }
        UI.loadFriends(json);
        Session.datas.friends = json.friends;
      } else {
        console.log('Session.initSocial', this.datas.fb_uid, 'API');
        UI.appendLoader($('li#friends'));
        API.query('GET', 
                  'www/slider/social/' + this.uid + '.json', 
                  {onglet: this.onglet, nb_results: 1}, 
                  function(json) {
                    console.log('Session.initSocial', 'offset:'+offset, json);
                    $.cookie(cookie_name, JSON.stringify(json), { expires: 1 });
                    self.datas.friends = json.friends;
                    UI.removeLoader($('li#friends'));
                    UI.loadFriends(json);
                  });
      }
    }
  },
  initSelector: function(onglet, reload) {
    console.log('Session.initSelector', this.onglet, onglet, 'reload:'+reload);
    var self = this;

    //already loaded
    //if (this.onglet == onglet) {
    //  console.log('Session.initSelector', 'already loaded');
    //  return;
    //}

    //chargement initial avec data dans session
    if (this.onglet == null && onglet == 'undefined') {
      //console.log('Session.initSelector', 'this.datas.queue_selector', this.datas.queue_selector);
      UI.loadSelector(this.datas.queue_selector);

    //requete
    } else if (typeof reload == 'undefined' && this.uid) {
      //console.log('Session.initSelector', 'remote', 'www/slider/selector/' + this.uid + '.json');
      this.onglet = onglet;
      API.query('GET', 
                'www/slider/selector/' + this.uid + '.json', 
                {onglet: this.onglet, with_count_favoris: true}, 
                function(json) {
                  //console.log('Session.initSelector', 'reload', json);
                  UI.loadSelector(json, true);
                });

      this.initSocial();
    }
  },
  initPlaylist: function(url) {
    console.log('Session.initPlaylist', 'url:' + url);
    
    if (typeof url == 'undefined') {
      url = API.context == 'v2' ? API.currentUrl : top.location.pathname;
    }
    
    switch (url) {
     //load vod 
     case '/selection-...': 
       UI.loadPlaylist('vod', 'films');
     break; 
     //load replay
     case '':  
       UI.loadPlaylist('replay', 'emissions');
     break; 
     //load tv 
     case '/les-chaines-en-direct':
     case '/programme-tv':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv');
       console.log('Session.initPlaylist', 'add header tv');
       API.postMessage(['header', 'add_playlist']);
     break; 
     //load cinema 
     case '/selection/3520923-a-voir-au-cinema':
     case '/selection/4588325-prochainement-dans-les-salles': 
       UI.loadPlaylist('cine');
       UI.loadFilters('cine');
     break; 
     //load selector onglet
     case '/films': 
     case '/documentaires': 
     case '/series': 
     case '/emissions': 
     case '/spectacles': 
       this.initSelector(url.replace('/', ''));
       UI.loadFilters('vod');
     break; 
     //load selector
     default: 
       this.initSelector();
     break; 
    }
    //UI.loadFilters('vod');
  }
}
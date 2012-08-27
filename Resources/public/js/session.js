// -- Session
console.log('BASESESSION', BaseSession.prototype);
var Session = BaseSession.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
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
  initSocial: function(onglet, offset, force_remote) {
    if (this.datas.fb_uid) {
      UI.appendLoader($('li#friends'));
      this.__base(onglet, offset, force_remote, function(json){
        UI.removeLoader($('li#friends'));
        UI.loadSocialSelector(json);
      });
    }
  },
  initSelector: function(onglet, reload) {
    //prevent multiple loadings
    //if (UI.playlist.hasClass('loading')) {
    //  console.warn('Session.initSelector', 'already loading');
    //  return;
    //}
    //UI.playlist.addClass('loading');

    //require authenticated user
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
    if (false && this.onglet == null && onglet == 'undefined') {
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
                  UI.playlist.elmt.removeClass('loading');
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
    if (url.match(/keepPlaylist/)) {
      console.log('Session.initPlaylist', 'keep');
      return;
    }

    // -- autoload
    if (API.context == 'v3') {
      console.log('Session.initPlaylist', 'autoload', document.location.href.match(/access=.+/));
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
     case '/emissions':
     case '/les-chaines-en-direct':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv');
       //remove grid filters
       if ($('#top-filters .tv-grid-main').hasClass('tv-grid-filter')) {
         $('#top-filters .tv-grid-main').removeClass('tv-grid-filter');
         $('#top-filters .tv-grid-filter:not(.tv-grid-main)').hide();
         $('#top-filters .tv:not(.tv-selection, .tv-grid-filter)').show();
       }
     break;
     case '/programme-tv':
       UI.loadPlaylist('tv');
       UI.loadFilters('tv', 'grid-main');
       console.log('Session.initPlaylist', 'hasClass', $('#top-filters .tv-grid-main').hasClass('tv-grid-filter'));
       //add grid filters
       if (!$('#top-filters .tv-grid-main').hasClass('tv-grid-filter')) {
         console.log('Session.initPlaylist', $('#top-filters .tv:not(.tv-selection, .tv-grid-filter)'));
         $('#top-filters .tv-grid-filter').show();
         $('#top-filters .tv-grid-main').addClass('tv-grid-filter');
         $('#top-filters .tv:not(.tv-selection, .tv-grid-filter)').hide();
         $('#top-playlist').collapse('hide');
       }
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
       UI.unloadFilters();
       this.initSelector();
     break;
     default:
       this.initSelector();
     break;
    }
  }
});
console.log('SESSION', Session.prototype);
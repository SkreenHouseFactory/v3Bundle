// -- Session
//console.log('BASESESSION', BaseSession.prototype);
var Session = BaseSession.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  sync_args: {'short': 1},
  sync: function(callback, args) {
    var args = $.extend(this.sync_args, args);
    this.__base(callback, args);
  },
  signin: function(sessionData, callback) {
    this.__base(sessionData, callback)

    //update
    this.update();
  },
  signout: function(callback) {
    //before loosing queue
    var queue = this.datas.queue;
    UI.unloadPlaylistTriggers('like', queue);

    this.__base(callback)

    UI.unloadSelector();
    UI.unloadPlaylist();
    if(document.location.href.indexOf('/user/')!=-1){
      document.location='/';
    }
  },
  loadSocialSelector: function(callback, offset, onglet) {
    var self = this;
    var offset = typeof offset != 'undefined' ? offset : 0;
    //var onglet = typeof onglet != 'undefined' ? onglet : null;
    console.log('Session.loadSocialSelector', offset, onglet)

    //load from IndexedDb ?
    // API.selectIndexedDb('skhf', 'social_selector', 1, function(IndexedDbDatas){
    //   console.log('UI.loadSocialSelector', 'selectIndexedDb', IndexedDbDatas);
    //   if (IndexedDbDatas) {
    //     console.log('UI.loadSocialSelector', 'IndexedDbDatas', IndexedDbDatas);
    //     if (IndexedDbDatas.updated_at > (new Date()).getTime() - 3600*1000) {
    //       callback(IndexedDbDatas.social_selector);
    //       return;
    //     } else {
    //       API.deleteIndexedDb('skhf', 'social_selector', 1);
    //     }
    //   }
      Skhf.session.getFriendsUids(function(friends_uids) {
        API.query(
          'GET',
          'www/slider/social/' + self.uid + '.json', 
          {
            onglet: self.onglet, 
            nb_results: 1, 
            img_width: API.config.slider.width, 
            img_height: API.config.slider.height,
            friends_uids: friends_uids
          }, 
          function(datas) {
            if (typeof callback != 'undefined') {
              API.insertIndexedDb(
                'skhf', 
                'IndexedDbDatas', 
                {
                  id: 1, 
                  social_selector: datas,
                  updated_at: (new Date()).getTime()
                }
              );

              callback(datas);
            }
          });
      });
    // });
  },
  initSelector: function(onglet) {
    var self = this;
    console.log('Session.initSelector', this.datas.email, this.onglet, onglet);
    //require authenticated user
    // true si l'utilisateur charge les selectors
    if($('#playlist .items .empty').length >= 2 ){
      var noplaylist = true;
    }
    else{
      var noplaylist = false;
    }
    
    if (!this.datas.email) {
      UI.loadSelector();
      return null;
    }
    console.log('Session.initSelector', 'remote', 'www/slider/selector/' + this.uid + '.json');
    this.onglet = onglet;
    $('.slider-container','#playlist').prepend('<div class="loading bar " style="width: 150px;position: absolute;z-index: 2;top: 35px;left: 465px;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>');
    UI.playlist.elmt.addClass('slider-loading');
    $('#top-playlist .container ul li a').bind('click',function(event){
      event.stopPropagation();
    });
    $('#playlist .items li').bind('click.loading',function(event){
      event.stopPropagation();
    }); 
    API.query(
      'GET', 
      'www/slider/selector/' + this.uid + '.json', 
      {onglet: this.onglet, 
        with_count_favoris: 1,
        img_width: API.config.slider.width,
        img_height: API.config.slider.height
      },
      function(json) {
        console.log('Session.initSelector', 'load', json);
        UI.loadSelector(json);
     // autorise le click sur les selectors et enlève le loaders si les selecteurs viennent d'être chargé.
        if (noplaylist == true){
          console.log('Session.initSelector','Remove Loading Bar');
          $('.loading.bar').remove();
          UI.playlist.elmt.removeClass('slider-loading');
          $("#playlist .items li").unbind('click.loading');
          noplaylist = false;
        }
      });
  },
  initPlaylist: function(url) {
    console.log('Session.initPlaylist', 'url:' + url);

    if (typeof url == 'undefined') {
      url = document.location.pathname;
    } else if (url) {
    	url = url.replace('/app_dev.php','').replace('/app.php','');
	    // -- keep
	    if (url.match(/keepPlaylist/)) {
	      console.log('Session.initPlaylist', 'keep');
	      return;
	    }
		}
    console.log('Session.initPlaylist', 'url:' + url);

    // -- autoload
    var access = document.location.href.match(/access=.+/g);
    if (access != null && typeof access[0] != 'undefined') {
      console.warn('Session.initPlaylist', 'autoload', access[0].replace('access=', ''));
      UI.loadPlaylist(access[0].replace('access=', ''));
      return;
    }

    // -- default
    switch (url) {
     //load tv 
     case '/tv-replay/':
       UI.loadPlaylist('tv');
       //UI.loadFilters('tv');
     break;
     case '/emission/':
       UI.loadPlaylist('tv');
       //UI.loadFilters('tv'); //??
     break;
     case '/programme-tv':
       UI.loadPlaylist('tv');
       //UI.loadFilters('tv', 'grid');
       //add grid filters
     break;
     //load cinema 
     case '/cinema/box-office/a/':
       //UI.loadFilters('cine', 'box-office');
     break;
     case '/cinema/':
       UI.loadPlaylist('cine');
       //UI.loadFilters('cine');
     break;
     case '/cinema/selection/7845147-a-decouvrir-dans-les-salles-cette-semaine/':
       UI.loadPlaylist('cine');
       //UI.loadFilters('cine', 'new');
     break;
     case '/cinema/selection/7845150-bientot-dans-les-salles/':
       //UI.loadFilters('cine', 'coming');
     break;
     //load selector onglet
     case '/video-a-la-demande/':
       UI.loadPlaylist('vod');
       //UI.loadFilters('vod');
     break;
     case '/film/':
     case '/documentaire/':
     case '/serie/':
     case '/spectacle/':
     case '/dessin-anime-et-manga/':
       UI.loadPlaylist('vod');
       //UI.loadFilters('vod', url.replace('/', '').replace('/', ''));
     break;
     //load selector
     case '/':
     case '':
     default:
       //UI.unloadFilters();
       //UI.loadFilters('home');
       this.initSelector();
     break;
    }
  }
});
//console.log('SESSION', Session.prototype);
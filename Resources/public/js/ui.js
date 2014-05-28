// -- UI
var UI;

UI = {
  user: '',
  available_playlists: ['like','cinema','channel','page','person','user','category','format-category'],
  os: null,
  playlist: null,
  sliders: [],
  last_notification: null,
  max_notifications: 50,
  badge_notification: '<span class="badge">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="progress-bar progress-bar-info" style="width: 0%"></div></div>',
  callbackTogglePlaylist: null,
  callbackModal: null,
  init: function(callback) {
    var self = this;
    this.playlist = new BaseSlider({ programs: [] }, function() {}, $('#playlist'));
    console.log('UI.init', 'this.playlist', this.playlist);

    //ios
    if (navigator.userAgent.match(/iPhone|iPod|iPad/)) {
      $('html').addClass('ios');
      UI.os = 'ios';
    }
    //autoload sliders
    $('.slider[data-autoload="1"]').each(function(){
      self.sliders[this.id] = new BaseSlider({}, function(){}, $(this));
      //console.log('UI.init', 'autoload sliders', $(this));
    });
    //start-mes-listes
    if (API.cookie('start-mes-listes')) {
      Skhf.session.datas = JSON.parse(API.cookie('start-mes-listes'));
      console.log('UI.init', 'start-mes-listes', Skhf.session);
      this.loadPlaylistTriggers();
    }
    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
    
  //auth
  auth: function(callback, parcours) {
    // si connecté, on execute directement le callback
    if( Skhf.session.datas.email ){
      if (typeof callback != 'undefined') {
        console.log('UI.auth', 'UI.callbackModal set', callback);
        callback();
      }
      return;
    }

    //fbconnect ne passe pas par le callback !
    if (typeof callback != 'undefined') {
      console.log('UI.auth', 'UI.callbackModal set', callback);
      UI.callbackModal = callback;
    }
    API.quickLaunchModal('signup', function() {
      Skhf.session.sync(function() {
        if (typeof callback != 'undefined') {
          console.log('UI.auth', 'Skhf.session.init callback');
          callback();
        }
        //message popin default
        if (!$('#skModal.modal .modal-message').html()) {
          console.log('js', 'ui.js', 'message modal');
          $('#skModal.modal .modal-message').html(
            '<p><strong>Votre compte GRATUIT en 1 clic :</strong> ' +
            'Créez vos listes et ne ratez plus vos programmes préférés : Cinéma, TV, Replay et VOD !</p>' //<br/><a href="/start">&raquo; Découvrir Mes listes</a>
          );
        }
        $('#skModal.modal .modal-message [data-content]').popover();
      });
    },{parcours: parcours});
  },
  //user infos
  loadUser: function() {
    var self = this;
    var update = false;
    if (this.user) {
      if (this.user == Skhf.session.datas.email) {
        var update = true;
        //console.warn('UI.loadUser', 'already loaded');
        //return;
      } else {
        //TODO : unload user !';
      }
    }
    console.log('UI.loadUser', Skhf.session.datas.email, this.user, 'update:', update);
    this.user = Skhf.session.datas.email;

    if (Skhf.session.datas.email) {
      //on
      
      //self.loadSelector();
      $('body').addClass('connected');
      if (!update) {

        //load playlist
        Skhf.session.initPlaylist();
        $('.user-off:not(.hide)').addClass('hide');
        $('.user-on.hide').removeClass('hide');
        $('.user-on-visibility').css('visibility','visible');
        if($('li.selector').length>0){
          $('li.selector:not(.empty)').popover('disable').popover('hide');
        }
        //share on
        if (Skhf.session.datas.disallow_share) {
          $('.share [data-share="disallow"]').trigger('click');
        }
        //datas
        this.loadPlaylistTriggers();
      
        //mes listes
        this.loadMeslistes();
        
        //credential
        for (k in Skhf.session.credentials) {
          $('.credential-'+Skhf.session.credentials[k]).removeClass('hide').css('border', '2px dotted yellow');
        }
      } else {
        $('.fb-placeholder').addClass('hide');
        $('.share-placeholder').removeClass('hide');
        $('.badge-placeholder').removeClass('badge badge-important')
                               .removeAttr('rel')
                               .removeAttr('data-original-title')
                               .removeAttr('data-content')
                               .popover('hide')
                               .popover('disable');
      }
      //infos
      $('.user-email').html(Skhf.session.datas.email);
      $('.favoris span').html('(' + Skhf.session.datas.queue.length + ')');
      //fb
      if (Skhf.session.datas.fb_uid) {
        if (Skhf.session.datas.fb_access_token == null) {
          $('.fb-placeholder').removeClass('hide');
          $('.share-placeholder').addClass('hide');
          $('.badge-placeholder').addClass('badge badge-important')
                                 .attr('rel','popover')
                                 .attr('data-original-title',"ATTENTION ! Vous n'êtes pas connecté à votre compte Facebook")
                                 .attr('data-content',"Vous ne pouvez dès lors pas partager vos programmes avec vos amis. Pour vous connecter, veuillez cliquer.");
          $(function (){
             $('.badge-placeholder').popover({placement:'bottom', trigger:'hover'});
          });
          $('.badge-placeholder').on('click', function() {
             $('.badge-placeholder').popover('hide');
          });
        }
        $('.share-on.hide').removeClass('hide');
        $('.share-off:not(.hide)').addClass('hide');
        // this.addFriendsPrograms();
      } else {
        $('.fb-placeholder').addClass('hide');
        $('.share-placeholder').removeClass('hide');
        $('.badge-placeholder').removeClass('badge badge-important')
                               .removeAttr('rel')
                               .removeAttr('data-original-title')
                               .removeAttr('data-content');
        $('.share-on:not(.hide)').addClass('hide');
        $('.share-off.hide').removeClass('hide');
      }

    } else {
      //off
      $('body').removeClass('connected');
      $('.remove-on-signout').remove();
      $('.badge-placeholder').removeClass('badge badge-important')
                             .removeAttr('rel')
                             .removeAttr('data-original-title')
                             .removeAttr('data-content');
      $('.user-off.hide').removeClass('hide');
      $('.user-on:not(.hide)').addClass('hide');
      $('.share-on:not(.hide)').addClass('hide');
      $('.share-off').removeClass('hide');
      $('.user-on-visibility').css('visibility','hidden');
      $('.navbar .notifications li.empty').show();
      $('li.selector').popover('enable');
      //remove datas
      $('.user-email, .favoris span').empty();
      $('.navbar .notifications-count').removeClass('with-badge')
                               .empty();
      $('.navbar .notifications li:not(.empty)').remove();
      this.playlist.remove();

      //unload playlists
      this.unloadTheatersPlaylist();
      $('.fav-on').each(function() {
        self.unloadPlaylistTriggers(self.getTriggerParameter($(this)), [$(this).parents('.actions').data('id')]);
      });
    }
  },
  getTriggerParameter: function(trigger) {
    if (trigger.hasClass('fav-cinema')) {
      return 'cinema';
    } else if (trigger.hasClass('fav-epg')) {
      return 'epg';
    } else if (trigger.hasClass('fav-channel')) {
      return 'channel';
    } else if (trigger.hasClass('fav-page')) {
      return 'page';
    } else if (trigger.hasClass('fav-person')) {
      return 'person';
    } else if (trigger.hasClass('fav-user')) {
      return 'user';
    } else if (trigger.hasClass('fav-search')) {
      return 'search';
    } else if (trigger.hasClass('fav-category')) {
      return 'category';
    } else if (trigger.hasClass('fav-format-category')) {
      return 'format-category';
    } else {
      return 'like';
    }
  },
  getTriggerName: function(trigger) {
    if (trigger.hasClass('fav-cinema')) {
      return ' ce cinéma';
    } else if (trigger.hasClass('fav-epg')) {
      return ' cette chaîne TV';
    } else if (trigger.hasClass('fav-channel')) {
      return ' cette chaîne';
    } else if (trigger.hasClass('fav-page')) {
      return ' cette chaîne';
    } else if (trigger.hasClass('fav-person')) {
      return ' cette personne';
    } else if (trigger.hasClass('fav-user')) {
      return ' ce skreener';
    } else if (trigger.hasClass('fav-search')) {
      return ' cette recherche';
    } else if (trigger.hasClass('fav-category')) {
      return ' cette catégorie';
    } else if (trigger.hasClass('fav-format-category')) {
      return ' cette catégorie';
    } else if (trigger.hasClass('fav-like')) {
      return ' ce programme';
    } else {
      return '';
    }
  },
  getPlaylistMessage: function(trigger) {
    if (trigger.hasClass('fav-cinema')) {
        return ['Ne ratez plus vos séances&nbsp;!', 
                'En ajoutant ce cinéma à vos listes vous saurez averti de sa programmation.'];
    } else if (trigger.hasClass('fav-epg')) {
        return ['Faites-vous un programme TV sur mesure&nbsp;!', 
                'En ajoutant cette chaîne à vos listes elle apparaîtra dans votre programme TV.'];
    } else if (trigger.hasClass('fav-page')) {
        return ['Ne ratez plus ' + trigger.data('channel-name') + '&nbsp;!',
                'En ajoutant cette chaîne à vos listes vous saurez averti dès qu\'une nouvelle vidéo sera mise en ligne.'];
    } else if (trigger.hasClass('fav-channel')) {
        return ['Ne ratez plus ' + trigger.data('channel-name') + '&nbsp;!',
                'En ajoutant cette chaîne à vos listes vous saurez averti dès qu\'une nouvelle vidéo sera mise en ligne.'];
    } else if (trigger.hasClass('fav-user')) {
        return ['Suivre la playlist de ' + trigger.data('channel-name') + ' &nbsp;!',
                'En ajoutant cette chaîne à vos listes vous saurez averti dès qu\'une nouvelle vidéo sera mise en ligne.'];
    } else if (trigger.hasClass('fav-person')) {
      if (typeof trigger.data('name') != undefined) {
        return ['Ne ratez plus l\'actualité de ' + trigger.data('name') + '&nbsp;!',
                'En ajoutant cette personne à vos listes vous saurez averti dès qu\'un de ses programmes sera disponible.'];
      } else {
        return ['Ne ratez plus vos acteurs préférés&nbsp;!',
                'En ajoutant cette personne à vos listes vous saurez averti dès qu\'un de ses programmes sera disponible.'];
      }
    } else if (trigger.hasClass('fav-search')) {
        return ['Ne ratez plus les programmes qui vous intéressent&nbsp;!',
                'En ajoutant cette recherche à vos listes vous saurez averti dès qu\'un programme correspondant sera disponible.'];
    } else if (trigger.hasClass('fav-category')) {
        return ['Ne ratez plus les programmes qui vous intéressent&nbsp;!',
                'En ajoutant cette catégorie à vos listes vous saurez averti dès qu\'un programme correspondant sera disponible.'];
    } else if (trigger.hasClass('fav-format-category')) {
        return ['Ne ratez plus les programmes qui vous intéressent&nbsp;!',
                'En ajoutant cette catégorie à vos listes vous saurez averti dès qu\'un programme correspondant sera disponible.'];
    } else {
      if (trigger.data('onglet') == 'emissions' || 
          trigger.data('onglet') == 'series') {
        return ['Ne ratez plus vos programmes&nbsp;!',
                'En ajoutant ce programme à vos listes vous serez averti dès qu\'un épisode est disponible !'];
      } else {
        return ['Ne ratez plus vos programmes&nbsp;!',
                'En ajoutant ce programme à vos listes vous saurez quand il passe à la télé ou au cinéma et s\'il est disponible en Replay ou en VOD.'];
      }
    }
  },
  getStatusFBMessage: function(trigger) {
    if (trigger.hasClass('fav-cinema')) {
        return ['Faites comme moi, ne ratez plus les séances de vos cinémas préférés !', 
                'En ajoutant ce cinéma à mes listes sur myskreen, je suis averti de sa programmation.'];
    } else if (trigger.hasClass('fav-epg')) {
        return ['Faites-vous aussi un programme TV sur mesure !', 
                'En ajoutant cette chaîne à mes listes sur myskreen, elle apparaît dans mon programme TV.'];
    } else if (trigger.hasClass('fav-channel')) {
        return ['Faites comme moi, ne ratez plus ' + trigger.data('channel-name') + ' !',
                'En ajoutant cette chaîne à mes listes, je suis averti dès qu\'une nouvelle vidéo est mise en ligne.'];
    } else if (trigger.hasClass('fav-person')) {
      if (typeof trigger.data('name') != undefined) {
        return ['Faites comme moi, ne ratez plus l\'actualité de ' + trigger.data('name') + ' !',
                'En ajoutant cette personne à mes listes, je suis averti dès qu\'un de ses programmes est disponible.'];
      } else {
        return ['Faites comme moi, ne ratez plus vos personnalités préférées !',
                'En ajoutant cette personne à mes listes, je suis averti dès qu\'un de ses programmes est disponible.'];
      }
    } else if (trigger.hasClass('fav-search')) {
        return ['Faites comme moi, ne ratez plus les programmes qui vous intéressent !',
                'En ajoutant cette recherche à mes listes, je suis averti dès qu\'un programme correspondant est disponible.'];
    } else if (trigger.hasClass('fav-category')) {
        return ['Faites comme moi, ne ratez plus les programmes qui vous intéressent !',
                'En ajoutant cette catégorie à mes listes, je suis averti dès qu\'un programme correspondant est disponible.'];
    } else if (trigger.hasClass('fav-format-category')) {
        return ['Faites comme moi, ne ratez plus les programmes qui vous intéressent !',
                'En ajoutant cette catégorie à vos listes, je suis averti dès qu\'un programme correspondant est disponible.'];
    } else {
      if (trigger.data('onglet') == 'emissions') {
        return ['Faites comme moi, ne ratez plus vos émissions préférées !',
                'En ajoutant cette émission à mes listes, je suis averti de toutes ses diffusions !'];
      } else if (trigger.data('onglet') == 'series') {
        return ['Faites comme moi, ne ratez plus vos séries préférées !',
                'En ajoutant cette série à mes listes, je suis averti dès qu\'un épisode est disponible !'];
      } else {
        return ['Faites comme moi, ne ratez plus vos films préférés !',
                'En ajoutant ce film à mes listes, je sais quand il passe à la télé, au cinéma et s\'il est disponible en Replay ou en VOD.'];
      }
    }
  },
  //set popover infos
  installPopover: function(trigger) {
    var message = this.getPlaylistMessage(trigger);
    trigger.popover({
      title:  message[0],
      content: message[1],
      html: true,
      show: 500, 
      hide: 100,
      container: 'body'
    });
  },
  //toggle favorite : fav-parameter
  //if fav-remove[data-id="xx"] : element deleted in this.unloadPlaylistTrigger
  togglePlaylist: function(trigger, with_related){
    var self = this;
    var parameter = this.getTriggerParameter(trigger);
    var name = this.getTriggerName(trigger);
    var store_in_session = trigger.data('store-in-session');
    if (Skhf.session.datas.email || store_in_session) {
      API.trackEvent('Playlist', 'connected-' + (remove ? 'remove-' : 'add-') + parameter, value);
      console.log('UI.togglePlaylist', parameter, value, 'remove:' + remove, trigger);
      if(!trigger.hasClass('fav-noupdate')){
        trigger.removeClass('btn-plus');
        trigger.html('Chargement ...').removeClass('btn-danger');
      }
      var value = trigger.data('id') ? trigger.data('id') : trigger.parents('.actions:first').data('id');
      var remove = trigger.hasClass('fav-on') ? true : false;
      // console.log('ui.js', 'togglePlaylist', 'remove', remove);
      // -- callback
      var callback = function(value, return_data){
        console.log('UI.togglePlaylist', 'callback', value, 'remove:'+remove);
        //remove
        if (remove) {
          console.log('UI.togglePlaylist', 'callback enter remove');
          if (trigger.hasClass('fav-trash') &&
              $('.friends', trigger.parents('.actions:first')).length == 0) { //pas pour le slider social
            $('.slider-playlist li[data-id="' + value + '"], .slider-list li[data-id="' + value + '"], .channels-list li[data-id="' + value + '"]').animate({'width':0}, 500, function(){
              $(this).remove();
            });
          }
        } else if (typeof(store_in_session) == 'undefined') {
          console.log('UI.togglePlaylist', 'Skhf.session.getNbPlaylists()' + Skhf.session.getNbPlaylists());
          // Post FB Status
          if (!Skhf.session.datas.disallow_share) {
            var link = document.location.href;
            var message = self.getStatusFBMessage(trigger).join("\n").replace('&nbsp;',' ');
            Facebook.checkPermissions('publish_actions', function(success, rerequest){
              if (success) {
                Facebook.publishStatus(message,link);
              } else {
                Facebook.login('publish_actions', function(token){
                  Skhf.session.datas.fb_access_token = token;
                  Facebook.checkPermissions('publish_actions', function(success){
                    if (success) {
                      Facebook.publishStatus(message,link);
                    } else {
                      // Dialog - vous pouvez désactiver le partage automatique en allant dans vos préférences
                      var dialog = new Dialog('onDenyFacebookShare',{});
                    }
                  });
                },(typeof rerequest != 'undefined' ? 'rerequest' : '' ));
              }
            });
          }
          // Dialog
          if (Skhf.session.getNbPlaylists() == 0) {
            console.log('ui.js', 'togglePlaylist', 'name', name);
            var dialog = new Dialog('firstItemInPlaylist',{
              '%title%': 'Vous avez ajouté' + name,
              '%content%': '',
            });
          } else if (Skhf.session.getNbPlaylists() < 5) {
            var dialog = new Dialog('firstItemsInPlaylist',{
              '%title%': 'Vous avez ajouté' + name,
              '%content%': '',
              '%nbfavori%': (Skhf.session.getNbPlaylists()+1) + ' favoris',
            });
          }
        }
        if (UI.callbackTogglePlaylist) {
          console.log('UI.callbackTogglePlaylist', 'parameter:', parameter, 'value:', value, 'remove:', remove, 'trigger:', trigger, 'return_data:', return_data);
          UI.callbackTogglePlaylist(parameter, value, remove, trigger, return_data);
        }
      }
      // -- api
      if (remove) {
        if (Skhf.session.datas.email) {
          API.removePreference(parameter, value, callback);
        } else if (store_in_session) { //start mes listes
          meslistes_in_session = API.cookie('start-mes-listes') ? JSON.parse(API.cookie('start-mes-listes')) : {};
          newparameter = parameter.replace('like', 'queue')
          if (typeof meslistes_in_session[newparameter] != 'undefined' && 
              typeof meslistes_in_session[newparameter][value] != 'undefined') {
            delete meslistes_in_session[newparameter][value];
            console.log('UI.togglePlaylist', 'store_in_session', 'remove', meslistes_in_session);
            API.cookie('start-mes-listes', JSON.stringify(meslistes_in_session));
            self.unloadPlaylistTriggers(parameter, [value]);
          }
        } 
      } else {
        if (Skhf.session.datas.email) {
          API.addPreference(parameter, value, callback, '', typeof with_related == 'undefined' ? true : with_related);
        } else if (store_in_session) { //start mes listes
          meslistes_in_session = API.cookie('start-mes-listes') ? JSON.parse(API.cookie('start-mes-listes')) : {};
          newparameter = parameter.replace('like', 'queue')
          if (typeof meslistes_in_session[newparameter] == 'undefined') {
            meslistes_in_session[newparameter] = {};
          }
          meslistes_in_session[newparameter][value] = value;
          console.log('UI.togglePlaylist', 'store_in_session', 'add', [newparameter, value], meslistes_in_session, JSON.stringify(meslistes_in_session));
          API.cookie('start-mes-listes', JSON.stringify(meslistes_in_session))
          self.loadPlaylistTriggers(parameter, [value]);
        }
      }
    } else {

      API.trackEvent('Playlist', 'notconnected-add-' + parameter, value);
      this.auth(function(){
        console.log('UI.togglePlaylist', 'UI.auth callback', Skhf.session.datas.email);
        if(trigger.data('modal-message')){
          $('#skModal.modal .modal-message').html(trigger.data('modal-message'));
        } else {
          var message = self.getPlaylistMessage(trigger);
          $('#skModal.modal .modal-message').html('<p><b>Vos listes <i class="icon-question-sign" data-content="Enregistez votre compte et retrouvez vos listes à tout moment. &lt;br/&gt;mySkreen est gratuit et le restera !" data-placement="right" data-trigger="hover" data-original-title="Replay, VOD et cinéma dans une même playlist"></i></b> : ' + message[1] + '</p>');
        }
        if (Skhf.session.datas.email) {
          self.togglePlaylist(trigger);
        }
      }, 'playlist');
    }
  },
  //toggle btn
  loadPlaylistTriggers: function(parameter, ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.loadPlaylistTriggers', parameter, ids, elmt);
    if (typeof parameter != 'undefined' && parameter) {
      for (key in ids) {
        // console.log('UI.loadPlaylistTriggers', ids[key], '[data-id="' + ids[key] + '"].fav-' + parameter + ':not(.fav-on)');
        var trigger = $('[data-id="' + ids[key] + '"].fav-' + parameter + ':not(.fav-on)', elmt);
        // console.log('js', 'ui.js', 'trigger', trigger);
        trigger.each(function(){
          if(!$(this).hasClass('fav-noupdate')){
            $(this).removeClass('btn-plus');
            $(this).html('<i class="glyphicon glyphicon-ok"></i> Abonné').addClass('fav-on btn-success');
          }
        });
      }
      switch(parameter) {
        case 'cinema': //reload
          if ($('#trigger-theaters-playlist').length) { //fiche programme
            //console.log('UI.loadPlaylistTriggers', 'set UI.callbackModal');
            UI.callbackModal = function() { //à la fermeture de la popin
              $('#trigger-theaters-playlist').trigger('click');
            }
          }
        break;
      }

    } else {
      for(k in this.available_playlists) {
        var ids = Skhf.session.getPlaylistIds(this.available_playlists[k]);
        console.log('UI.loadPlaylistTriggers', 'playlist:', this.available_playlists[k], 'ids:', ids);
        for (key in ids) {
          var trigger = $('[data-id="' + ids[key] + '"].fav-' + this.available_playlists[k] + ':not(.fav-on)', elmt);
          trigger.each(function(){
            if(!$(this).hasClass('fav-noupdate')){
              $(this).removeClass('btn-plus');
              $(this).html('<i class="glyphicon glyphicon-ok"></i> Abonné').addClass('fav-on btn-success');
            }
          });
        }
      }
    }
  },
  unloadPlaylistTriggers: function(parameter, ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.unloadPlaylistTriggers', parameter, ids, elmt);
    if (typeof parameter != 'undefined' && parameter) {
      ids = ids.indexOf(',') == -1 ? ids : ids.split(',');
      for (key in ids) {
        console.log('UI.unloadPlaylistTriggers', ids[key], '[data-id="' + ids[key] + '"].fav-' + parameter + '.fav-on');
        var trigger = $('[data-id="' + ids[key] + '"].fav-' + parameter + '.fav-on', elmt);
        if(trigger.hasClass('fav-noupdate')){
          return;
        }
        trigger.addClass('btn-plus');
        trigger.html('Ajouter à mes listes').removeClass('fav-on btn-danger'); /*+ this.getTriggerName(trigger)*/

        switch(parameter) {
          case 'like':
            $('#top-playlist li[data-id="' + ids[key] + '"]', elmt).remove();
          break;
          case 'cinema': //reload
            if ($('#trigger-theaters-playlist').length) { //fiche programme
              console.log('UI.unloadPlaylistTriggers', 'set UI.callbackModal');
              UI.callbackModal = function() { //à la fermeture de la popin
                $('#trigger-theaters-playlist').trigger('click');
              }
            }
            $('[data-id="' + ids[key] + '"].fav-' + parameter, elmt).parents('.fav-remove:first').remove();
          break;
          default:
            $('[data-id="' + ids[key] + '"].fav-' + parameter, elmt).parents('.fav-remove:first').remove();
          break;
        }
      }
    } else {
      for(k in this.available_playlists) {
        var ids = Skhf.session.getPlaylistIds(this.available_playlists[k]);
        for (key in ids) {
          //console.log('UI.unloadPlaylistTriggers', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav-' + this.available_playlists[k] + '.fav-on');
          var trigger = $('[data-id="' + ids[key] + '"].fav-' + this.available_playlists[k] + '.fav-on', elmt);
          if(trigger.hasClass('fav-noupdate')){
            return;
          }
          trigger.html('<i class="glyphicon glyphicon-plus"></i> Ajouter à mes listes').removeClass('fav-on btn-danger');
        }
      }
    }
  },
  //notify
  loadNotifications: function(notifications) {
    global = this;
    if (typeof notifications == 'undefined') {
      console.warn('UI.loadNotifications', 'notifications undefined!');
      return;
    }
    console.log('UI.loadNotifications', notifications);
    console.log('UI.loadNotifications', Object.keys(notifications).length);
    var nb = Object.keys(notifications).length >= this.max_notifications ? this.max_notifications + '+' : Object.keys(notifications).length;
    console.log('UI.loadNotifications', 'nb', nb);
    
    // 1ere connexion: valeur de nb par defaut
    if(typeof Object.keys(notifications).length == "undefined"){
      var nb = 0;
    }

    if (!$('.navbar .notifications-count').hasClass('with-badge')) {
      $('.navbar .notifications-count').addClass('with-badge').append($(this.badge_notification).html(nb));
    }

    if (Object.keys(notifications).length == 0) {

      $('.navbar .notifications-count .badge-important').removeClass('badge-important');

    } else {

      var list = $('.navbar .notifications ul .scroll');
      list.find('li.empty').hide();
      //list.find('li:not(.empty)').remove();
      var nb_new = 0;
      var current_last_notification = this.last_notification ? this.last_notification : API.cookie('last_notification');
      console.log('ui.js', 'UI.loadNotifications', 'last_notification', this.last_notification);
      for (k in notifications) {
        if (notifications[k]['new'] == true) {
          nb_new++;
          if (notifications[k].id > this.last_notification) {
            this.last_notification = notifications[k].id;
            console.log('ui.js', 'UI.loadNotifications', 'last_notification update', this.last_notification);
          }
          //console.log('new', notifications[k]['new'], nb_new);
        }
      }
      this.appendNotifications(notifications,list);

      //reload tooltip
      $('.navbar .notifications [data-toggle="tooltip"]').tooltip();

      //new
      if (nb_new > 0) {
        var nb = nb_new >= this.max_notifications ? this.max_notifications + '+' : nb_new;
        console.log('UI.loadNotifications', 'new', current_last_notification, this.last_notification);
        $('.navbar .notifications-count .badge').addClass('ms-notificon').html(nb);

        if (current_last_notification != this.last_notification) {
          API.cookie('last_notification', this.last_notification);
          //notification HTML5
          if (nb_new == 1) {
            API.notification('mySkreen', 'Vous avez ' + nb_new + ' nouvelle notification');
          } else {
            API.notification('mySkreen', 'Vous avez ' + nb_new + ' nouvelles notifications');
          }
        }
      }
      
      //console.log('UI.loadNotifications', 'nb_new', nb_new);
      $('.navbar .notifications-count').data('count-new', nb_new);

      global.notificationBadge(nb_new);
    }
  },
   notificationBadge: function(nb_new) {
     if($('.navbar .notifications ul li .badge-important').length ){
      if (nb_new > 0) {
        $('.navbar .notifications-count .badge').addClass('badge-important').html($('.navbar .notifications ul li.tv-component .badge-important').length);
      }
     } else {
       $('.navbar .notifications-count .badge').removeClass('badge-important').html($('.navbar .notifications ul li.tv-component').length);
     }
   },
  // filter
  notificationsFilter : function(self){
    // console.log('ui.js', 'notificationsFilter', 'Check-In');
    $('.notifications .empty').css('display','none');
    $('.notifications .tv-component').addClass('hide');
    $('.notifications .divider.notification').addClass('hide');
    

    if ( self.data('filter') == 'all' ){
      $('.notifications .tv-component').removeClass('hide');
      $('.notifications .divider.notification').removeClass('hide'); 
    } else {
      if( self.data('filter') == 'tv' ){
        var classes = ['plays.broadcast','broadcasts.broadcast'];
      }else if( self.data('filter') == 'replay' ){
        var classes = ['plays.catchup','plays.webcast'];
      }else if( self.data('filter') == 'vod' ){
        var classes = ['plays.dvd', 'plays.location.48h','plays.location.itunes', 'plays.achat.itunes','plays.achat','plays.téléchargement','plays.télécharger','plays.abonnement','plays.louer']; 
      } else {
        var classes = [self.data('filter')];
      }
      for (k in classes) {
        $('.notifications .tv-component.' +  classes[k]).removeClass('hide'); 
        $('.notifications .divider.' +  classes[k]).removeClass('hide'); 
      }
    }
    if( $('.notifications .tv-component:not(.hide)').length == 0){
      $('.notifications .empty').css('display','block');
    }

  },
  //appendNotif
  appendNotifications : function(notifications,list){
    // console.log('ui.js', 'appendNotifications', 'Check-In');
    for (k in notifications) {
      if($('.dropdown-menu .tv-component [data-id="'+notifications[k].id+'"]').length == 0){
        if (notifications[k].type == 'broadcast') {
          var attrs = 'data-ajax="' + notifications[k].link +'?offers='+notifications[k].offers +'" rel="#content" data-seo-url="' + notifications[k].link + '"';
        
        } else if (notifications[k].player) {
          var attrs = 'data-ajax-play="' + notifications[k].player + '" data-ajax="' + API.config.v3_root + notifications[k].program.seo_url + '?play='+notifications[k].player + '" rel="#content" data-seo-url="' + notifications[k].program.seo_url + '"';
        } else if ( notifications[k].access == 'extrait'|| notifications[k].type == 'ajout' || notifications[k].player) {
          var attrs = 'data-ajax="' + API.config.v3_root + notifications[k].program.seo_url + '?offers='+notifications[k].offers +  '" data-offers="' + notifications[k].offers + '" rel="#content" data-seo-url="' + notifications[k].program.seo_url + '"';
        } else if (notifications[k].type == 'friend_list') {
          var attrs = 'href="' + API.config.v3_root + notifications[k].playlist.origin.object.seo_url + '"';
        } else {
          var attrs = 'data-redirect="' + notifications[k].link + '" data-seo-url="' + notifications[k].program.seo_url + '"';
        }
      
        var ep_title = notifications[k].title_episode;
        var len=32;
        if (ep_title != null &&
            ep_title.length > len) {
          var currChar = 'X';
          while (currChar != ' ' && len >= 0) {
            len--;
            currChar = ep_title.charAt(len);
          }
          if (len > 0) {
            ep_title = ep_title.substring(0,len) + '...';
          } else {
            ep_title = ep_title.substring(0,32);
          }
        }
        if (notifications[k].access == null) {
          notifications[k].access = '';
        }
        var img_offer = '';
        if (notifications[k].offers == 'friend_list') {
          img_offer = '<span class="friend_img" data-friend="' + notifications[k].friend_id + '">&nbsp;</span>';
        } else if (typeof notifications[k].channel_ico != 'undefined') {
          img_offer = '<img src="' + notifications[k].channel_ico.replace("/39/35/","/39/") + '" alt="' + notifications[k].channel_name + '" class="channel pull-left" />';
        } else {
          img_offer = '<span class="pull-left" style="width: 42px">&nbsp;</span>';
        }
        html_to_insert = '<li class="tv-component ' + notifications[k].offers + ' ' + notifications[k].access.replace("(windows)","") + '">' +
            '<a  class="more info"' + (!notifications[k].playlist || !notifications[k].playlist.origin ? '>' :
              ' data-toggle="tooltip" data-placement="left" title="' + (notifications[k].offers == 'friend_list' ? '&laquo;' + notifications[k].title + '&raquo; fait partie de vos amis.' : 'Vous suivez &laquo;' + notifications[k].playlist.origin.object_name + '&raquo;') + '"><i class="glyphicon glyphicon-question-sign"></i>') +
            '</a>' +
            '<a data-id="' + notifications[k].id + '" class="more remove">' + 
              '<i class="glyphicon glyphicon-trash"></i>' +
            '</a>' +
            (notifications[k]['new'] ? '<span id="new-notif' + notifications[k].id + '" class="pull-right badge badge-important">Nouveau</span>' : '') +
            '<a ' + attrs + (notifications[k]['new'] ? ' data-remove="#new-notif'+ notifications[k].id + '"' : '') +' class="link">' + 
              img_offer +
              '<img src="' + notifications[k].ico + '" alt="notification" class="ico pull-left" />' +
              '<span class="title">' + notifications[k].title + '</span>' +
              '<span class="subtitle">' + ep_title + '</span>' +
              '<span class="label label-' + (notifications[k].type == 'deprog' ? 'warning' : 'success') + '">' + notifications[k].subtitle + '</span>' +
            '</a>' +
          '</li>' +
          '<li class="divider notification'+' '+ notifications[k].offers+ ' ' + notifications[k].access.replace("(windows)","")+ '"></li>';

        if(notifications[k]['new']){
          list.prepend(html_to_insert);
        } else {
          list.append(html_to_insert);
        }
      }
    }
    if( $('.navbar .notifications .dropdown-menu .tv-component:not(.hide)').length == 0){
      $('.navbar .notifications .empty').css('display','block');
    }
    Skhf.session.getSocialDatas(function(friends, friends_programs) {
      for (k in friends) {
        console.log('ui.js', 'appendNotifications', 'callback getSocialDatas', 'friend', friends[k]);
        $('.friend_img[data-friend="' + friends[k].id + '"]').html('<img src="' + friends[k].pic_square + '" width="45" alt="' + friends[k].name + '" class="pull-left"/>');
      }
    });
  },

  //update friends
  loadSocialSelector: function() {
    var self = this;

    if (Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
      console.log("-------------",Skhf.session);
      this.appendLoader($('li#friends'));
      Skhf.session.loadSocialSelector(function(datas){
        console.log('UI.loadSocialSelector', 'Session.loadSocialSelector callback', datas);
        self.removeLoader($('li#friends'));
        if (typeof datas.error == 'undefined' ||
            typeof datas.programs == 'undefined' ||
            Object.keys(datas.programs).length > 0) { //Warning : Error sent by API even if results ?!
          if (typeof datas.programs != 'undefined' &&
              Object.keys(datas.programs).length > 0) {
            var program = datas.programs[0];
            var li = $('li#friends', this.playlist.elmt);
            li.removeClass('empty');
            li.css({
              'background-image': 'url('+program.picture+')',
              'background-repeat': 'no-repeat',
              'background-position': '0px 10px'
            });
            li.find('.label').removeClass('opacity');
            li.find('span.badge, .alert').remove();
            li.find('a, h6').hide();
            li.popover('disable');
            Skhf.session.getSocialDatas(function(friends) {
              console.log("AMIS : ",friends);
              li.find('.label span').html(friends.length);
            });
          }
        } else {
          $('li#friends').append('<p class="alert">Oups, erreur !</p>');
        }
      });
    }
  },
  //playlist theaters
  loadTheatersPlaylist: function(callback){
    if (Skhf.session.datas.cinema && 
        $('#cinema.slider').length) {
      console.log('UI.loadTheatersPlaylist', Skhf.session.datas.cinema);
      $('.theaters-off:not(.hide)').addClass('hide');
      $('.theaters-on.hide').removeClass('hide');

      API.query('GET', 'channel.json', {
          type: 'cinema',
          ids: Skhf.session.datas.cinema
        },
        function(datas){
          console.log('UI.loadTheatersPlaylist', 'callback', datas, this.sliders);
          $('#theaters-names').empty();
          for (k in datas) {
            $('#theaters-names').append('<a data-id="' + datas[k].id + '" class="label label-default label-info">' + datas[k].name + '</a>');
            $('#theaters-playlist [data-modal="remote"]').attr('href', $('#theaters-playlist [data-modal="remote"]').attr('href') + datas[k].id + ',');
          }
          UI.sliders['cinema'] = new BaseSlider({
            'url': 'schedule/cine.json?with_schedule=1&programs_only=1&theater_ids=' + Skhf.session.datas.cinema }, 
            function(){
              var nb_items = $('#cinema.slider ul.items li').length;
              var pluriel = nb_items > 1 ? 's' : '';
              $('.bande_listes .col-xs-5 .user-on .meslistes-plus').html('<i class="glyphicon glyphicon-collapse-down"></i> &nbsp;'+nb_items+' film'+pluriel+' dans vos salles&nbsp;');
              $('.bande_listes .col-xs-5 .user-on .meslistes-plus').data('toggle-text', 'Fermer&nbsp;<i class="glyphicon glyphicon-collapse-up"></i>');
              if (typeof callback != 'undefined') {
                callback();
              }
            }, 
            $('#cinema.slider')
          );
      });
    }
  },
  unloadTheatersPlaylist: function(){
    $('.theaters-on:not(.hide)').addClass('hide');
    $('.theaters-off.hide').removeClass('hide');
  },
  loadReplayPlaylist: function(callback){
    if($('#replay.slider').length) {
      UI.sliders['replay'] = new BaseSlider({
        'url': 'www/slider/queue/'+Skhf.session.uid+'/access/replay.json?nb_results=10&programs_only=1&offset=0&channel_img_width=50&img_width=150&img_height=200&url=&with_best_offer=1'},
        function(){
          var nb_items = $('#replay.slider ul.items li').length;
          var pluriel = nb_items > 1 ? 's' : '';
          $('.bande-couleur-replay .col-xs-5 .user-on .meslistes-plus').html('<i class="glyphicon glyphicon-collapse-down"></i> &nbsp;'+nb_items+' programme'+pluriel+' en Replay&nbsp;');
          $('.bande-couleur-replay .col-xs-5 .user-on .meslistes-plus').data('toggle-text', 'Fermer&nbsp;<i class="glyphicon glyphicon-collapse-up"></i>');
          if (typeof callback != 'undefined') {
            callback();
          }
        },
        $('#replay.slider')
      );
    }
  },
  loadWebtvPlaylist: function(callback){
    if($('#webtv.slider').length) {
      UI.sliders['webtv'] = new BaseSlider({
        'url': 'www/slider/queue/'+Skhf.session.uid+'/access/webtv.json?nb_results=10&programs_only=1&offset=0&channel_img_width=50&img_width=150&img_height=200&url=&with_best_offer=1'},
        function(){
          var nb_items = $('#webtv.slider ul.items li').length;
          var pluriel = nb_items > 1 ? 's' : '';
          $('.bande-couleur-webtv .col-xs-5 .user-on .meslistes-plus').html('<i class="glyphicon glyphicon-collapse-down"></i> &nbsp;'+nb_items+' vidéo'+pluriel+'&nbsp;');
          $('.bande-couleur-webtv .col-xs-5 .user-on .meslistes-plus').data('toggle-text', 'Fermer&nbsp;<i class="glyphicon glyphicon-collapse-up"></i>');
          if (typeof callback != 'undefined') {
            callback();
          }
        },
        $('#webtv.slider')
      );
    }
  },
  loadTVPlaylist: function(callback){
    if($('#tv.slider').length) {
      UI.sliders['tv'] = new BaseSlider({
        'url': 'www/slider/queue/'+Skhf.session.uid+'/access/tv.json?nb_results=10&programs_only=1&offset=0&channel_img_width=50&img_width=150&img_height=200&url=&with_best_offer=1'},
        function(){
          var nb_items = $('#tv.slider ul.items li').length;
          var pluriel = nb_items > 1 ? 's' : '';
          $('.bande_listes .col-xs-5 .user-on .meslistes-plus').html('<i class="glyphicon glyphicon-collapse-down"></i> &nbsp;'+nb_items+' programme'+pluriel+' à venir&nbsp;');
          $('.bande_listes .col-xs-5 .user-on .meslistes-plus').data('toggle-text', 'Fermer&nbsp;<i class="glyphicon glyphicon-collapse-up"></i>');
          if (typeof callback != 'undefined') {
            callback();
          }
        },
        $('#tv.slider')
      );
    }
  },
  //update selector
  loadSelector: function(datas) {
    if($('#playlist').length==0){
      return;
    }
    var self = this;
    console.log('UI.loadSelector', datas, Skhf.session.onglet);
    this.unloadSelector();
    $('li.selector', this.playlist.elmt).css({
      'width': '150px',
      'display': 'block'
    });
    $('#playlist').removeClass('in-selection');

    for (key in datas) {
      var group = datas[key];
      //console.log('UI.loadSelector', key, group);
      var li = $('li#' + key, this.playlist.elmt);

      li.removeClass('empty');
      li.css({
        'background-image': 'url('+group.img+')',
        'background-repeat': 'no-repeat',
        'background-position': '0px 10px'
      });
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.find('.label span').html(group.nb_programs);
      li.find('span.badge').remove();
      if (group.nb_notifs > 0){
        li.prepend($(this.badge_notification.replace('%count%', 'nouveaux')).addClass('badge-important')); //group.nb_notifs));
      }
      li.find('a, h6').hide();
      li.popover('disable');
    }

    //show selector
    this.unloadPlaylist(Skhf.session.onglet, function() {
          $('#top-playlist li.selector').animate({'width': API.config.slider.width}, 500, function(){
          $('#top-playlist li.selector').show();
          if (self.playlist.elmt.hasClass('empty')) {
            self.playlist.elmt.removeClass('empty');
          }
      });
      // autorise le click sur les selectors et enlève le loaders si les sélecteurs sont déja initiés.
      $('#top-playlist li.selector').promise().done(function(){
        console.log('UI.loadSelector','Remove Loading Bar');
        $('.loading.bar').remove();
        UI.playlist.elmt.removeClass('slider-loading');
        $("#playlist .items li").unbind('click.loading');
      });
   });

    this.loadSocialSelector();
  },
  unloadSelector: function() {
    var self = this;
    var lis = $('li.selector', this.playlist.elmt);
    lis.addClass('empty').css('background-image', '');
    lis.find('.label').addClass('opacity').find('span').empty();

    lis.find('span.badge').remove();
    lis.find('a, h6').show();
    $('#top-playlist .breadcrumb li:not(:first)').empty();
    lis.popover('enable');
    
  },
  loadMeslistes: function() {
    var callback = function(){
       if ($('.slider-meslistes .items li').length) {
        if ($('.btn.meslistes-plus[data-toggle-display]').length) {
          $('.btn.meslistes-plus[data-toggle-display]').trigger('click');
        }
       }
    }
    if (Skhf.session.datas.cinema) {
      this.loadTheatersPlaylist(callback);
    } else if ($('#cinema.slider-meslistes').length) {
      $('#cinema.slider-meslistes').addClass('empty');
    }
    this.loadReplayPlaylist(callback);
    this.loadWebtvPlaylist(callback);
    this.loadTVPlaylist(callback);
  },
  loadPlaylist: function(access, onglet){
    var self = this;
    console.log('UI.loadPlaylist', access, onglet, Skhf.session);

    if (Skhf.session.datas.email) {
      //hide selector
      $('li.selector', this.playlist.elmt).animate({'width':0}, 500, function() {
        $(this).hide();
      });

      //load playlist
      Skhf.session.access = access;
      if (typeof onglet != 'undefined') { //, with_player: 1, player: API.config.player
        $.extend(self.playlist.params.args, {onglet: onglet, with_best_offer: 1, time: new Date().getTime()});
      } else {
        $.extend(self.playlist.params.args, {with_best_offer: 1, time: new Date().getTime()});
      }
      if (access) {
        Skhf.session.getFriendsUids(function(friends_uids){
          $.extend(self.playlist.params.args, {friends_uids: friends_uids}); //, api_method: 'POST'
        })
      }
      console.log('UI.loadPlaylist', 'self.playlist.params.args', self.playlist.params.args);
       
      this.playlist.loadRemotePrograms(
        0,
        function(slider){
          var nb_programs = slider.data('nb-programs');
          console.log('UI.loadPlaylist', 'callback', Skhf.session.access, 'cookie:' + API.cookie('playlist_collapsed'), 'isHome:' + API.isHome(), slider);
                                        
          if (Skhf.session.access) {
            var name = $('li#' + Skhf.session.access, slider.elmt).data('name');
            if (typeof name != 'undefined') {
              $('#top-playlist .breadcrumb li:nth-child(2)').html(name);
            }
          }
          $('li.selector', slider.elmt).hide();
          //if ((Skhf.session.access != 'tv' && nb_programs > 0 && !API.cookie('playlist_collapsed')) ||
          //    API.isHome() == true) {
          //  $('#top-playlist').collapse('show');
          //}
      });
    }
  },
  unloadPlaylist: function(onglet, callback) {
    var self = this;
    console.log('UI.unloadPlaylist', onglet, Skhf.session.onglet);
    //if (typeof onglet != 'undefined' && 
    //    onglet != Skhf.session.onglet) {
    //  Skhf.session.initPlaylist('/' + onglet);
    //}
     $('li:not(.static)', this.playlist.elmt).animate({'width':0}, 500, function() {
      //$('li.static', self.playlist.elmt).show().animate({'width': self.playlist.item_width}, 500);
      self.playlist.remove();
      if (typeof callback != 'undefined') {
         callback();
      }
    });
    $('#top-playlist .breadcrumb li:not(:first)').empty();
    

  },
  markAsRed: function(id) {
    $('.navbar .notifications ul li[data-id="' + id + '"] .badge').remove();
    var remaining = parseInt($('.notifications-count .badge-important').html())-1;
    if (remaining > 0) {
      $('.navbar .notifications-count .badge').addClass('badge-important').html(remaining);
    }
  },
  //paywall
  paywall: function(id, subscription_id, callback) {
    var self = this;
    console.log('UI.paywall', id, subscription_id);

    API.quickLaunchModal('signin', function() {
      console.log('UI.paywall', 'callback', Skhf.session.datas);
      $('#skModal.modal .modal-message').html(
        '<p><b>Votre vidéo en 1 clic et en Haute Qualité.</b><br/>' +
        'Regardez vos vidéos sur tous vos écrans : PC, Mac, iOs et Android</p>'
      );
      //if (!Skhf.session.datas.email) {
      //  self.paywall(id, subscription_id, callback);
      //}
    },
    {
      parcours: 'anonyme_favoris', 
      occurrence_id: id, 
      subscription_id: typeof subscription_id != 'undefined' ? subscription_id : null
    });
    
  },
  // -- launch player
  play: function(id, args) {
    $('.popover:visible').popover('hide');
    //if (Player.getType() == 'ios') {
    //  Player.playOccurrence(id);
    
    //} else {
    console.log('UI.play', id, args);

    if (typeof args.current_player == 'undefined' && $('#program-teaser-player').length) {
      args.current_player = '#program-teaser-player';
    }

    if (typeof args.current_player != 'undefined' && args.current_player) {
      Player.playOccurrence(id, function(){}, args);
    } else {
      //var args = $.extend({type: 'occurrence', id: id, session_uid: Skhf.session.uid, hide_sliders: 1}, args);
      //Couchmode.init(args);
      
      Player.elmt = $('#player.default-player');
      if (Player.elmt.hasClass('default-player')) {
        Player.elmt.addClass('in');
        $('body').append('<div class="modal-backdrop modal-player in"></div>');
        $('.close', Player.elmt).on('click', function() {
          $('iframe', Player.elmt).remove();
          Player.elmt.removeClass('in');
          $('.modal-backdrop.modal-player').remove();
        })
      }
      Skhf.Player = new Skhf.BasePlayer(Player.elmt.attr('id'), {playId: id});
    }
  },
  loadPlayer: function(trigger) {
    var self = this;
    Player.load(trigger);
  },
  loadRedirect: function(url, link_fiche) {
    console.log('UI.loadRedirect', url);
    $('body').removeClass('view-ajax');
    $('body').addClass('view-redirect');
    Player.redirect(url, $('#redirect'), $('#content'));
    $('#redirect').prepend(
      '<div class="container container-redirect collapse in">' +
      '<p>' +
      'Vous visitez un site partenaire. ' +
      (typeof link_fiche != 'undefined' ? '<a data-ajax="' + link_fiche + '" rel="#content">› Voir le programme sur mySkreen</a>&nbsp; ' : '') +
      '<a data-redirect="unload">› Revenir à mySkreen.com</a></p>' +
      '</div>' +
      '<a class="close-redirect" data-redirect="unload">&times Fermer</a>'
    );
    //window.onbeforeunload = API.quickLaunchModal('signin', function() {
    //  alert('leave');
    //  window.onbeforeunload = null;
    //});
  },
  unloadRedirect: function(url) {
    $('body').removeClass('view-redirect');
    $('#content').show();
    $('#redirect').empty();
  },
  // -- insert loader
  appendLoader: function(elmt, timer) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .progress-bar', elmt).animate({'width': '100%'}, typeof timer != 'undefined' ? timer : 5000);
  },
  // -- remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress, .loader').remove();
  },
  // -- add friends
  addFriends: function(container, friend_uids){
    //console.log('UI.addFriends', container.data('id'), friend_uids);

    Skhf.session.getSocialDatas(function(friends, friends_programs) {
      console.log('UI.addFriends', 'callback Session.getSocialDatas', friends);
      var div = $('<div class="friends remove-on-signout"></div>');
      for (k in friend_uids) {
        console.log('UI.addFriends', friend_uids[k], friends[friend_uids[k]]);
        if (typeof friends[friend_uids[k]] != 'undefined') {
          var friend = friends[friend_uids[k]];
          div.append('<a rel="tooltip" data-container="body" data-placement="bottom" data-trigger-fb="' + friend_uids[k] + '" title="Envoyer un message sur ce programme à ' + friend.name + '." href="#"><img src="' + friend.pic_square + '" alt="' + friend.name + '" /></a>');
        }
      }
      $('a[rel="tooltip"]', div).tooltip();
      div.appendTo(container);
    });
  },
  addFriendsPrograms: function(){
    //return; //desactivated
    Skhf.session.getSocialDatas(function(friends, friends_programs){
      //console.log('UI.addFriendsPrograms', 'callback', friends_programs);
      for (k in friends_programs) {
        var elmts = API.config.env == 'dev' ? $('.slider li[data-id="' + k + '"], .add-friends[data-id="' + k + '"]') : $('.slider-playlist li[data-id="' + k + '"]');
        if (elmts.length > 0 && !$('.friends', elmts).length) {
          console.log('UI.addFriendsPrograms', 'add ' + friends_programs[k].length + ' friends to program ' + k, elmts);
          UI.addFriends($('.container-friends', elmts), friends_programs[k]);
        }
      }
    });

  },
  // -- typeahead
  typeahead: function(searchbox){
    var self = this;
    //console.log('UI.typeahead', searchbox);
    if($(searchbox).length == 0){
      return;
    }
    $(searchbox).typeahead({
      items: 5,
      minLength: 3,
      source: function(typeahead, query) {
        console.log('UI.typeahead', 'source', query);
        query = query.replace('+', '%2B')
        self.getTypeaheadSuggestions(typeahead, query, searchbox);
      },
      onselect: function(obj) {
        console.log('UI.typeahead', 'onselect', obj, searchbox, $(searchbox).attr('value'));
        $(searchbox).val(' chargement ...');

        if (typeof obj != 'object') { //typeahead
          top.location = API.config.v3_url + '/programmes/' + obj;
        } else if (typeof obj.seo_url != 'undefined') { //advanced
          //alert('VALUE'+obj.name);
          if (obj.seo_url.match(/^http:\/\//)) {
            top.location = obj.seo_url;
          } else {
            top.location = API.config.v3_url + obj.seo_url;
          }
        }
      }
    });
  },
  startSearching: function(to_focus) {
    if (!$('body').hasClass('searching') && 
        !$('.modal:visible').length && 
        !$('input:focus').length) {
      if (!$('#search-query-bg').length) {
        $('body').prepend('<div id="search-query-bg"></div>');
      } else {
        $('#search-query-bg').fadeIn();
      }
      if (to_focus != false) {
        $('.search-query').focus();
      }
      $('body').addClass('searching');
    }
  },
  endSearching: function() {
    if ($('body').hasClass('searching')) {
      $('#search-query-bg').fadeOut();
      $('body').removeClass('searching');
      $('.search-query').blur();
    }
  },
  getTypeaheadSuggestions: function (typeahead, query, searchbox) {
    console.log('UI.getTypeaheadSuggestions', query);

    if (query.length < 3 || query == null) {
      console.warn('UI.getTypeaheadSuggestions', 'aborted : short query', query);
      return;
    }

    $('.mini-loading.mini-bar').removeClass('hide');

    API.xhr['typeahead'] = API.query(
      'GET', 
      'search/autosuggest/' + query + '.json', 
      {
        session_uid: Skhf.session.uid, 
        img_width: 30, 
        img_height: 30, 
        advanced: 1, 
        with_unvailable: 1,
        with_loader: 1
      }, 
      function(data) {
        if (typeahead.query != $(searchbox).val()) {
          console.warn('UI.typeahead', 'outdated response', typeahead.query);
          return;
        }

        console.log('UI.typeahead', query, data);
        if (data.channels || data.theaters || data.programs || data.episodes || data.persons || data.queue || data.categories || data.sagas || data.packs) {
          var lis = new Array;
          var titles = new Array;
          typeahead.query = typeahead.$element.val();
          typeahead.$menu.empty();

          if (!typeahead.query) {
            return typeahead.shown ? typeahead.hide() : typeahead;
          }

          for (key in data) {
            switch (key) {
              case 'queue':
                var items = data[key].programs;
                titles[key] = 'Vos listes';
                break;
              case 'channels':
                var items = data[key];
                titles[key] = 'Chaînes';
                break;
              case 'sagas':
                var items = data[key];
                titles[key] = 'Sagas';
                break;
              case 'packs':
                var items = data[key];
                titles[key] = 'Sélections';
                break;
              case 'theaters':
                var items = data[key];
                titles[key] = 'Salles de cinéma';
                break;
              case 'programs':
                var items = data[key];
                titles[key] = 'Programmes';
                break;
              case 'episodes':
                var items = data[key];
                titles[key] = 'Episodes';
                break;
              case 'persons':
                var items = data[key];
                titles[key] = 'Personnes';
                break;
              case 'categories':
                var items = data[key];
                titles[key] = 'Genres';
                break;
            }
            console.log('UI.typeahead', 'data', key, items);
            //cast as array
            items = $.map(items, function (value, key) { return value; });
            items = items.slice(0, typeahead.options.items);
            if (items.length) {
              lis[key] = $(items).map(function (i, item) {
                i = $(typeahead.options.item).attr('data-value', JSON.stringify(item));
                i.attr('data-id', item.id).addClass('actions');
                btn = $('<span class="btn btn-xs btn-suivre btn-plus" data-placement="left">Ajouter à mes listes</span>');
                switch (key) {
                  case 'queue':
                    i.addClass('playlist')
                     .css('overflow','hidden')
                     .find('a')
                     .html((item.picture ? '<img src="' + item.picture + '" /> ' : '') + typeahead.highlighter(item.title))
                    break;
                  case 'theaters':
                    i.addClass('theater')
                     .css('overflow','hidden')
                     .prepend(btn.clone().addClass('fav-theater'))
                     .find('a')
                     .html(typeahead.highlighter(item.name + (item.ville ? ' (' + item.ville + ')' : '')))
                    break;
                  case 'channels':
                    i.addClass('channel')
                     .css('overflow','hidden')
                     .prepend(btn.clone().addClass('fav-channel').attr('data-channel-name', item.name))
                     .find('a')
                     .html((item.icon ? '<img src="' + item.icon + '" /> ' : '') + typeahead.highlighter(item.name))
                    break;
                  case 'sagas':
                    i.addClass('saga')
                     .css('overflow','hidden')
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                  case 'packs':
                    i.addClass('pack')
                     .css('overflow','hidden')
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                  case 'programs':
                    i.addClass('program')
                      .css('overflow','hidden')
                     .prepend(btn.clone().addClass('fav-program'))
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                  case 'episodes':
                    i.addClass('episode')
                      .css('overflow','hidden')
                     .prepend(btn.clone())
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                  case 'persons':
                    i.addClass('person')
                     .css('overflow','hidden')
                     .prepend(btn.clone().addClass('fav-person'))
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                  case 'categories':
                    i.addClass('category')
                     .css('overflow','hidden')
                     .find('a')
                     .html(typeahead.highlighter(item.name))
                    break;
                }
               
                console.log('UI.typeahead', 'add item', key,  i);
                return i[0];

              });
            }
          }

          //data.first().addClass('active')
          //var sort = Array('channels','theaters','real-channels','programs','persons','categories','queue');
          var sort = Array('queue','channels','sagas','programs','episodes','persons','theaters','categories','packs');
          for (key in sort) {
            if (lis[sort[key]]) {
              //console.log('UI.typeahead', key, data[key], typeahead.$menu);
              if (typeof titles[sort[key]] != 'undefined' && typeof lis[sort[key]] != 'undefined') {
                typeahead.$menu.append('<li class="nav-header">' + titles[sort[key]] + '</li>');
              }
              typeahead.$menu.append(lis[sort[key]]);
            }
          }

          //toggle playlist
          $('span.fav-*', typeahead.$menu).on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            UI.togglePlaylist($(this));
            if (Skhf.session.datas.email) {
              API.notification('Ajouté à vos listes | mySkreen', $(this).parent().find('a').text());
            }
          });
          $('.mini-loading.mini-bar').addClass('hide');
          //$('li:first-child:not(.nav-header)', typeahead.$menu).addClass('active');
          typeahead.show();
        } else {
          $('.mini-loading.mini-bar').addClass('hide');
          return typeahead.shown ? typeahead.hide() : typeahead
        }
      }
    );
  },
  editSkModal: function(header,body,footer,header_size,body_size,close){
    $('#skModal .modal-header').children().remove();
    $('#skModal .modal-body').children().remove();
    $('#skModal .modal-footer').children().remove();
    
    if (typeof header != 'undefined'){
      if( typeof close != 'undefined' && close == 'true'){
      $('#skModal .modal-header').append('<button type="button" class="close" data-dismiss="modal">×</button>')
      }
      $('#skModal .modal-header').append('<h'+ header_size+'>'+ header + '</h'+ header_size+'>');
    }
      
    if (typeof body != 'undefined'){
      $('#skModal .modal-body').append('<h'+ body_size+'>'+ body + '</h'+ body_size+'><br><div>L\'équipe de mySkreen</div>');
    }
    if (typeof footer != 'undefined'){
      $('#skModal .modal-footer').prepend('<img src="http://mskstatic.com/150/medias/logo_white.png"/>');
      $('#skModal .modal-footer').append('<button type="button" class="btn btn-info btn-large alert_mobile" data-dismiss="modal">'+ footer +'</button>');
    }
  },
  keynav: function(){
  },
  focus: function(){
  },
  error: function(){
  },
  refreshChannel: function(channel_id){
    
    var args = {
                onglet: $('#onglet button.active').data('onglet'),
                //access: $('#access button.active').data('access'),
                url: null
               };

    var option = $('.trigger-channel-date').find(':selected');
    var show   = option.data('show');
    switch (show) {
      case 'epg':
        $('#channel-epg, #channel-epg-title').show();
        $('#channel-replay, #channel-replay-title').hide();
      break;
      case 'replay':
        $('#channel-epg, #channel-epg-title').hide();
        $('#channel-replay, #channel-replay-title').show();
        console.log($('#channel-replay, #channel-replay-title'));
      break;
      default:
        $('#channel-epg, #channel-epg-title, #channel-replay, #channel-replay-title').show();
      break;
    }

    console.log('view channel', 'reset', args);

    if (!show || show == 'replay') {
      args.date = !show ? 'Replay' : option.val();
      var url = 'recommend/from_channel/' + channel_id + '.json?with_method=epg&' + $.param(args);
      UI.sliders['channel-replay'].reset(url);
    }

    if (!show || show == 'epg') {
      args.date = !show ? 'Epg' : option.val();
      var url = 'recommend/from_channel/' + channel_id + '.json?with_method=epg&' + $.param(args);
      UI.sliders['channel-epg'].reset(url);
    }
  }
}

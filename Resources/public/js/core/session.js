// -- BaseSession
var BaseSession = Class.extend({
 uid: '',
 user: null,
 datas: {},
 credentials: [],
 sync_args: { 'short': 1 },
 onglet: '',
 access: '',
 idle_timeout: 60000,
 social_state: null,
 callbackInit: null,
 callbackSignout: null,
 callbackSignin: [],
 callbackSocial: [],
 init: function(callback, args) {
    console.log('BaseSession.init', args);
    var self = this;
    this.uid = API.cookie('session_uid');
    if (typeof callbackSignin != 'undefined') {
      console.log('scripts', '_default.js', 'Skhf.session', 'self.callbackSignin', self.callbackSignin);
      self.callbackSignin['init'] = callbackSignin;
    }
    if (typeof callbackInit != 'undefined') {
      self.callbackInit = callbackInit;
      //console.log('scripts', '_default.js', 'Skhf.session', 'self.callbackInit', self.callbackInit);
    }
   //update default sync args & launch sync
   console.log('core/session.js', 'this.uid', this.uid);
   if (this.uid) {
     $.extend(this.sync_args, typeof args == 'undefined' ? {} : args);
     this.sync(function(sessionData){
       console.log('BaseSession.init', 'callback Session.sync', sessionData);
       //callbackInit : called only once
       if (self.callbackInit) {
         self.callbackInit(self);
         self.callbackInit = null;
       }
       //callback
       if (typeof callback != 'undefined') {
         callback(sessionData, self)
       }
     }, args);
   } else {
     //callback
     if (typeof callback != 'undefined') {
       callback({}, this)
     }
     console.log('core/session.js', self.callbackInit);
    //callbackInit : called only once
     if (self.callbackInit) {
       self.callbackInit(this);
       self.callbackInit = null;
     }
   }
 },
 sync: function(callback, args) {
   var self = this;
   var args = $.extend(this.sync_args, typeof args == 'undefined' ? {} : args, {time: new Date().getTime()} );
   console.log('BaseSession.sync', this.uid, 'cookie:' + API.cookie('session_uid'), 'args:', args);
   if (this.uid == null) {
     this.uid = API.cookie('session_uid');
   }

   // callback with signin only if not already signed in else update datas
   var callback_signin = function(sessionData) {
     //console.log('BaseSession.sync', 'API.query callback', callback);
     if (!Skhf.session.datas.email) {
       self.signin(sessionData, function(){
         console.log('BaseSession.sync', 'Session.signin callback', callback);
         if (typeof callback != 'undefined' && callback) {
            console.log('BaseSession.sync', 'Session.signin callback sessionData', sessionData);
           callback(sessionData, this)
         }
       });
     } else {
      if (typeof Skhf.session.datas.friends != 'undefined') {
        var friends = Skhf.session.datas.friends;
        var friends_playlists = Skhf.session.datas.friends_playlists;
        Skhf.session.datas = sessionData;
        Skhf.session.datas.friends = friends;
        Skhf.session.datas.friends_playlists = friends_playlists;
      } else {
        Skhf.session.datas = sessionData;
      }
      UI.loadUser();
      if (typeof callback != 'undefined' && callback) {
        callback(sessionData, this)
      }
      Skhf.session.update();
    }
  }

   // exists
   if (this.uid) {
     $.extend(args, this.sync_args);
     API.query('GET', 'session/' + this.uid + '.json', args, function(sessionData) {
       callback_signin(sessionData);
     });
   // create
   } else {
    console.log('core/session.js', 'callback_signin', 'this.uid', this.uid);
     $.extend(args, this.sync_args);
     API.query('POST', 'session.json', args, function(sessionData) {
       callback_signin(sessionData);
     });
   }
 },
 signin: function(sessionData, callback) {
   console.log('BaseSession.signin', sessionData, callback, 'callbackSignin:'+this.callbackSignin.length);
   //already logged ?
   if (this.datas.email) {
     console.error('BaseSession.signin', 'user already logged to current session', this.datas, sessionData);
     return;
   }

   this.datas = sessionData;
   this.uid = this.datas.uid;
   if (typeof this.datas.credential != 'undefined') {
     this.credentials = this.datas.credential.split(',');
   }
   API.cookie('session_uid', this.uid);

   if (this.datas.email) {
     this.user = this.datas.email;
     this.update(true);
     UI.loadUser();
   }

   if (typeof callback != 'undefined') {
     //console.log('BaseSession.signin callback', callback);
     callback(sessionData);
   }
   if (this.callbackSignin) {
     if (typeof this.callbackSignin == 'object') {
       for(c in this.callbackSignin) {
         this.callbackSignin[c](sessionData);
       }
     } else {
       this.callbackSignin(sessionData);
     }
   }
 },
 signout: function(callback) {
   var self = this;

   API.query('POST', 'session/signout.json', {session_uid: this.uid}, function(){
     if (typeof callback != 'undefined') {
       callback();
     }
     if (self.callbackSignout) {
       self.callbackSignout();
     }
   });

   this.datas = '';
   this.user = '';
   this.social_state = null;

   API.cookie('session_uid', null);
   API.cookie('playlist_collapsed', null);

   UI.loadUser();
 },
 update: function(notimeout) {
   var self = this;
   if (this.datas.email) {
     setTimeout(function(){
       console.log('Session.update', 'callback');
       API.query('GET', 'notification.json', {
        session_uid: self.uid, 
        with_origin: 1,
        title_max_length: 30,
        nb_results: 20,
        offset: 0,
        title_max_length: 30,
        time: new Date().getTime()
       },function(notifications){
        console.log('scripts/core.js', 'update', 'notifications', notifications);
        UI.loadNotifications(notifications);
        self.update();
       })
     }, typeof notimeout != 'undefined' && notimeout ? 0 : self.idle_timeout);
   }
 },
 readNotifications: function(){

   API.query('POST', 'notify/' + this.uid + '.json', {}, function(resp){
     console.log('BaseSession.readNotification', resp);
   });
 },
 deleteNotification: function(id){
   if (!this.uid){
     console.error('Not connected yet', this.uid);
     return false;
   }

   var args = {
     'session_uid': this.uid,
     'id': id,
     'delete': 1
   };

   API.query('POST', 'notify.json', args, function(resp){
     console.log('BaseSession.deleteNotification', resp, args);
   });
 },
 getNbPlaylists: function() {
   return parseInt(this.getPlaylistIds('like').length) + 
          parseInt(this.getPlaylistIds('cinema').length) + 
          parseInt(this.getPlaylistIds('channel').length) + 
          parseInt(this.getPlaylistIds('page').length) + 
          parseInt(this.getPlaylistIds('person').length) + 
          parseInt(this.getPlaylistIds('user').length) + 
          parseInt(this.getPlaylistIds('category').length) + 
          parseInt(this.getPlaylistIds('format-category').length) ;
 },
 isInPlaylist: function(playlist,id){
    //console.log('BaseSession.isInPlaylist', this.getPlaylistIds(playlist), $.inArray(id+'', this.getPlaylistIds(playlist)));
   return $.inArray(id+'', this.getPlaylistIds(playlist)) != -1 ? true : false;
 },
 getPlaylistIds: function(playlist) {
   //console.log('BaseSession.getPlaylistIds', playlist);
   switch (playlist) {
     case 'like':
       var ids = this.datas.queue;
     break;
     case 'cinema':
       var ids = this.datas.cinema;
     break;
     case 'channel':
       var ids = this.datas.channel;
     break;
     case 'page':
       var ids = this.datas.page;
     break;
     case 'person':
       var ids = this.datas.person;
     break;
     case 'user':
       var ids = this.datas.user;
     break;
     case 'category':
       var ids = this.datas.category;
     break;
     case 'format-category':
       var ids = this.datas.format_category;
     break;
     default:
       var ids = null;
     break;
   }
   if (ids == null || ids == "") {
     ids = [];
   } else if (typeof ids != 'object') {
     ids = ids.split(',');
   }
   console.log('getPlaylistIds', playlist, ids);
   return ids;
 },
 getSocialDatas: function(callback){
   var self = this;
   console.log('BaseSession.getSocialDatas', 'self', self);
   //console.log('BaseSession.getSocialDatas');

   //no fbuid
   // if (!this.datas.fb_uid) {
   //   console.log('BaseSession.getSocialDatas', 'no fbuid');
   //   return;
   // }

   //already loaded
   if (this.social_state == 'done') {
     if (typeof callback != 'undefined') {
       console.warn('BaseSession.getSocialDatas', 'state=done');
       console.log('BaseSession.getSocialDatas', 'friends', self.datas.friends);
       callback(typeof self.datas.friends != 'undefined' ? self.datas.friends : [], self.datas.friends_programs);
     }

   //currently loading
   } else if (!this.datas.email || this.social_state == 'processing') {
     console.warn('BaseSession.getSocialDatas', 'state=processing', 'add callback', this.callbackSocial);
     this.callbackSocial.push(callback);

   //initialize
   } else {
     if (this.social_state == null) {
       console.warn('BaseSession.getSocialDatas', 'set state=processing');
       this.social_state = 'processing';
       this.callbackSocial.push(callback);
     }
     // load from IndexedDb ?
     // API.selectIndexedDb('skhf', 'friends', 1, function(IndexedDbDatas){
     //   console.log('BaseSession.getSocialDatas', 'selectIndexedDb', IndexedDbDatas);
     //   self.social_state = 'done';

     //   if (IndexedDbDatas) {
     //     console.log('BaseSession.getSocialDatas', 'IndexedDbDatas', IndexedDbDatas);
     //     if (IndexedDbDatas.updated_at > (new Date()).getTime() - 3600*1000) {
     //       self.datas.friends = IndexedDbDatas.friends;
     //       self.datas.friends_programs = IndexedDbDatas.friends_programs;
     //       for (k in self.callbackSocial) {
     //         self.callbackSocial[k](self.datas.friends, self.datas.friends_programs);
     //       }
     //       return;
     //     } else {
     //       API.deleteIndexedDb('skhf', 'friends', 1);
     //     }
     //   }
       //fail : load from API
       Facebook.getFriends(function(friends){
        self.sync(function(sessionDatas){
           self.social_state = 'done';
           console.log('BaseSession.getSocialDatas', 'sync session callback', sessionDatas, self.callbackSocial);
           self.datas.friends = sessionDatas.friends;
           for (k in friends) {
            if (typeof self.datas.friends[friends[k].id] != 'undefined') {
              self.datas.friends[friends[k].id].name = friends[k].name;
              self.datas.friends[friends[k].id].pic_square = friends[k].picture.data.url;
            }
           }
           self.datas.friends_programs = sessionDatas.friends_playlists;
           console.log('BaseSession.getSocialDatas', 'self.datas.friends', self.datas.friends);
           console.log('BaseSession.getSocialDatas', 'self.datas.friends_programs', self.datas.friends_programs);

           for (k in self.callbackSocial) {
             console.log('BaseSession.getSocialDatas', 'callback', self.callbackSocial[k]);
             self.callbackSocial[k](self.datas.friends, self.datas.friends_programs);
           }

           API.insertIndexedDb('skhf', 'friends', {
             id: 1, 
             friends: self.datas.friends, 
             friends_programs: self.datas.friends_programs,
             updated_at: (new Date()).getTime()
           });
         },{
           fields: 'friends,friends_playlists',
           friendsuids: Facebook.getFriendsUids(friends).join(',')
         });
       });
     // });
   }
 },
 getFriendsUids: function(callback){
   this.getSocialDatas(function(friends) {
     var uids = new Array();
     for (k in friends) {
       uids.push(k);
     }
     callback(uids);
   });
 },
 checkCredentials: function(){
   //return;
   if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        if (typeof this.datas.credential != 'undefined' &&
                    this.datas.credential == 'tester') {
          $('*[data-factory]').each(function(){
            if ($(this).find('a.credential-cog').length > 0) {
              // console.log('core/session.js', 'checkCredentials', 'already added');
            } else {
              var node = '<a class="credential-cog" href="http://factory.myskreen.net/' + $(this).data('factory-type') + '/' + $(this).data('factory') + '/edit" target="_blank"><span class="glyphicon glyphicon-cog"></span></a>'
              // console.log('core/session.js', 'Credentials node', node);
              if ($(this).is('[id]')) {
                // console.log('scripts/_default.js', 'Credentials This sans a', $(this));
                $(this).append(node);
              } else if ($(this).is('tr')) {
                $(this).find('.channel').append('<div style="position:relative;z-index:25;">' + node + '</div>');
              } else {
                //console.log('scripts/_default.js', 'Credentials This avec a', $(this));
                $(this).find('a').append(node);
              }
            }
          });
        }
      }
    }
    /*if ($('#view-program').length) { // Si on est sur une FicheProgramme
      if ($('.pass').length) { // Si elle a une offre Pass Illimité
        if (typeof this.datas.credential != 'undefined' &&
            typeof this.datas.credential.sk_pass != 'undefined') { // Si l'utilisateur est connecté et abonné au Pass
          $('.pass .btn-pass-subscribe .btn-pass-text').html('Voir (abonné)');
          $('.pass .btn').removeClass('btn-pass-subscribe');
          $('.pass .pass-text').html($('.pass .pass-text').data('type-programme') + ' est visible avec votre abonnement </br> au Pass Illimité myskreen');
        }
      }
    }*/
    /*if ($('#promopass').length) { // Si on est sur une page où le bandeau promoPass est présent
      if (typeof this.datas.credential != 'undefined' &&
          typeof this.datas.credential.sk_pass != 'undefined') { // Si l'utilisateur est connecté et abonné au Pass
        $('#promopass, #passlabel').hide(); // On fait disparaître le bandeau promoPass et le label Pass à droite
      }
    }*/
 },
 removeCredentials: function(){
  $('a.credential-cog').remove();
  /*if ($('#view-program').length) { // Si on est sur une FicheProgramme
    if ($('.pass').length) { // Si elle a une offre Pass Illimité
      $('.pass .btn .btn-pass-text').html('GRATUIT');
      $('.pass .btn').addClass('btn-pass-subscribe');
      $('.pass .pass-text').html('myskreen vous offre ' + $('.pass .pass-text').data('type-programme') + ' avec le Pass Illimité <br/><small>(puis 5€/semaine, sans engagement - <a data-modal-remote="/pass/">en savoir plus</a>)</small>');
    }
  }*/
 }
});
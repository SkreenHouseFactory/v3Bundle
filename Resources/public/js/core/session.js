// -- BaseSession
var BaseSession = Class.extend({
 uid: '',
 user: null,
 datas: {},
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
      self.callbackSignin['init'] = callbackSignin;
      //console.log('scripts', '_default.js', 'Skhf.session', 'self.callbackSignin', self.callbackSignin);
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
       Skhf.session.datas = sessionData;
       UI.loadUser();
       if (typeof callback != 'undefined' && callback) {
         callback(sessionData, this)
       }
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
   API.cookie('session_uid', this.uid);
   if (this.datas.email) {
     this.user = this.datas.email;
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

   API.cookie('session_uid', null);
   API.cookie('playlist_collapsed', null);

   UI.loadUser();
 },
 update: function() {
   var self = this;
   if (this.datas.email) {
     setTimeout(function(){
       console.log('Session.update', 'callback');
       var update_args = $.extend(self.sync_args, {
         time: new Date().getTime()
       });
       Skhf.session.sync(function(sessionData) {
         UI.loadNotifications(sessionData.notifications);
         if (sessionData.email) {
           self.update();
         }
       }, update_args);
     }, self.idle_timeout);
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
   return this.Object.keys(getPlaylistIds('like')).length + 
          this.Object.keys(getPlaylistIds('cinema')).length + 
          this.Object.keys(getPlaylistIds('channel')).length + 
          this.Object.keys(getPlaylistIds('page')).length + 
          this.Object.keys(getPlaylistIds('person')).length + 
          this.Object.keys(getPlaylistIds('user')).length ;
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
     default:
       var ids = null;
     break;
   }
   if (ids == null || ids == "") {
     ids = {};
   } else if (typeof ids != 'object') {
     ids = ids.split(',');
   }
   console.log('getPlaylistIds', playlist, ids);
   return ids;
 },
 getSocialDatas: function(callback){
   var self = this;
   //console.log('BaseSession.getSocialDatas');

   //no fbuid
   if (!this.datas.fb_uid) {
     console.log('BaseSession.getSocialDatas', 'no fbuid');
     return;
   }

   //already loaded
   if (this.social_state == 'done') {
     if (typeof callback != 'undefined') {
       console.warn('BaseSession.getSocialDatas', 'state=done');
       callback(typeof self.datas.friends != 'undefined' ? self.datas.friends : [], self.datas.friends_programs);
     }

   //currently loading
   } else if (this.social_state == 'processing') {
     console.warn('BaseSession.getSocialDatas', 'state=processing', 'add callback', this.callbackSocial);
     this.callbackSocial.push(callback);

   //initialize
   } else {
     if (this.social_state == null) {
       console.warn('BaseSession.getSocialDatas', 'set state=processing');
       this.social_state = 'processing';
       this.callbackSocial = [callback];
     }
     //load from IndexedDb ?
     API.selectIndexedDb('skhf', 'friends', 1, function(IndexedDbDatas){
       console.log('BaseSession.getSocialDatas', 'selectIndexedDb', IndexedDbDatas);
       self.social_state = 'done';

       if (IndexedDbDatas) {
         console.log('BaseSession.getSocialDatas', 'IndexedDbDatas', IndexedDbDatas);
         if (IndexedDbDatas.updated_at > (new Date()).getTime() - 3600*1000) {
           self.datas.friends = IndexedDbDatas.friends;
           self.datas.friends_programs = IndexedDbDatas.friends_programs;
           for (k in self.callbackSocial) {
             self.callbackSocial[k](self.datas.friends, self.datas.friends_programs);
           }
           return;
         } else {
           API.deleteIndexedDb('skhf', 'friends', 1);
         }
       }

       //fail : load from API
       self.sync(function(sessionDatas){
         console.log('BaseSession.getSocialDatas', 'sync session callback', sessionDatas, self.callbackSocial);
         self.datas.friends = sessionDatas.friends;
         self.datas.friends_programs = sessionDatas.friends_playlists;

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
         with_notifications: 0,
         with_friends: 1,
         with_friends_playlists: 1
       });
     });
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
 }
});
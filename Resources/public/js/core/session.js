// -- BaseSession
var BaseSession = Class.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
	callbackInit: null,
	callbackSignout: null,
	callbackSignin: null,
  init: function(callback, args) {
    console.log('BaseSession.init', args);
    var self = this;
    this.uid = API.cookie('uid');
    if (API.context == 'v3') {
      this.sync(function(sessionData){
        //console.log('BaseSession.init', 'callback Session.sync', sessionData);
				//callbackInit : called only once
				if (self.callbackInit) {
					self.callbackInit();
					self.callbackInit = null;
				}
				//callback
        if (typeof callback != 'undefined') {
          callback(sessionData)
        }
      }, args);
    }
  },
  sync: function(callback, args) {
    var self = this;
    console.log('BaseSession.sync', this.uid, 'cookie:' + API.cookie('session_uid'));
    var args = typeof args == 'undefined' ? new Array() : args;
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
            callback(sessionData)
          }
        });
      } else {
        Skhf.session.datas = sessionData;
        UI.loadUser();
        if (typeof callback != 'undefined' && callback) {
          callback(sessionData)
        }
      }
    }

    // exists
    if (this.uid) {
      $.extend(args, { 'short':1 });
      API.query('GET', 'session/' + this.uid + '.json', args, function(sessionData) {
        callback_signin(sessionData);
      });
    // create
    } else {
      $.extend(args, {'short':1});
      API.query('POST', 'session.json', args, function(sessionData) {
        callback_signin(sessionData);
      });
    }
  },
  signin: function(sessionData, callback) {
    console.log('BaseSession.signin', sessionData);
    this.datas = sessionData;
    this.uid = this.datas.uid;
    API.cookie('session_uid', this.uid);
    if (this.datas.email) {
      this.user = this.datas.email;
      UI.loadUser();
    }
    
    if (typeof callback != 'undefined') {
      //console.log('BaseSession.signin callback', callback);
      callback();
			if (this.callbackSignin) {
				this.callbackSignin();
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
  getSocialDatas: function(callback){
    var self = this;
    console.log('BaseSession.getSocialDatas');

    //no fbuid
    if (!this.datas.fb_uid) {
      //console.log('BaseSession.getSocialDatas', 'no fbuid');
      return;
    }

    //already loaded
    if (typeof callback != 'undefined' && 
        typeof self.datas.friends != 'undefined') {
      return callback(self.datas.friends, self.datas.friends_programs);
    }

    //load from IndexedDb ?
    API.selectIndexedDb('skhf', 'friends', 1, function(IndexedDbDatas){
      console.log('BaseSession.getSocialDatas', 'selectIndexedDb', IndexedDbDatas);
      if (IndexedDbDatas) {
        console.log('BaseSession.getSocialDatas', 'IndexedDbDatas', IndexedDbDatas);
        if (IndexedDbDatas.updated_at > (new Date()).getTime() - 3600*1000) {
          self.datas.friends = IndexedDbDatas.friends;
          self.datas.friends_programs = IndexedDbDatas.friends_programs;
          callback(self.datas.friends, self.datas.friends_programs);
  
          return;
        } else {
          API.deleteIndexedDb('skhf', 'friends', 1);
        }
      }
  
      //fail : load from API
      self.sync(function(sessionDatas){
        console.log('BaseSession.getSocialDatas', 'callback', sessionDatas);
        self.datas.friends = sessionDatas.friends;
        self.datas.friends_programs = sessionDatas.friends_playlists;
  
        API.insertIndexedDb('skhf', 'friends', {id: 1, 
                                                friends: self.datas.friends, 
                                                friends_programs: self.datas.friends_programs,
                                                updated_at: (new Date()).getTime()});
  
        if (typeof callback != 'undefined') {
          callback(self.datas.friends, self.datas.friends_programs);
        }
      },{
        with_notifications: 0,
        with_friends: 1,
        with_friends_playlists: 1
      });
    });
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
// -- BaseSession
var BaseSession = Class.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  init: function(callback, args) {
    console.log('BaseSession.init', args);
    var self = this;
    this.uid = API.cookie('uid');
    if (API.context == 'v3') {
      this.sync(function(sessionData){
        console.log('BaseSession.init', 'callback Session.sync', sessionData);
        self.signin(sessionData);
      }, args);
    }
  },
  sync: function(callback, args) {
    var self = this;
    var args = typeof args == 'undefined' ? new Array() : args;
    console.warn('BaseSession.sync', this.uid, 'cookie:' + API.cookie('session_uid'));
    if (this.uid == null) {
      this.uid = API.cookie('session_uid');
    }

    if (this.uid) {
      $.extend(args, { 'short':1 });
      API.query('GET', 'session/' + this.uid + '.json', args, function(sessionData) {
        if (callback) {
          callback(sessionData);
        }
      });
    } else {
      $.extend(args, {'short':1});
      API.query('POST', 'session.json', args, function(sessionData) {
        if (callback) {
          callback(sessionData);
        }
      });
    }
  },
  signin: function(sessionData) {
    console.log('BaseSession.signin', sessionData);
    this.datas = sessionData;
    this.uid = this.datas.uid;
    API.cookie('session_uid', this.uid);
    if (this.datas.email) {
      this.user = this.datas.email;
      UI.loadUser();
    }
  },
  signout: function(callback) {
    if (API.context == 'v2') {
      API.postMessage(['signout']);
    } else {
      API.query('POST', 'session/signout.json', {session_uid: this.uid}, callback);
    }

    this.datas = '';
//?    this.uid = '';
    this.user = '';

    API.cookie('session_uid', null);
    API.cookie('playlist_collapsed', null);
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
    if (typeof callback != 'undefined' && 
        typeof self.datas.friends != 'undefined') {
      return callback(self.datas.friends, self.datas.friends_programs);
    }

    this.sync(function(sessionDatas){
      console.log('BaseSession.getSocialDatas', 'callback', sessionDatas);
      self.datas.friends = sessionDatas.friends;
      self.datas.friends_programs = sessionDatas.friends_playlists;
      if (typeof callback != 'undefined') {
        callback(self.datas.friends, self.datas.friends_programs);
      }
    },{
      with_notifications: 0,
      with_friends: 1,
      with_friends_playlists: 1
    });
  }
});
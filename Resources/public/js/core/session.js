// -- BaseSession
var BaseSession = Class.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  init: function(callback, args) {
    //session
    this.uid = API.cookie('uid');
    if (API.context == 'v3') {
      this.sync(callback, args);
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
      $.extend(args, { 'with_notifications':1, 'short':1 }); //, 'with_selector':1
      API.query('GET', 'session/' + this.uid + '.json', args, function(sessionData) {
        self.signin(sessionData);

        if (callback) {
          callback(sessionData);
        }
      });
    } else {
      $.extend(args, {'short':1});
      API.query('POST', 'session.json', args, function(sessionData) {
        self.signin(sessionData);

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
      if (typeof this.datas.friends != 'undefined') {
        this.loadFriends(sessionData.friends);
      }
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
  loadFriends: function(friends, callback) {
    var self = this;
    //console.log('BaseSession.loadFriends', friends);

    if (typeof this.datas.friends != 'undefined' && this.datas.friends != null) {
      console.warn('BaseSession.loadFriends', 'already loaded', this.datas.friends, friends);
      return;
    }

    if (typeof friends != 'undefined' && friends != null ) {
      this.datas.friends = friends;
      if (typeof callback != 'undefined') {
        callback();
      }
    } else {
      this.sync(function(){
        if (typeof callback != 'undefined') {
          callback();
        }
      },{
        with_friends: 1
      });
    }
  },
  loadFriendsPrograms: function(callback){
    var self = this;
    var cookie_name = 'friends_playlist';
    var cookie = API.cookie(cookie_name);
    console.log('BaseSession.loadFriendsPrograms', cookie_name, cookie);
    if (cookie) {
      var json = JSON.parse(cookie);
      console.log('BaseSession.loadFriendsPrograms', 'cookie', json);
      if (json.statusText == 'error') {
        console.warn('BaseSession.loadFriendsPrograms', 'cookie error');
        API.cookie(cookie_name, null);
        return this.loadFriendsPrograms(callback);
      }
      if (typeof callback != 'undefined') {
        callback(json);
      }
    } else {
      this.loadSocialDatas();
    }
  },
  loadFriendsPlaylist: function(onglet, offset, force_remote, callback) {
    console.log('BaseSession.loadFriendsPlaylist', 'fb_uid', this.datas.fb_uid)
    var self = this;

    var offset = typeof offset != 'undefined' ? offset : 0;
    var onglet = typeof onglet != 'undefined' ? onglet : null;
    self.loadFriends()

    API.query('GET',
              'www/slider/social/' + this.uid + '.json', 
              {
                onglet: this.onglet, 
                nb_results: 1, 
                img_width: API.config.slider.width, 
                img_height: API.config.slider.height
              }, 
              function(json) {
                console.log('BaseSession.loadFriendsPlaylist', 'offset:' + offset, 'error:' + json.error);
                if (typeof json.error == 'undefined') {
                  if (typeof callback != 'undefined') {
                    callback(json);
                  }
                }
              });
  },
  loadSocialDatas: function(callback){
    API.query('GET',
              'session/' + this.uid + '.json', 
              {
                with_friends_playlists: 1
              }, 
              function(json) {
                console.log('BaseSession.loadFriendsPrograms', 'callback', json.friends_playlists, self.datas);
                if (typeof json.error == 'undefined') {
                  API.cookie(cookie_name, JSON.stringify(json.friends_playlists));
                  if (typeof callback != 'undefined') {
                    callback(json.friends_playlists);
                  }
                }
              });
  }
});
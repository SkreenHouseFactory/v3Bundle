// -- BaseSession
var BaseSession = Class.extend({
  uid: '',
  datas: {},
  onglet: '',
  access: '',
  init: function(callback) {
    //session
    this.uid = API.cookie('uid');
    if (API.context == 'v3') {
      this.sync(callback);
    }
  },
  sync: function(callback, args) {
    var self = this;
    var args = typeof args == 'undefined' ? new Array() : args;
    console.warn('BaseSession.sync', this.uid, 'cookie:' + API.cookie('uid'));

    if (this.uid) {
      $.extend(args, { 'with_notifications':1, 'with_selector':1, 'short':1 });
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
    API.cookie('uid', this.uid);
    if (this.datas.email) {
      UI.loadUser();
    }
  },
  signout: function() {
    if (API.context == 'v2') {
      API.postMessage(["signout"]);
    } else {
      API.query('POST', 'session/signout.json', {session_uid: this.uid});
    }

    this.datas = '';
    this.uid = '';

    API.cookie('uid', '');
    API.cookie('playlist_collapsed', '');
  },
  initSocial: function(onglet, offset, force_remote, callback) {
    var self = this;
    if (this.datas.fb_uid) {
      var offset = typeof offset != 'undefined' ? offset : 0;
      var onglet = typeof onglet != 'undefined' ? onglet : null;
      var cookie_name = 'social_' + onglet + '_' + offset;
      var cookie = API.cookie(cookie_name);
      console.log('BaseSession.initSocial', this.datas.fb_uid, cookie_name, cookie, 'force_remote:' + force_remote);
      if (cookie && typeof force_remote == 'undefined') {
        var json = JSON.parse(cookie);
        console.log('BaseSession.initSocial', this.datas.fb_uid, 'cookie');
        if (json.statusText == 'error') {
          console.warn('BaseSession.initSocial', this.datas.fb_uid, 'cookie error');
          return this.initSocial(onglet, offset, true);
        }
        Session.datas.friends = json.friends;
        if (typeof callback != 'undefined') {
          callback(json);
        }
      } else {

        API.query('GET', 
                  'www/slider/social/' + this.uid + '.json', 
                  {onglet: this.onglet, nb_results: 1}, 
                  function(json) {
                    console.log('BaseSession.initSocial', 'offset:' + offset, 'error:' + json.error);
                    if (typeof json.error == 'undefined') {
                      API.cookie(cookie_name, JSON.stringify(json));
                      self.datas.friends = json.friends;
                      if (typeof callback != 'undefined') {
                        callback(json);
                      }
                    }
                  });
      }
    }
  }
});
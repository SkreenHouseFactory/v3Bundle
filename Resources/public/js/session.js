// -- Session
var Session;
Session = {
  uid: null,
  context: 'v3',
  skXdmSocket: null,
  init: function(callback) {

    this.uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_uid');
    this.syncSession(callback);
    
    //v2
    if (window.parent != window) {
      this.syncV2();
    }
  },
  syncV2: function() {
    var self = this;

    this.context = 'v2';
    this.skXdmSocket = new easyXDM.Socket({
      onMessage:function(message, origin) {
        message = JSON.parse(message);
        console.log('msg v2', message);
        if (message[0] == "sessionData") {
          self.signin(message[1]);

        } else if (message[0] == "history.back") {
          if (message[1] == "add") {
            $('#history-back').show(); //UI.addHistoryBack();
          } else {
            $('#history-back').hide(); //UI.removeHistoryBack();
          }
        }
      }
    });
    this.postMessage(["sync"]);

    //height header
    $('a[data-target="#top-playlist"]').click(function (e) {
      self.postMessage(["header", $('#top-playlist').hasClass('in') ? "remove_playlist": "add_playlist"]);
    });
  },
  postMessage: function(message) {
    this.skXdmSocket.postMessage(JSON.stringify(message));
  },
  syncSession: function(callback, args) {
    var self = this;
    console.warn("syncSession", this.uid);

    if (this.uid != null) {
      if( !args ) {
        var args = { with_notices:1, with_friends:1 };
      }

      API.query("GET", "session/" + this.uid + ".json", args, function(sessionData) {
        if (typeof sessionData != "object") {
          console.error('!! Error by getting session object. Session restart...', sessionData);

          //Erase cookie
          if( typeof window != 'undefined' ) {
            $.cookie('myskreen_uid', null);
            self.uid = null;
          }
        }

        if (callback) {
          callback(sessionData);
        }
      });
    }
  },
  signin: function(sessionData) {
    if (sessionData.email) {
      console.log('Session.signin', sessionData);
      this.loadUser(sessionData.email);
      this.loadPlaylist(sessionData.queue);
    }
  },
  signout: function() {
    this.unloadUser();
  },
  loadPlaylist: function(ids) {
    console.log('load playlist', ids);
    $('#playlist').html('load : ' + ids);
    //$('#playlist').load($('#playlist').data('update-url'));
  },
  loadUser: function(email) {
      $('#signin').hide();
      $('#signed-in span').html(email);
      $('#signed-in').fadeIn();
  },
  unloadUser: function() {
      $('#signed-in span').empty();
      $('#signed-in').hide();
      $('#signin').fadeIn();
  }
}
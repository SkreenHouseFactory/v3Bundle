

// -- Session
var Session;
Session = {
  session_uid: null,
  init: function() {
    this.session_uid = $.cookie('myskreen_session_uid');
    this.initSession();
  },
  syncSession: function(callback, args) {
    var self = this;
    console.warn("syncSession", this.session_uid);

    if (this.session_uid != null) {
      if( !args ) {
        var args = { with_notices:1, with_friends:1 };
      }

      API.query("GET", "session/" + this.session_uid + ".json", args, function(error, sessionData) {
        if (error || typeof sessionData != "object" || sessionData.error) {
          console.error('!! Error by getting session object. Session restart...', error, sessionData);
          
          //Erase cookie
          if( typeof window != 'undefined' ) {
            $.cookie('myskreen_session_uid', null);
            self.session_uid = null;
          }
          
          //restart ?
          //return self.syncSession(callback, args);
        }

        if (callback) {
          console.log('callback syncSession', callback, sessionData);
          callback(null, sessionData);
        }
      });
    }
  },
}
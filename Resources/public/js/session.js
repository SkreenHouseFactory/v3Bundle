// -- Session
var Session;
Session = {
  session_uid: null,
  context: 'v3',
  skXdmSocket: null,
  init: function(callback) {

    this.session_uid = '07296dbbafab0bba22e0ebc14928247c';//$.cookie('myskreen_session_uid');
    this.syncSession(callback);
    
    //v2
    if (window.parent != window) {
      this.syncV2();
    }
  },
  syncV2: function() {
    this.context = 'v2';
    
    this.skXdmSocket = new easyXDM.Socket({
      onMessage:function(message, origin) {
        message = JSON.parse(message);
        if (message) {
          console.log('msg v2', message);
        }
      }
    });
    this.postMessage(["sync"]);

    //height header
    $('a[data-target="#top-playlist"]').click(function (e) {
      this.postMessage(["header", $('#top-playlist').hasClass('in') ? "remove_playlist": "add_playlist"]);
    });
  },
  postMessage: function(message) {
    this.skXdmSocket.postMessage(JSON.stringify(message));
  },
  syncSession: function(callback, args) {
    var self = this;
    console.warn("syncSession", this.session_uid);

    if (this.session_uid != null) {
      if( !args ) {
        var args = { with_notices:1, with_friends:1 };
      }

      API.query("GET", "session/" + this.session_uid + ".json", args, function(sessionData) {
        if (typeof sessionData != "object") {
          console.error('!! Error by getting session object. Session restart...', sessionData);

          //Erase cookie
          if( typeof window != 'undefined' ) {
            $.cookie('myskreen_session_uid', null);
            self.session_uid = null;
          }
        }

        if (callback) {
          callback(sessionData);
        }
      });
    }
  },
  loadPlaylist: function(ids) {
    console.log('load playlist', ids);
    $('#playlist').html('load : ' + ids);
    //$('#playlist').load($('#playlist').data('update-url'));
  }
}

//sync session
$(document).ready(function(){
  Session.init(function(sessionData){
    
    console.log('context', Session.context);
    
    $('#signin a').click(function(){
      if (Session.context == 'v2') {
        Session.postMessage(["signin"]);
      } else {
        API.quickLaunchModal('signin');
      }
    });
    
    return;
  
    //update user infos
    $('#signin').html(sessionData.email);
    
    //playlist
    Session.loadPlaylist(sessionData.queue);
  });
});
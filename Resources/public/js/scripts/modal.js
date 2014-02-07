if(typeof console == 'undefined' || typeof console.log === 'undefined') {
  console = {
    log: function() {},
    warn: function() {},
    error: function() {}
  }
}
  //////////// CALLBACKS ////////////////
  // -- session sync
  callbackSignin = function() {
    if(Skhf.session.user){
      //console.log('scripts/modal.js', 'callbackSignin', window.opener);
      window.opener.document.location.reload();
      window.close();
    }
  }
  callbackInit = function(session) {
    //console.log('pas de session');
    if(!session.uid){
      session.sync(function(){
        //console.log('modal.js', 'callbackInit', Skhf.session.uid);
        $('#form_session_uid').val(Skhf.session.uid);
      });
    } else {
      //console.log('modal.js', 'callbackInit', Skhf.session.uid);
      $('#form_session_uid').val(Skhf.session.uid);
    }
  }
  
$(document).ready(function(){
  //console.log('modal.js', 'ready');
  if($('#close').length>0){
    //console.log('test close');
    //console.log('callbackSignin', callbackSignin);
    callbackSignin();
  }
});
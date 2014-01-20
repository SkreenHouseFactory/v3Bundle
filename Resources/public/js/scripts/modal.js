  //////////// CALLBACKS ////////////////
  // -- session sync
  callbackSignin = function() {
    if(Skhf.session.user){
      console.log('scripts/modal.js', 'callbackSignin', window.opener);
      window.opener.document.location.reload();
      window.close();
    }
  }
  callbackInit = function() {
    console.log('pas de session');
    if(!Skhf.session.uid){
      Skhf.session.sync();
    }
  }
  
$(document).ready(function(){
  if($('#close').length>0){
    console.log('test close');
    callbackSignin();
  }
});
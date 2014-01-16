  //////////// CALLBACKS ////////////////
  // -- session sync
  callbackSignin = function() {
    if(Skhf.session.user){
      console.log('scripts/modal.js', 'callbackSignin', window.opener);
      window.opener.document.location.reload();
      window.close();
    }
  }

// -- home
$(document).ready(function(){

  //load user selector
  Skhf.session.callbackSignin['home'] = function() {
    console.log('scripts/home.js', 'callbackSignin');

    if (Skhf.session.datas.email) {
      //console.log('scripts/home.js', 'callbackSignin', 'load user player');
      //$('#user-home .user-on').load(API.config.v3_root+'/user/player/?xhr=1', function(){
      //});
    }
  }

});
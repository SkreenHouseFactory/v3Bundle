/**
* FB init and FB connect
* needs <div id="fb-root"></div> in the DOM
*/
//onload
// Load the SDK asynchronously
API.callbackInit['fb'] = function(){

}

var Facebook;
Facebook = {
  permissions: 'email,user_birthday,friends_birthday,user_likes,friends_likes,publish_stream,publish_actions,read_friendlists',
  init: function(){
    (function(d, s, id) {
      console.log('scripts/core/fb.js', 'lancement fb asynchronously', API.config.fb.app_id);
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) return;
       js = d.createElement(s); js.id = id;
       js.src = '//connect.facebook.net/fr_FR/all.js#xfbml=1&status=1&cookie=1&appId=' + API.config.fb.app_id;
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  },
  login: function(){
    var self = this;
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        $('#fbconnect-infos').html('<span class="bs-callout bs-callout-success nowrap">Connexion à vos listes en cours...</span>');
        fbsync();
      } else {
        // cancelled
        $('#fbconnect-infos').html('<span class="bs-callout bs-callout-danger nowrap">La connexion a échoué !</span>');
      }
    },{
      scope: self.permissions
    });
  },
  sync: function(){
    console.log(['scripts/fb.js', 'fetching information...']);
    FB.api('/me', function(response) {
      console.log('scripts/fb.js', 'success', FB.getAuthResponse());
      var authresponse = FB.getAuthResponse();
      for (k in response) {
        console.log('scripts/fb.js', k, response[k]);
      }
      Skhf.session.sync(function(sessionDatas){
        API.query(
          'POST', 
          'user', 
          {
            session_uid: Skhf.session.uid,
            fbuid: response.id,
            username: typeof response.email != 'undefined' ? response.email : response.id + '@facebook.com',
            nickname: response.username,
            firstname: response.first_name,
            lastname: response.last_name,
            gender: typeof response.gender != 'undefined' ? response.gender : null,
            birthday: response.birthday,
            access_token: authresponse['accessToken'],
            expires: authresponse['expiresIn']
          },
          function(data){
            console.log('scripts/fb.js', 'API.query callback', data);


            Skhf.session.signin(data.session, function(){
              $('.modal').modal('hide');
              console.log('scripts/fb.js', 'API.query callback', 'Skhf.session.sync', UI.callbackModal);
              if (UI.callbackModal) {
                UI.callbackModal();
              }

              /* handled in core/session.js
              console.log('scripts/core/fb.js', Skhf.session.user);
              console.log('scripts/core/fb.js', Skhf.session.callbackSignin);
              if(Skhf.session.user && Skhf.session.callbackSignin){
                Skhf.session.callbackSignin();
              }
              */
            });
          });
      });
    });
  }
}

$(document).ready(function(){

  Facebook.init();

  //trigger
  $(document).on('click', '#fbconnect', function(){
    console.log(['script', 'trigger FB']);
    Facebook.login();
    return false;
  });

  window.fbAsyncInit = function() {
   // on shown
   if (API.config.env == 'dev') {
     FB.getLoginStatus(function(response) {
       if (response.status === 'connected') {
         FB.api('/me', function(response) {
           console.log('Good to see you, ' + response.name + '.', response);
           //$('#fbconnect-infos').html('<small>(' + response.name + ')</small>');
         });
       }
     });
   }
  };
});
/**
* FB init and FB connect
* needs <div id="fb-root"></div> in the DOM
*/
//onload
$(document).ready(function(){

  // Additional JS functions here
  window.fbAsyncInit = function() {
    FB.init({
      appId      : API.config.fb.app_id, // App ID
      //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
  
    // Additional init code here
 
  };
  // Load the SDK Asynchronously
  (function(d){
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/fr_FR/all.js";
      ref.parentNode.insertBefore(js, ref);
    }(document));

  // fb connect
  function fbsync() {
    console.log(['script fbsync', 'fetching information...']);
    FB.api('/me', function(response) {
      console.log(['script fbsync', 'success: ' + response.name, response, FB.getAuthResponse()]);
      API.query(
        'POST', 
        'user', 
        {
          session_uid: Skhf.session.uid,
          fbuid: response.id,
          username: response.email,
          access_token: FB.getAuthResponse()['accessToken']
        },
        function(){
          console.log('script fbsync', 'API.query callback');

          Skhf.session.sync(function(sessionDatas){
            $('.modal').modal('hide');
            console.log('script fbsync', 'API.query callback', 'Skhf.session.sync', UI.callbackModal);
            if (UI.callbackModal) {
              UI.callbackModal();
            }
            /* handled in Skhf.session.sync
            Skhf.session.signin(sessionDatas, function(){
              console.log('script fbsync', 'API.query callback', 'Skhf.session.signin callback', sessionDatas);
            });
            */
          });
        });
    });
  }
  function fblogin() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        $('#fbconnect-infos').html('<span class="alert alert-success nowrap">Connexion à vos playlists en cours...</span>');
        fbsync();
      } else {
        // cancelled
        $('#fbconnect-infos').html('<span class="alert alert-error nowrap">La connexion a échoué !</span>');
      }
//    },{scope:'email,read_friendlists,publish_stream,offline_access,publish_actions'});
    },{scope:'offline_access,user_birthday,user_online_presence,email,read_friendlists,publish_stream,friends_likes,friends_online_presence,publish_actions'});
  }

  /* on shown
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.', response);
        $('#fbconnect-infos').html('<small>(' + response.name + ')</small>');
      });
    }
  });
  */
  //trigger
  $('#fbconnect').on('click', function(){
    console.log(['script', 'trigger FB']);
    fblogin();
    return false;
  });
  $(document).on('click', '#fbconnect', function(){
    console.log(['script', 'trigger FB']);
    fblogin();
    return false;
  });
});
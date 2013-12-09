/**
* FB init and FB connect
* needs <div id="fb-root"></div> in the DOM
*/
//onload
$(document).ready(function(){

  var fb_permissions = 'user_birthday,friends_birthday,email,friends_likes,' + 
                       'publish_stream,publish_actions,status_update'; //read_friendlists



   window.fbAsyncInit = function() {
     // init the FB JS SDK
     FB.init({
       appId      : API.config.fb.app_id,                 // App ID from the app dashboard
       status     : true,                                 // Check Facebook Login status
     });
     // Additional initialization code such as adding Event Listeners goes here
   };

   // Load the SDK asynchronously
   (function(){
      // If we've already installed the SDK, we're done
      if (document.getElementById('facebook-jssdk')) {return;}
      // Get the first script element, which we'll use to find the parent node
      var firstScriptElement = document.getElementsByTagName('script')[0];
      // Create a new script element and set its id
      var facebookJS = document.createElement('script'); 
      facebookJS.id = 'facebook-jssdk';
      // Set the new script's source to the source of the Facebook JS SDK
      facebookJS.src = '//connect.facebook.net/fr_FR/all.js';
      // Insert the Facebook JS SDK into the DOM
      firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());

  // fb connect
  function fbsync() {
    console.log(['script fbsync', 'fetching information...']);
    FB.api('/me', function(response) {
      console.log(['script fbsync', 'success: ' + response.name, response, FB.getAuthResponse()]);
      Skhf.session.sync(function(sessionDatas){
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
        $('#fbconnect-infos').html('<span class="alert alert-danger nowrap">La connexion a échoué !</span>');
      }
    },{
      scope: fb_permissions
    });
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
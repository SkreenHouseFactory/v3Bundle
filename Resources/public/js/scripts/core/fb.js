$(document).ready(function(){

  /* FB */
  function fbsync() {
    console.log('script fbsync', 'fetching information...');
    FB.api('/me', function(response) {
      console.log('script fbsync', 'success: ' + response.name, response, FB.getAuthResponse());
      API.query('POST', 'user', {
                  session_uid: Skhf.session.uid,
                  fbuid: response.id,
                  username: response.email,
                  access_token: FB.getAuthResponse()['accessToken']
                },
                function(){
                  console.log('script fbsync', 'API.query callback');
                  Skhf.session.sync(function(sessionDatas){
                    $('.modal').modal('hide');
                    Skhf.session.signin(sessionDatas, function(){
                      console.log('script fbsync', 'API.query callback', 'Skhf.session.signin callback', sessionDatas);
                    });
                  });
                });
    });
  }
  function fblogin() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        $('#fbconnect-infos').html('<span class="alert alert-success nowrap">Connexion réussie! Chargement...</span>');
        fbsync();
      } else {
        // cancelled
        $('#fbconnect-infos').html('<span class="alert alert-error nowrap">La connexion a échoué !</span>');
      }
    },{scope:'user_birthday,user_online_presence,email,read_friendlists,publish_stream,offline_access,friends_birthday,friends_likes,friends_online_presence,publish_actions'});
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
  $('#fbconnect').live('click', function(){
    console.log('script', 'trigger FB');
    fblogin();
    return false;
  })

});
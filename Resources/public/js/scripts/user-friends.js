$(document).ready(function(){

  if (Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
    FB.ui({
      method: 'permissions.request',
      perms: 'read_friendlists',
      display: 'popup'
      },function(response) {
        alert(response.toSource());
        if (response && response.perms) {
          alert('Permissions granted: '+response.perms);
        } else if (!response.perms){
          alert('User did not authorize permission(s).');
        }
    });
  } else {
    console.log('scripts/user-friends.js', 'Test FB Connect:', 'Not connected via FB');
  }

});
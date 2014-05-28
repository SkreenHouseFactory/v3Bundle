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
  permissions: 'public_profile,email',
  appId: null,

  init: function(){
     this.appId = document.location.href.match(/.net/gi) ? ENV.dev.fb.app_id : ENV.prod.fb.app_id ;
     //console.log('scripts/core/fb.js', 'this.appId', this.appId);
     var self = this;
     window.fbAsyncInit = function() {
      //console.log('scripts/core/fb.js', 'fbAsyncInit', 'Avant FB.init');
          FB.init({
            appId: self.appId,
            xfbml: true,
            cookie: true,
            status: true,     
            version: 'v2.0'
          });
          //console.log('scripts/core/fb.js', 'fbAsyncInit', 'Après FB.init');
        };

        (function(d, s, id){
          // console.log('scripts/core/fb.js', 'lancement fb asynchronously');
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/fr_FR/all.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

     //like footer
     $('#fblike-footer').replaceWith('<iframe class="facebook" frameborder="0" scrolling="no" src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.facebook.com%2Fmyskreen&amp;send=false&amp;layout=button_count&amp;width=215&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font=tahoma&amp;height=21&amp;appId='+this.appId+'" style="border: none; overflow: hidden; width: 200px; height: 20px;"></iframe>');
  },
  login: function(permissions, callback, rerequest) {
    var self = this;
    if (typeof permissions == 'undefined') {
      permissions = this.permissions;
    }
    console.log('Facebook.login', 'permissions', permissions);
    var self = this;
    var params = {
      scope: permissions
    }
    if (typeof rerequest != 'undefined') {
      params.auth_type = 'rerequest';
    }
    console.log('Facebook.login', 'params', params);
    FB.login(function(response) {
      if (response.authResponse) {
        self.registerToken(response.authResponse['accessToken']);
        // connected
        $('#fbconnect-infos, .fbconnect-infos').html('<span class="bs-callout bs-callout-success nowrap">Connexion à vos listes en cours...</span>');
        if (typeof callback != 'undefined') {
          callback();
        } else {
          self.sync();
        }
      } else {
        // cancelled
        $('#fbconnect-infos, .fbconnect-infos').html('<span class="bs-callout bs-callout-danger nowrap">La connexion a échoué !</span>');
      }
    },
    params
    );
  },
  checkLoginState: function() {
    FB.getLoginStatus(function(response) {
      if (API.config.env == 'dev' && 
          response.status === 'connected') {
        FB.api('/me', function(response) {
          console.log('scripts/core/fb.js', 'Good to see you, ' + response.name + '.', response);
        });
      }
    });
  },
  registerToken: function(access_token){
    Skhf.session.datas.fb_access_token = access_token;
    API.addPreference('facebookAccessToken', access_token);
  },
  sync: function(){
    console.log(['scripts/core/fb.js', 'fetching information...']);
    FB.api('/me', function(response) {
      console.log('scripts/core/fb.js', 'success', FB.getAuthResponse());
      var authresponse = FB.getAuthResponse();
      for (k in response) {
        console.log('scripts/core/fb.js', k, response[k]);
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
            console.log('scripts/core/fb.js', 'API.query callback', data);

            Skhf.session.signin(data.session, function(){
              $('.modal').modal('hide');
              console.log('scripts/core/fb.js', 'API.query callback', 'Skhf.session.sync', UI.callbackModal);
              if (UI.callbackModal) {
                UI.callbackModal();
              }
            });
          });
      });
    });
  },
  checkPermissions: function(permission, callback){
    // console.log("scripts/core/fb.js", 'checkPermissions this', this);
    // console.log("scripts/core/fb.js", 'checkPermissions this.container', this.container);
    FB.api('/me/permissions', {
          access_token: Skhf.session.datas.fb_access_token
        },
        function (response) {
          console.log("scripts/core/fb.js", 'checkPermissions callback response', response);
          if (typeof response.data != 'undefined' && 
              typeof response.data[0] != 'undefined' && 
              typeof response.data[0][permission] != 'undefined') {
            console.log("scripts/core/fb.js", "Permissions:", "You got'em!");
            callback(true);
            return;
          } else {
            for (k in response.data) {
              if (response.data[k].permission == permission &&
                  response.data[k].status == 'granted' ) {
                console.log("scripts/core/fb.js", "Permissions:", "You got'em!");
                callback(true);
                return;
              } else if (response.data[k].permission == permission &&
                        response.data[k].status == 'declined' ) {
                console.log("scripts/core/fb.js", "Permissions:", "You precedently refused'em!");
                callback(false,'rerequest');
                return;
            }
          }
          console.log("scripts/core/fb.js", "Permissions:", "You don't got'em!");
          callback(false);
        }
      });
  },
  getFriends: function(callback){
    FB.api('/me/friends/?fields=picture.type(square),name',
      { access_token: Skhf.session.datas.fb_access_token },
      function(resp){
        console.log('scripts/core/fb.js', 'getFriends', 'Response:', resp);
        if (resp && !resp.error) {
          callback(resp.data);
        } else {
          console.log('scripts/core/fb.js', 'getFriends', 'Response: Error');
        }
      }
    );
  },
  getFriendsUids: function(friends){
    uids = new Array();
    for (k in friends) {
      uids.push(friends[k].id);
    }
    return uids;
  },
  inviteFriends: function(){
    FB.ui({
      app_id: this.appId,
      method: 'apprequests',
      message: 'Inscris-toi sur myskreen.com, crée tes listes de favoris et partage-les avec moi !'
    });
  },
  publishStatus: function(message,link){
    FB.api(
      '/me/feed',
      'post',
      {
        'message': message,
        'link': link
      },
      function(response){
        console.log('publishStatus response', response);
      }
    );
  },
  sendMessageTo: function(recipient,link){
    var params = {
      app_id: this.appId,
      method: 'send',
      link: link
    }
    if (typeof recipient != 'undefined') {
      params.to = recipient;
    }
    FB.ui(params);
  }

}

Facebook.init();

$(document).ready(function(){


  //trigger
  $(document).on('click', '#fbconnect', function(){
    console.log(['script', 'trigger FB']);
    Facebook.login();
    return false;
  });
});
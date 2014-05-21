var FriendsView;
FriendsView = {
  fb_permissions: null,
  container: null,
  container_off:  '<div class="social-off"><div class="bs-callout bs-callout-info"><p class="message"></p></div><div class="fb-btn"><img class="fb-connect-friends" src="/bundles/skreenhousefactoryv3/images/fb-connect.png"><div class="fbconnect-infos"></div></div></div>',
  message: null,
  init: function(){
    // console.log("scripts/user-friends.js", "Init");
    this.container = $('.social-friends');
    // console.log("scripts/user-friends.js", 'this', this);
    // console.log("scripts/user-friends.js", 'this.container', this.container);
  },
  checkPermissions: function(){
    var self = this;
    // console.log("scripts/user-friends.js", 'checkPermissions this', this);
    // console.log("scripts/user-friends.js", 'checkPermissions this.container', this.container);
    FB.api('/me/permissions', {
          access_token: Skhf.session.datas.fb_access_token
        },
        function (response) {
          console.log("scripts/user-friends.js", 'checkPermissions callback response', response);
          for (k in response.data) {
            if (response.data[k].permission == 'read_friendlists' &&
                response.data[k].status == 'granted' ) {
              console.log("scripts/user-friends.js", "Permissions:", "You got'em!");
              self.resultPermissions(true);
              return true;
            }
          }
          console.log("scripts/user-friends.js", "Permissions:", "You don't got'em!");
          self.resultPermissions(false);
          return false;
        }
      );
  },
  resultPermissions: function(hasPermissions){
    // console.log("scripts/user-friends.js", 'resultPermissions this', this);
    // console.log("scripts/user-friends.js", 'resultPermissions this.container', this.container);
    console.log("scripts/user-friends.js", 'resultPermissions hasPermissions', hasPermissions);
    if (hasPermissions) {
      UI.removeLoader(this.container);
      if ($('.social-off').length) {
        $('.social-off').hide();
      }
      $('.social-on').show();
    } else {
      // Display MessB
      // console.log("scripts/user-friends.js", 'this', this);
      // console.log("scripts/user-friends.js", 'this.container', this.container);
      UI.removeLoader(this.container);
      this.message = 'Vous n\'avez pas autorisé myskreen à accéder à vos amis Facebook.<br/>'+'Si vous voulez le faire, cliquez ci-dessous';
      this.container.html(this.container_off);
      $('.social-off .bs-callout p').html(this.message);
      // Define scope friends
      this.fb_permissions = 'user_friends,read_friendlists';
    }
  },
  // -- typeahead
  typeahead: function(searchbox){
    var self = this;
    //console.log('UI.typeahead', searchbox);
    if($(searchbox).length == 0){
      return;
    }
    $(searchbox).typeahead({
      items: 5,
      minLength: 3,
      source: function(typeahead, query) {
        console.log('UI.typeahead', 'source', query);
        query = query.replace('+', '%2B')
        self.getTypeaheadSuggestions(typeahead, query, searchbox);
      },
      onselect: function(obj) {
        console.log('UI.typeahead', 'onselect', obj, searchbox, $(searchbox).attr('value'));
        $(searchbox).val(' chargement ...');

        if (typeof obj != 'object') { //typeahead
          top.location = API.config.v3_url + '/programmes/' + obj;
        } else if (typeof obj.seo_url != 'undefined') { //advanced
          //alert('VALUE'+obj.name);
          if (obj.seo_url.match(/^http:\/\//)) {
            top.location = obj.seo_url;
          } else {
            top.location = API.config.v3_url + obj.seo_url;
          }
        }
      }
    });
  },

}

$(document).ready(function(){

  FriendsView.init();

  UI.appendLoader(FriendsView.container);

  Skhf.session.callbackSignin = function (){
    if (Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
      console.log('scripts/user-friends.js', 'Skhf.session.callbackSignin', 'Skhf.session.datas.fb_access_token', Skhf.session.datas.fb_access_token);
      FriendsView.checkPermissions(); 
    } else {
      // Display MessA
      UI.removeLoader(FriendsView.container);
      FriendsView.message = 'Vous n\'avez pas connecté myskreen à votre compte Facebook.<br/>'+'Si vous voulez le faire, cliquez ci-dessous';
      FriendsView.container.html(FriendsView.container_off);
      $('.social-off .bs-callout p').html(FriendsView.message);
      // Define scope full
      FriendsView.fb_permissions = 'email,user_friends,read_friendlists';
    }
  }

  $(document).on('click', '.fb-btn .fb-connect-friends', function(){
    Facebook.login(FriendsView.fb_permissions, function(token){
      Skhf.session.datas.fb_access_token = token;
      FriendsView.checkPermissions();
    });
  });
});

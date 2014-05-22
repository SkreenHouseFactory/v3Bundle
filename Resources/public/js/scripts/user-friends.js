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
  resultPermissions: function(hasPermissions){
    // console.log("scripts/user-friends.js", 'resultPermissions this', this);
    // console.log("scripts/user-friends.js", 'resultPermissions this.container', this.container);
    console.log("scripts/user-friends.js", 'resultPermissions hasPermissions', hasPermissions);
    if (hasPermissions) {
      var self = this;
      UI.removeLoader(this.container);
      if ($('.social-off').length) {
        $('.social-off').hide();
      }
      $('.social-on').show();
      Skhf.session.getSocialDatas(function(){
        var uids = new Array();
        for (k in Skhf.session.datas.friends) {
          uids.push(k);
        }
        console.log("scripts/user-friends.js", 'uids', uids);
        self.friendsList(uids);
        self.loadFriendsPlaylist(uids);
      });
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
  loadFriendsPlaylist: function(uids){
    if($('#social-on-slider.slider').length) {
      UI.sliders['friends'] = new BaseSlider({
        'url': 'www/slider/queue/'+Skhf.session.uid+'/access/friends.json?nb_results=10&programs_only=1&offset=0&channel_img_width=50&img_width=150&img_height=200&url=&with_best_offer=1&friends_uids='+uids },
        function(){},
        $('#social-on-slider.slider')
      );
    }
  },
  friendsList: function(uids){
    var friends = Skhf.session.datas.friends;
    var container = $('.list-container');
    var div = $('<ul class="friends-list"></ul>');
    var nb_friends = 0;
    for (k in friends) {
      nb_friends ++;
      var li = '<li class="label label-default friend-name" data-fbuid="'+friends[k].fbuid+'">'+friends[k].name+'</>';
      div.append(li);
    }
    if (nb_friends == 1) {
      li = li.replace('label-default', 'label-primary');
    } else {
      div.prepend('<li class="label label-primary friend-name" data-fbuid="'+uids+'">Tous mes amis</>');
    }
    div.appendTo(container);
  }

}

$(document).ready(function(){

  FriendsView.init();

  UI.appendLoader(FriendsView.container);

  Skhf.session.callbackSignin = function (){
    if (Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
      console.log('scripts/user-friends.js', 'Skhf.session.callbackSignin', 'Skhf.session.datas.fb_access_token', Skhf.session.datas.fb_access_token);
      Facebook.checkPermissions(); 
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
      Facebook.checkPermissions();
    });
  });

  $(document).on('click', '.fb-invite', function(){
    Facebook.inviteFriends();
  });

  $(document).on('click', '.friend-name', function(){
    var uids = $(this).data('fbuid');
    console.log('scripts/user-friends.js', 'click on friend-name', 'uids', uids);
    if ($(this).hasClass('label-default')) {
      $('#social-on-slider ul.items li:not(.static)').remove();
      FriendsView.loadFriendsPlaylist(uids);
      $('.friend-name.label-primary').addClass('label-default').removeClass('label-primary');
      $(this).addClass('label-primary');
      $('#social-on-slider').removeClass('slider-loading').addClass('loaded');
    }
  });

});

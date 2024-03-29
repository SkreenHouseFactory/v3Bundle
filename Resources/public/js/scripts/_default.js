/**
* scripts initialization
* core : script that are specific to the website
*
*/

//pause player if leaving
$(window).unload(function() {
  if (Player.state == 'playing') {
    Player.pause();
  }
});

$(document).ready(function(){

  // -- API init
  API.init(function(){

    // //mobile alerte app
    // var ua = navigator.userAgent.toLowerCase();
    // // Redirect to Android-site
    // if (document.location.href.indexOf('/apps') &&
    //     !API.cookie('_alert_apps') &&
    //     ((ua.indexOf('android') != -1 && ua.indexOf('mobile')) ||
    //      (ua.indexOf('ios') != -1  || ua.indexOf('iphone') != -1 ||  ua.indexOf('ipod') != -1))) {
    //   if (confirm("Voulez-vous installer l'application myskreen ?")) { 
    //     window.location = 'https://www.myskreen.com/apps';
    //   }
    //   API.cookie('_alert_apps', 1);
    // }

    //tjs après ci-dessus : pas de console sur ie
    console.log('script', 'API.init callback', API.config.base);

    //load player APIs
    var tag = document.createElement('script');
    tag.src = API.config.base.replace('api/', '').replace('http:', window.location.protocol) + 'skPlayerPlugin/js/SkhfPlayerIframeApi.js';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // -- DOM interactions
    UiView.init();

    // -- session
    Skhf.session = new Session(function(sessionData, self){
      console.log('script', 'Session.init', 'callback');
      $('.headertoprighticons').removeClass('hide');
      if(!sessionData.email && document.location.href.indexOf('/user/')!=-1){
        document.location='/';
      }
      if (!API.cookie('session_uid')){
        setTimeout(function(){
          for (k in self.callbackSignin) {
            console.log('script', 'Session.init', 'callbackSignin', self.callbackSignin[k]);
            self.callbackSignin[k]();
          }
        }, 500);
      }
      self.checkCredentials();

    }, typeof Session_sync_args != 'undefined' ? Session_sync_args : {});

  });
  // -- User interactions
  UI.init(function(){
    console.log('script', 'UI.init', 'callback');

    //TEST
    //API.insertIndexedDb('skhf', 'friends', {id: 2, uid: 'frienduid'});
    //API.selectIndexedDb('skhf', 'friends', 2);
  });
  // -- ui user
  $('a.auth').on('click', function(){
    console.log('_default.js', 'auth');
    Player.stop();
    UI.auth(function(){
      //console.log('ui.js', 'auth callback');
      if (Skhf.session.datas.email) {
        if (Skhf.session.getNbPlaylists() < 1) {
          //console.log('ui.js', 'auth callback NbPlaylists', 'Aucune playlist');
          var dialog = new Dialog('noItemInPlaylist',{},10000);
        } else if (Skhf.session.getNbPlaylists() < 11) {
          var dialog = new Dialog('fewItemsInPlaylist',{
            '%nbfavori%': (Skhf.session.getNbPlaylists() == 1 ? Skhf.session.getNbPlaylists() + ' favori' : Skhf.session.getNbPlaylists() + ' favoris' )
          },7000);
        }
      }
    });    
    return false;
  });
  $('a.signout').on('click', function(){
    Skhf.session.signout();
    return false;
  });
  

  // new header nav bar
  if ($('html').hasClass('no-touch') && !navigator.userAgent.match(/Touch/) ) {
    $('.navbar-nav >li').on('mouseover',function(){
      var self = $(this);
      // if($('#top-playlist').hasClass('in')) {
      //   $('#top-playlist').collapse('hide');
      // }
      $('.dropdown').removeClass('open');
      $('.hover-menu', self).removeClass('hide');

    });
    $('.navbar-nav >li').on('mouseout',function(){
      var self = $(this);
      $('.hover-menu', self).addClass('hide');
    });
  } else { //Touch devices
    setTimeout(function(){
      // on créé des variables
      var tv_href = $('.navbar-nav > li:first-child > a').attr('href');
      var vod_href = $('.navbar-nav > li+li > a').attr('href');
      var cine_href = $('.navbar-nav > li+li+li > a').attr('href');
      console.log('scripts/core', '_default.js', 'navbar-nav Touch', tv_href, vod_href, cine_href);
      // on vide les href des a pour ne pas engendrer de redirection directe au touch/click
      $('.navbar-nav > li:first-child > a').attr("href","#");
      $('.navbar-nav > li:first-child+li > a').attr("href","#");
      $('.navbar-nav > li:first-child+li+li > a').attr("href","#");
      // on gère chaque menu du header
      // tv
      $('.navbar-nav >li:first-child').on('click',function(){
        if ($('.navbar-nav > li:first-child .hover-menu.tv').hasClass("hide")) {
          $('.navbar-nav > li:first-child+li .vod, .navbar-nav > li:first-child+li+li .cine').removeClass("show-touch");
          $('.navbar-nav > li:first-child+li .vod, .navbar-nav > li:first-child+li+li .cine').addClass("hide");
          $('.navbar-nav > li:first-child .hover-menu.tv').removeClass("hide");
          $('.navbar-nav > li:first-child .hover-menu.tv').addClass("show-touch");
        }
      });
      $('.navbar-nav >li:first-child >a').on('click',function(){
        if ($('.navbar-nav >li:first-child >ul.hover-menu.tv').hasClass('show-touch')) {
          window.location = tv_href;
        }
      });
      // vod
      $('.navbar-nav > li:first-child+li').on('click',function(){
        if ($('.navbar-nav >li:first-child+li .vod').hasClass("hide")) {
          $('.navbar-nav > li:first-child .hover-menu.tv, .navbar-nav > li:first-child+li+li .cine').removeClass("show-touch");
          $('.navbar-nav > li:first-child .hover-menu.tv, .navbar-nav > li:first-child+li+li .cine').addClass("hide");
          $('.navbar-nav > li:first-child+li .vod').removeClass("hide");
          $('.navbar-nav > li:first-child+li .vod').addClass("show-touch");
        }
      });
      $('.navbar-nav >li:first-child+li >a').on('click',function(){
        if ($('.navbar-nav >li:first-child+li .vod').hasClass('show-touch')) {
          //console.log('plop vod');
          window.location = vod_href;
        }
      });
      // cine
      $('.navbar-nav > li:first-child+li+li').on('click',function(){
        if ($('.navbar-nav >li:first-child+li+li .cine').hasClass("hide")) {
          $('.navbar-nav > li:first-child .hover-menu.tv, .navbar-nav > li:first-child+li .vod').removeClass("show-touch");
          $('.navbar-nav > li:first-child .hover-menu.tv, .navbar-nav > li:first-child+li .vod').addClass("hide");
          $('.navbar-nav > li:first-child+li+li .cine').removeClass("hide");
          $('.navbar-nav > li:first-child+li+li .cine').addClass("show-touch");
        }
      });
      $('.navbar-nav >li:first-child+li+li >a').on('click',function(){
        if ($('.navbar-nav >li:first-child+li+li .cine').hasClass('show-touch')) {
          //console.log('plop cine');
          window.location = cine_href;
        }
      });
    }, 500);
  }

  //notifications
  $('.user-on .dropdown-toggle, .user-on [data-target]').on('click', function(){

    if ('matchMedia' in window) {
      if (window.matchMedia('(max-width:450px)').matches && $(this).hasClass('notifications-count')) {
        var notifs_href = $('.headertoprighticons .dropdown-menu .link-usernotifs > a.seo-replaced').attr('href');
        window.location = notifs_href;
        return;
      }
    }

    if ($(this).hasClass('tv-component')  && 
        !$(this).parent().hasClass('open') ) { 
          if(navigator.userAgent.match(/iPhone|iPad|iPod/)){
            Player.stop();
          }   
    }
    
    if ($(this).hasClass('notifications-count')  && 
        !$(this).parent().hasClass('open') ) { 
          if(navigator.userAgent.match(/iPhone|iPad|iPod/)){
            Player.stop();
          }
    }

    if ($(this).hasClass('notifications-count') &&
        !$(this).parent().hasClass('open') &&
        $(this).children('.badge').hasClass('badge-important') ) {
          console.log('scripts/_default.js', 'badge notifications', 'là que je voulais cliquer');
          Skhf.session.readNotifications();
          var current = $('#top-header .notifications li:not(.divider, .empty)').length;
          $('#top-header .notifications-count span.badge').removeClass('badge-important').html(current);
    }

  });

  $('.notifications span.remove-all-notifs[rel="tooltip"]').tooltip();

  $(document).on('click', '.notifications .remove', function(e){
        e.preventDefault();
        Skhf.session.deleteNotification($(this).data('id'));
        //console.log('scripts/_default.js', 'click deleteNotification', $(this));
        
        var elmts_toremove = $('.notifications .remove[data-id="'+$(this).data('id')+'"]');
        //console.log('scripts/_default.js', 'elmts_toremove', elmts_toremove);
        //dom
        elmts_toremove.each(function(){
          if($(this).hasClass('more')){
            $(this).parent().next().remove();
            $(this).parent().slideUp('slow').remove();
          } else {
            $(this).parents('.tv-component').slideUp('slow').remove();
          }
        });
        
        //count
        var current = parseInt($('#top-header .notifications-count .badge').html()) - 1;
        console.log('UI.loadNotifications', 'remove Notifications', 'current', current);
        $('#top-header .notifications-count .badge').html(parseInt(current) > 0 ? current : 0);
        // apparition no notifs message
        if( $('.notifications .tv-component:not(.hide)').length == 0){
          $('.notifications .empty').css('display','block');
        }
        return false;
      });

  //filter notifs
      $(document).on('click', '.notifications .label.filter', function(e){
        self = $(this);
        $('.notifications .label.filter').removeClass('label-info');
        $('.label.filter[data-filter="' + self.data('filter') + '"]').addClass('label-info');
        
        if($(this).data('reload-notif') != "done"){
          var list = $('#top-header .notifications ul .scroll');
          Skhf.session.sync(function(data){
            global.appendNotifications(data.notifications,list);
            self.attr('data-reload-notif','done');
          },{
            with_notifications : self.data('filter')
          });
        }
        global.notificationsFilter(self);                

        return false;
      });

  //pass
  /*$('.btn-pass-subscribe').on('click', function(){
    if (Skhf.session.datas.email) {
      if (typeof Skhf.session.datas.credentials != 'undefined' &&
          typeof Skhf.session.datas.credentials.sk_pass != 'undefined') { // Si l'utilisateur est connecté et abonné au Pass
          console.log('scripts/_default.js', 'API.accessPass', 'already subscribed');
        return false; // Pas de modal pour y souscrire
      }
    }
    console.log('scripts/_default.js', 'API.accessPass');
    Player.stop();
    API.accessPass();
  });*/

  //share
  $('.share .btn').on('click', function(){
    if ($(this).data('share') == 'disallow') {
      API.addPreference('disallow_share', 1, function(){});
    } else {
      API.removePreference('disallow_share', 1, function(){});
    }
  });
  $('.share a.share-off').on('click', function(){
    API.quickLaunchModal($(this).data('modal'));
    return false;
  });
  //publish playlist
  $('.playlist-publish .btn').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    API.publishPlaylist($(this).data('publish') == 'remove' ? true : false);
    return false;
  });
  
  // -- ui form
  $('form.navbar-search .glyphicon').on('click', function(){
    var form = $(this).parents('form.navbar-search:first');
    form.submit();
    return false;
  });
  $('form.navbar-search').on('submit', function(){
    var input = $('.search-query', $(this));
    input.blur();
    var q = encodeURIComponent(input.val());
    console.log('script', 'searchbox blur', q);
    if (q) {
      top.location = API.config.v3_url + '/programmes/' + q;
    }
    return false;
  });

  // -- ui typeahead
  if ('matchMedia' in window) {
    if (window.matchMedia('(min-width:768px)').matches) {
      UI.typeahead('#nav-search .search-query');
    } else { 
      UI.typeahead('#nav-search-bis .search-query');
    }
  }
  $(document).on('submit','#nav-search, #nav-search-bis', function(e){
    e.preventDefault();
  });

  // -- typeahead on keypress
  /*
  $(document).on('keypress', function(e) {
    UI.startSearching(true);
  });
  $('#nav-search .search-query').on('focus', function(e) {
    UI.startSearching(false);
  })
  $('#nav-search .search-query').on('blur', function(e) {
    UI.endSearching();
  });
  */
  //focus
  if(!$('html').hasClass('touch')){
    $('.search-query').trigger('focus');
  }
  // -- ui playlist
  $('#top-playlist').on('show.bs.collapse', function () {
    console.log('script', '#top-playlist on show');
    $(".dropdown").removeClass("open");
    $('body').addClass('playlist-in');
  });
  $('#top-playlist').on('hide.bs.collapse', function () {
    console.log('script', '#top-playlist on hide');
    $('body').removeClass('playlist-in');
    if( $('body').hasClass('view-program_pere') ){
      $('body').addClass('playlist-w-in');
    }
  });
    
  $(document).on('click', '#top-playlist .breadcrumb li:first', function(){
    Skhf.session.initSelector();
  });
  $(document).on('click', '#top-playlist li.selector', function(e){
    console.log('script', 'li.selector', 'click');
    if (this.id == 'friends') {
      window.location.href = API.config.v3_url + '/user/friends/';
      return false;
    }
    if ($(this).hasClass('empty')) {
      if ($('a', $(this)).data('modal')) {
        e.preventDefault();
        e.stopPropagation();
        API.quickLaunchModal($('a', $(this)).data('modal'));
        return false;
      }
    } else {
      e.preventDefault();
      e.stopPropagation();
      UI.loadPlaylist(this.id);
      return false;
    }
  });

  $('#top-header a[data-toggle="dropdown"]').on('click', function () {
    if ($('#top-playlist').hasClass('in')) {
      console.log('script', 'a[data-toggle="dropdown"] on show');
      $('#top-playlist').collapse('hide');
    }
  });


/* END */
  if( $('#channel60').length == 0){
  //-- Script  pour le helper première visite
  $('.help-sprite.help-sprite-ms_btn_help').on('click', function () {
    $(this).toggleClass('help-sprite-ms_btn_help');
    $(this).toggleClass('help-sprite-ms_btn_close');
    $('.help-popin').toggleClass('hide');
    $('.modal-backdrop.in').toggleClass('hide');
  });
  $('.help-popin').on('click', function () {
    $('.help-sprite').toggleClass('help-sprite-ms_btn_help');
    $('.help-sprite').toggleClass('help-sprite-ms_btn_close');
    $('.help-popin').toggleClass('hide');
    $('.modal-backdrop.in').toggleClass('hide');
    API.cookie('new','true');
  });
}
  
  //alert nouveau visiteur
  $('#main .help-sprite-ms_btn_close').on('click', function(){
    API.cookie('new','true');
  });

  //Warning IE7
  if($('html').hasClass('lt-ie8')){
    if(!$.cookie('myskreen_ie7')){
      $('.lt-ie8-pop').toggleClass('hide');
      $('.modal-backdrop.in').toggleClass('hide');
      if( !$('.help-popin').hasClass('hide') ){
        $('#main .help-sprite-ms_btn_close').trigger('click');
        API.cookie('new',null);
      }
    }
    $('.lt-ie8-pop .ie-body .btn').on('click', function(){
       API.cookie('ie7','true');
       $('.lt-ie8-pop').toggleClass('hide');
       $('.modal-backdrop.in').toggleClass('hide');
       if(!$.cookie('myskreen_new')){
        $('#main .help-sprite-ms_btn_help').trigger('click');
      }
    });
  }

  $('div[id*="carousel-"]').on('slid.bs.carousel', function(){
    $('.teaser-slider iframe', this).remove();  
    if ($('.item.active', this).is('[data-teaser-id]')) {
      var teaser = $('.item.active', this).data('teaser-id');
      var node = '<iframe src="http://api.myskreen.com/skPlayerPlugin/iframe.php?is_iframe=1&play=' + teaser + '&fromWebsite=1&default_version=VOST&autoplay=false" scrolling="no" frameborder="0"></iframe>';
      // console.log('scripts/_default.js', 'slid.bs.carousel', 'node', node);
      $('.item.active .teaser-slider', this).prepend(node);
    }
  });

  // -- playlist friends
  setTimeout(function(){
   UI.addFriendsPrograms();
  }, 700);

  $(".burger-icon").click(function(e) {
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:1250px)').matches) {
        $('#super-wrapper').toggleClass('closed');
      } else {
        e.preventDefault();
        $('#super-wrapper').toggleClass('active');
        if (window.matchMedia('(min-width:767px)').matches) {
          if ($('#super-wrapper').hasClass('active')) {
            $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
          } else {
            $('head').append('<meta name="viewport" content="width=1010">');
          }
        }
      }
    }
  });

  // -- chaines tnt
  console.log('scritps/home.js', 'chaines-listing', $('.chaines-listing a img'));
  $('.chaines-listing a img').hover(
    function() {
      console.log('scritps/home.js', 'chaines mouseover');
      $(this).attr('src', $(this).attr('src').replace('?f=2', '?'));
    }, function() {
      console.log('scritps/home.js', 'chaines mouseout');
      $(this).attr('src', $(this).attr('src').replace('?', '?f=2'));
    }
  )

  /*$(document).on('click', '.btn-pass-subscribe-modal', function(){
    $('.btn-pass-subscribe').trigger('click');
  });*/

  /*$(document).on('click', '#promopass a, #passlabel a', function(e){
    e.preventDefault();
    ga('send', 'event', 'link', 'click', 'click-to-pass-page');
    var url = $(this).attr('href');
    window.location.href = url;
  });*/


    // Load of programs list and load of player
    if ($('#player-user-ba').length) {
      Player.elmt = $('#player-user-ba');
      UI.appendLoader($('.user-loader'));
      setTimeout(function(){
        load_program_user();
      }, 1500);
    }

    //player
    $('.slider-player [data-play-program-id]').on('click', function(e){
      e.preventDefault();
      console.log('scripts/_default.js', 'play program');
      $('.teaser-category iframe').attr('src', 'http://player.myskreen.com/watch-program-'+$(this).data('play-program-id')+'/');
    
      API.query(
        'GET', 
        'program/' + $(this).data('play-program-id') + '.json', 
        { no_metadata: 0 }, 
        function(program){
          console.log('scripts/_default.js', 'update program info', program);
          $('.teaser-title').html(
            '<div class="prog-title"><a class="btn btn-default btn-suivre btn-plus fav-program" data-id="' + program.id + '">Ajouter à ma chaîne</a><small>' + program.format.name + ' - ' + program.duration + 'mn</small><a href="' + API.config.v3_root + program.seo_url + '" class="ellipsis">' + program.title + '</a></div>' + 
            '<div class="prog-actions"><a class="btn btn-default" href="' + program.seo_url + '">Détails</a></div>'
          );
        });

      $('html, body').animate({scrollTop : 200}, 800);
      return false;
    });

});

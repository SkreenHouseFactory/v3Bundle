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

    //mobile alerte app
    var ua = navigator.userAgent.toLowerCase();
    // Redirect to Android-site
    if (document.location.href.indexOf('/apps') &&
        !API.cookie('_alert_apps') &&
        ((ua.indexOf('android') != -1 && ua.indexOf('mobile')) ||
         (ua.indexOf('ios') != -1  || ua.indexOf('iphone') != -1 ||  ua.indexOf('ipod') != -1))) {
      if (confirm("Voulez-vous installer l'application myskreen ?")) { 
        window.location = 'https://www.myskreen.com/apps';
      }
      API.cookie('_alert_apps', 1);
    }

    //tjs après ci-dessus : pas de console sur ie
    console.log('script', 'API.init callback');

    //load player APIs
    var tag = document.createElement('script');
    tag.src = API.config.base.replace('api/', '') + 'skPlayerPlugin/js/SkhfPlayerIframeApi.js';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    if(!API.cookie('session_uid')){
      $('.headertoprighticons').removeClass('hide');
    }
    
    // -- DOM interactions
    UiView.init();
    
    // -- session
    Skhf.session = new Session(function(){
      console.log('script', 'Session.init', 'callback');
      $('.headertoprighticons').removeClass('hide');
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
    Player.stop();
    UI.auth();    
    return false;
  });
  $('a.signout').on('click', function(){
    Skhf.session.signout();
    return false;
  });
  

  // new header nav bar
  $('.navbar-nav >li').on('mouseover',function(){
    var self = $(this);
    if($('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('hide');
    }
    $('.dropdown').removeClass('open');
    $('.hover-menu', self).removeClass('hide');

  });
  $('.navbar-nav >li').on('mouseout',function(){
    var self = $(this);
    $('.hover-menu', self).addClass('hide');
  });

  //notifications
  $('.user-on .dropdown-toggle, .user-on [data-target]').on('click', function(){

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
    if($('.user-on .notifications-count .badge').length) {
     Skhf.session.readNotifications();
     var current = $('.navbar .notifications li:not(.divider, .empty)').length;
     $('.navbar .notifications-count span.badge').removeClass('ms-notificon').html(current);
    }
  });
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
  $('.navbar form.navbar-search i.glyphicon').on('click', function(){
    $('.navbar form.navbar-search').submit();
    return false;
  });
  $('.navbar form.navbar-search').on('submit', function(){
    $('.search-query', $(this)).blur();
    var q = encodeURIComponent($('.search-query', $(this)).val());
    console.log('script', 'searchbox blur', q);
    if (q) {
      top.location = API.config.v3_url + '/programmes/' + q;
    }
    return false;
  });
  //ENCART VOD
  $('.encart-vod .encart-header .btn').on('click', function(e){
    $('.encart-vod').toggleClass('in','addOrRemove');
    if($('.encart-vod').hasClass('in')){
      $('.encart-vod .encart-header .btn i').attr('class','glyphicon glyphicon-remove')
      $('.encart-vod .encart-header .btn span').html('Fermer');
      $('#view-home').addClass('encart-in');
    }
    else{
      $('.encart-vod .encart-header .btn i').attr('class','glyphicon glyphicon-info-sign')
       $('.encart-vod .encart-header .btn span').html('En savoir plus');
       $('#view-home').removeClass('encart-in');
    }
    e.preventDefault();
    e.stopPropagation();
  });
  // -- ui typeahead
  UI.typeahead('#nav-search .search-query');

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
  
  if (!API.cookie('session_uid')){
      $('.headertoprighticons').removeClass('hide');
      setTimeout( function(){
        if (typeof Skhf.session.callbackSignin == 'function') {
          Skhf.session.callbackSignin();
        }
      }, 700);
    }
    
  $(document).on('click', '#top-playlist .breadcrumb li:first', function(){
    Skhf.session.initSelector();
  });
  $(document).on('click', '#top-playlist li.selector', function(e){
    console.log('script', 'li.selector', 'click');
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

  $('.navbar a[data-toggle="dropdown"]').on('click', function () {
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
  if(!$.cookie('myskreen_new')){
    //$('#main .help-sprite-ms_btn_help').trigger('click');
  }
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

   // -- beead selector & tab
   /*
   if ($('#program-teaser-player').length == 0) {
     console.log('script', 'beead', 'load');
     $('body').append('<script type="text/javascript" src="http://as.ebz.io/api/choixPubJS.htm?pid=305331&screenLayer=1&mode=NONE&home=http://www.myskreen.com"></script>');
   }
   */

  // -- playlist friends
  setTimeout(function(){
   UI.addFriendsPrograms();
  }, 700);
});
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

    //tjs après ci-dessus : pas de console sur ie
    console.log('script', 'API.init callback');

    //Modernizr.load();

    // -- DOM interactions
    UiView.init();

    // -- session
    Skhf.session = new Session(function(){
      console.log('script', 'Session.init', 'callback');
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
  
  //alert bug video
  /*
   if(!$.cookie('myskreen_alert_video')){
    UI.editSkModal('Avertissement','Une opération de maintenance est en cours pour améliorer la qualité de nos vidéos, cela peut entraîner quelques perturbations sur mySkreen. Nous nous excusons de la gêne occasionnée.','Continuer',2,3,true);
    $('body').append('<div class="modal-backdrop in"></div>');
    $('#skModal').removeClass('hide');
    $('#skModal .modal-footer img').css('float','left');
  }
  $('#skModal .modal-footer button').on('click', function(){
    $('.modal-backdrop').remove();
    $('#skModal').addClass('hide');
    API.cookie('alert_video','true');
  });*/

$('.user-on .dropdown-toggle, .user-on [data-target]').on('click', function(){
    //notifications
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

      if($('.badge-important', $(this)).length > 0) {
       Skhf.session.readNotifications();
       var current = $('.navbar .notifications li:not(.divider, .empty)').length;
       $('.navbar .notifications-count span.badge').removeClass('badge-important').html(current);
     }
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
  // new header nav bar

  $("dropdown").on('click', function(e){
    if($(this) && !$(this).hasClass('open')){  
      $(this).addClass('open');
      e.preventDefault();
      e.stopPropagation();
    }    
  });
  // -- ui form
  $('.navbar form.navbar-search i.icon-search').on('click', function(){
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

  // -- ui typeahead
  UI.typeahead('#nav-search .search-query');

  // -- typeahead on keypress
  $(document).on('keypress', function(e) {
    UI.startSearching(true);
  });
  $('#nav-search .search-query').on('focus', function(e) {
    UI.startSearching(false);
  })
  $('#nav-search .search-query').on('blur', function(e) {
    UI.endSearching();
  });

  // -- ui playlist
  $('#top-playlist').on('show', function () {
    console.log('script', '#top-playlist on show');
    $('body').addClass('playlist-in');
  });
  $('#top-playlist').on('hide', function () {
    console.log('script', '#top-playlist on hide');
    $('body').removeClass('playlist-in');
  });
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
//ui text show more

$(".show-more").click(function () {
  $(".text-toggle-extend").toggleClass("show-more-height");

  if($(".text-toggle-extend").hasClass("show-more-height")) {
    $(this).html('Voir moins...<i class="glyphicon glyphicon-arrow-up"></i>');
  } else {
    $(this).html('Voir plus...<i class="glyphicon glyphicon-arrow-down"></i>');
  }



});


/* END */

  // -- playlist friends
  setTimeout(function(){
    UI.addFriendsPrograms();
  }, 700);
});




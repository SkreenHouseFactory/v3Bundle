//pause player if leaving
$(window).unload(function() {
  if (Player.state == 'playing') {
    Player.pause();
  }
});

$(document).ready(function(){

  // -- init
  API.init(function(){

    //tjs après ci-dessus : pas de console sur ie
    console.log('script', 'API.init callback');

    //Modernizr.load();

    // -- session
    Skhf.session = new Session(function(){
      console.log('script', 'Session.init', 'callback');
    });
  });

  // ui
  UI.init(function(){
    console.log('script', 'UI.init', 'callback');

    //TEST
    //API.insertIndexedDb('skhf', 'friends', {id: 2, uid: 'frienduid'});
    //API.selectIndexedDb('skhf', 'friends', 2);
  });

  // -- ui user
  $('a.auth').click(function(){
    UI.auth();
    return false;
  });
  $('a.signout').click(function(){
    Skhf.session.signout();
    return false;
  });
  $('.user-on .dropdown-toggle, .user-on [data-target]').click(function(){
    //notifications
    if ($(this).hasClass('notifications-count') && 
        $('.badge-important', $(this)).length > 0) {
      Skhf.session.readNotifications();
      var current = $('.navbar .notifications li:not(.divider, .empty)').length;
      $('.navbar .notifications-count span.badge').removeClass('badge-important').html(current);
    }
  });
  $('.share .btn').click(function(){
    if ($(this).data('share') == 'disallow') {
      API.addPreference('disallow_share', 1, function(){});
    } else {
      API.removePreference('disallow_share', 1, function(){});
    }
  });
  $('.share a.share-off').click(function(){
    API.quickLaunchModal($(this).data('modal'));
    return false;
  });

  // -- ui form
  $('.navbar form.navbar-search i.icon-search').click(function(){
    $('.navbar form.navbar-search').submit();
    return false;
  });
  $('.navbar form.navbar-search').submit(function(){
    $('.search-query', $(this)).blur();
    var q = encodeURIComponent($('.search-query', $(this)).val());
    console.log('script', 'searchbox blur', q);
    if (q) {
      top.location = API.config.v3_url + '/programmes/' + q;
    }
    return false;
  });

  // -- ui typeahead
  UI.typeahead('.navbar-search .search-query');

  // -- ui playlist
  $('#top-playlist').on('show', function () {
    console.log('script', '#top-playlist on show');
    $('body:not(.view-homes, .view-homes_vod, .view-channel) #main').animate({paddingTop: 400}, function(){
      $('body').addClass('playlist-in');
    })
  });
  $('#top-playlist').on('hide', function () {
    console.log('script', '#top-playlist on hide');
    $('body:not(.view-homes, .view-homes_vod, .view-channel) #main').animate({paddingTop: 80}, function(){
      $('body').removeClass('playlist-in');
    })
  });
  $(document).on('click', '#top-playlist .breadcrumb li:first', function(){
    Skhf.session.initSelector();
  });
  $(document).on('click', '#top-playlist li.selector', function(e){
    e.preventDefault();
    e.stopPropagation();
    console.log('script', 'li.selector', 'click');
    if ($(this).hasClass('empty')) {
      if ($('a', $(this)).data('modal')) {
        API.launchModal($('a', $(this)).data('modal'));
      } else {
        $('a', $(this)).click();
      }
    } else {
      UI.loadPlaylist(this.id);
    }
    return false;
  });

  $('.navbar a[data-toggle="dropdown"]').on('click', function () {
    if ($('#top-playlist').hasClass('in')) {
      console.log('script', 'a[data-toggle="dropdown"] on show');
      $('#top-playlist').collapse('hide');
    }
  });

  /* END */

  // -- playlist friends
  setTimeout(function(){
    UI.addFriendsPrograms();
  }, 700);
});
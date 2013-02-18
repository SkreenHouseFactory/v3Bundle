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
    console.log('script', 'API.init callback', API.context);

    //Modernizr.load();
    UI.loadFilters('home');

    // sync v2
    if (top.location != self.document.location) {
      API.syncV2(function(){
        //callback sync
      });
    }
    // -- session
    Skhf.session = new Session(function(){
      console.log('script', 'Session.init', 'callback');

			/* pages : TODO > move into dedicated page script file. exple : scripts/program.js */
			//theater playlist
			if ($('#program-offers #trigger-theaters-playlist').length){
				$('#program-offers #trigger-theaters-playlist').trigger('click');
			}
      //affichage bulle pendant 4s sur fiche programme
      if (!Skhf.session.datas.email && 
          $('#program-follow .fav').length > 0) {
        setTimeout(function(){
          $('#program-follow .fav').each(function(){
            var trigger = $(this);
            UI.installPopover(trigger);
            trigger.popover('show');
    
            setTimeout(function(){
              trigger.popover('hide');
            }, 6000);
          });
        }, 2000);
      }
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
    if ($(this).hasClass('notifications-count') && 
        $('.badge-important', $(this)).length > 0) {
      Skhf.session.readNotifications();
      var current = $('#top-bar .notifications li:not(.divider, .empty)').length;
      $('#top-bar .notifications-count span.badge').removeClass('badge-important').html(current);
    }

    if (API.context == 'v2') {// for tv guide
      console.log('toggleheader');
      if (!$('#top-playlist').hasClass('in') && $('#top-bar .nav li.open').length == 0) {
        API.postMessage(['header', 'add_playlist']);
      } else {
        API.postMessage(['header', 'remove_playlist']);
      }
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
    if (API.context == 'v2') {
      API.postMessage(['modal', 'facebook']);

    } else {
      API.quickLaunchModal($(this).data('modal'));
    }

    return false;
  });

  // -- ui nav
  $('#top-filters > ul > li').click(function(e){
    $('#top-filters > ul > li').removeClass('active');
    $(this).addClass('active');
  });

  // -- ui form
  $('#top-bar form.navbar-search').hover(function(){
    $('i.icon-search', this).removeClass('icon-white');
  },function(){
    $('i.icon-search', this).addClass('icon-white');
  });
  $('#top-bar form.navbar-search i.icon-search').click(function(){
    $('#top-bar form.navbar-search').submit();
    return false;
  });
  $('#top-bar form.navbar-search').submit(function(){
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
    $('.nav li.open').removeClass('open');
    API.postMessage(['header', 'add_playlist']);
  });
  $('#top-playlist .breadcrumb li:first').live('click', function(){
    Skhf.session.initSelector();
  });
  $('#top-playlist li.selector').live('click', function(){
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
  $('#top-bar a[data-toggle="dropdown"]').on('click', function () {
    if (API.context != 'v2' && $('#top-playlist').hasClass('in')) {
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
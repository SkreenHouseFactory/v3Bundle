$(document).ready(function(){

  // -- init
  API.init(function(){

    //tjs après ci-dessus : pas de console sur ie
    console.log('script', 'API.init');

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
      console.log('script', 'context', API.context);
      Skhf.session.initPlaylist();    
    });

    // -- ad
    UI.cheat();
  });

  // ui
  UI.init(function(){
    console.log('script', 'UI.init', 'callback');
  });

  // -- ui user
  $('a.signin').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["signin"]);
    } else {
      API.quickLaunchModal('signin', function() {
        Skhf.session.sync();
      });
    }
    return false;
  });
  $('a.signout').click(function(){
    Skhf.session.signout();
    return false;
  });
  $('a.account').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["account"]);
    }
    return false;
  });
  $('.user-on .dropdown-toggle').click(function(){

    if (!$('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('show');
    }
    if ($(this).hasClass('notifications-count') && $(this).find('.badge-important')) {
      Skhf.session.readNotifications();
      var current = $('#top-bar .notifications li:not(.divider, .empty)').length;
      $('#top-bar .notifications-count span.badge').removeClass('badge-important').html(current);
    }
  });
  $('.share .btn').click(function(){
    if ($(this).data('notify') == 'disallow') {
      API.addPreference('disallow_notify', 1, function(){});
    } else {
      API.removePreference('disallow_notify', 1, function(){});
    }
  });
  
  $('.share a.share-off').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["modal", "facebook"]);
    }
    return false;
  });

  // -- ui nav
  $('#top-filters > ul > li').click(function(e){
    $('#top-filters > ul > li').removeClass('active');
    $(this).addClass('active');
  });

  // -- ui form
  $('#top-bar form.navbar-search a').click(function(){
    $(this).parent().submit();
    return false;
  });
  $('#top-bar form.navbar-search').submit(function(){
    var q = encodeURIComponent($('.search-query', this).val()));
    console.log('search', '/programmes/' + q);
    if (q) {
      API.linkV2('/programmes/' + q);
    }
    return false;
  });

  // -- ui typeahead
  UI.typeahead('.search-query');
  $('.navbar-search').submit(function(){
    console.log('script', 'searchbox blur', $('.search-query', $(this)));
    $('.search-query', $(this)).blur();
  });

  // -- ui playlist
  //height header
  $('#top-playlist').on('show', function () {
    console.log('script', '#top-playlist on show');
    API.postMessage(['header', 'add_playlist'])
  });
  $('#top-playlist').on('hide', function () {
    console.log('script', '#top-playlist on hide');
    API.postMessage(['header', 'remove_playlist'])
  });
  $('#top-playlist h2').live('click', function(){
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

  // -- ui link/url
  $('a[data="url"]').live('click', function(e){
    e.preventDefault();
    console.log('ui link/url', 'a[data="url"]');
    API.linkV2($(this).data('url'));
    return false;
  });
  $('a.link-v2').live('click', function(e){
    console.log('ui link/url', 'linkV2');
    e.preventDefault();
    API.linkV2($(this).attr('href'), $(this).hasClass('link-force'));
    return false;
  });
  $('a.javascript-v2').live('click', function(e){
    console.log('ui link/url', 'javascriptV2');
    e.preventDefault();
    API.javascriptV2($(this).attr('href').replace('javascript://',''));
    return false;
  });
  $('a[data-modal]').live('click', function(){
    console.log('script', 'a[data-modal]', 'click');
    API.quickLaunchModal($(this).data('modal'));
    return;
  });

  // -- ui actions : favorite & play
  $('.slider li:not(.selector), .slider li').live('click', function(e){
    e.preventDefault();
    API.linkV2($('a.title', this).attr('href'), false, function(){});
    return false;
  });
  $('.actions .fav').live('click', function(e){
    e.preventDefault();
    UI.togglePlaylistProgram($(this));
    return false;
  });
  $('.actions .play').live('click', function(e){
    e.preventDefault();

    if ($(this).data('redirect')) {
      console.log('script', 'player redirect', $(this));
      UI.loadRedirect($(this).attr('href'));

    //player
    } else if ($(this).data('player')) {
      console.log('script', 'player embed', $(this));
      UI.loadPlayer($(this));

    } else {
      API.linkV2($(this).attr('href'));
    }
    
    if ($(this).parent().parent().find('.badge')) {
      API.markAsRed($(this).parent().data('id'));
    }

    return false;
  });
  //couchmode
  $('[data-couchmode]').click(function(){
      var args = $.extend({session_uid: Skhf.session.uid}, $(this).data('couchmode'));
      console.log('script', 'data-couchmode', args);
      Couchmode.init(args);
  });

  // -- .fav : retirer / popover
  $('.actions .fav').live('hover', function(event) {
    //console.log('script', '.fav:hover', event.type);
    if (event.type == 'mouseover' || event.type == 'mouseenter') {
      // retirer
      if ($(this).hasClass('btn-primary')) {
        $(this).removeClass('btn-primary')
               .addClass('btn-danger')
               .html('<i class="icon-remove-sign icon-white"></i> Retirer');
      //popover
      } else if (!$(this).hasClass('btn-danger')) {
        if ($(this).parent().data('onglet') == 'emissions' || $(this).parent().data('onglet') == 'series') {
          var content = '<b>Ne ratez plus vos programmes&nbsp;!</b>' +
                        '<br/>En ajoutant ce programme à vos playlists vous serez averti dès qu\'un épisode est disponible !';
        } else {
          var content = '<b>Ne ratez plus vos programmes&nbsp;!</b>' + 
                        '<br/>En ajoutant ce programme à vos playlists vous saurez quand il passe à la télé ou au cinéma et s\'il est disponible en Replay ou en VOD.';
        }

        $(this).popover({placement: 'top',
                         title:	function() { return 'Ajout à vos playlists'},
                         content: content,
                         show: 500, 
                         hide: 100})
               .popover('show');
      }
    } else if (event.type == 'mouseout' || event.type == 'mouseleave') {
      $(this).popover('hide');
      if ($(this).hasClass('btn-danger')) {
        $(this).removeClass('btn-danger').addClass('btn-primary').html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists');
      }
    }
  });

  // -- ui player autoplay
  $('a[data-player-autoplay="1"]').each(function(){
    console.log('script', 'player autoplay', $(this));
    UI.loadPlayer($(this));
    return false;
  });

  // -- ui redirect autoload
  if ($('#redirect iframe').length > 0) {
    console.log('UI.loadRedirect()', $('#redirect iframe').length);
    UI.loadRedirect();
  }

  // -- nav-alpha-client
  $('.pagination-client-alpha li').click(function(){
    console.log('script', 'nav-alpha-client', '[data-alpha="' + $('a', this).html() + '"]', $('[data-alpha="' + $('a', this).html() + '"]'));
    if ($('a', this).html().length > 1) {
      $('[data-alpha]').show();
    } else {
      $('[data-alpha]').hide();
      $('[data-alpha="' + $('a', this).html() + '"]').show();
    }
    $('.pagination-client-alpha li').removeClass('active');
    $(this).addClass('active');
  });

  // -- popover
  $('[data-content]').popover();

  // -- tooltip
  $('[rel="tooltip"]').tooltip();

  // -- btn-radio
  $('[data-toggle="buttons-radio"] > *').click(function(){
    $('> *', $(this).parent()).removeClass('active btn-primary');
    $(this).addClass('active btn-primary');
  });

  /* PAGES */

  // -- channel
  $('.trigger-channel').click(function(){
    UI.refreshChannel($(this).parent().data('channel-id'));
  });
  $('.trigger-channel-date').change(function(){
    UI.refreshChannel($(this).data('channel-id'));
  });
  if (channel_name = $('#view-channel h1').html()) {
    $('[title="'+channel_name+' Replay"]').parent().addClass('active');
  }
  
  /* TOUCH */
  if ($('html').hasClass('touch')) {
    $('html.touch .tv-component, html.touch .tv-component *').live('touchstart', function(e){
      e.preventDefault();
      e.stopPropagation();

      $(this).trigger('click');
      return false;
    });
  }
});
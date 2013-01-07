//TODO : redirect mobile

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
      //Skhf.session.initPlaylist(); //2 appels : deconnecté/connecté. TO DO : passer à 1 seul
    });

    // -- ad
    UI.cheat();
  });

  // ui
  UI.init(function(){
    console.log('script', 'UI.init', 'callback');
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
  $('a.account').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["account"]);
    }
    return false;
  });
  $('.user-on .dropdown-toggle').click(function(){

    if (API.context == 'v2' && !$('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('show');
    }
    if ($(this).hasClass('notifications-count') && $(this).find('.badge-important')) {
      Skhf.session.readNotifications();
      var current = $('#top-bar .notifications li:not(.divider, .empty)').length;
      $('#top-bar .notifications-count span.badge').removeClass('badge-important').html(current);
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
    console.log('script', 'searchbox blur', $('.search-query', $(this)));
    $('.search-query', $(this)).blur();
    var q = encodeURIComponent($('.search-query', this).val());
    console.log('search', '/programmes/' + q);
    if (q) {
      document.location = '/programmes/' + q;
    }
    return false;
  });

  // -- ui typeahead
  UI.typeahead('.navbar-search .search-query');

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

  // -- ui modal
  $('.modal').on('show', function(){
    Player.pause();
  });

  // -- ui actions : favorite & play
  $('.slider li:not(.selector)').live('click', function(e){
    console.log('script', '.slider li:not(.selector)', $('a.title', this));
    document.location = API.config.v3_root + $('a.title', this).attr('href');
    return false;
  });
  $('.actions .fav').live('click', function(e){
    e.preventDefault();
    UI.togglePlaylistProgram($(this));
    return false;
  });
  /*
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
  */


  // -- play deporte
  $('[data-play]').live('click', function(){
    console.log('script', 'data-play', $(this));
    API.play($(this).data('play'), $(this).data('play-args'));
    return false;
  });

  // -- ui redirect autoload
  if ($('#redirect iframe').length > 0) {
    console.log('UI.loadRedirect()', $('#redirect iframe').length);
    UI.loadRedirect();
  }
  $('[data-redirect]').live('click', function(){
      console.log('script', 'player redirect', $(this));
      UI.loadRedirect($(this).data('redirect'));
  });

  // -- couchmode
  $('[data-couchmode]').live('click', function(){
      var args = $.extend({session_uid: Skhf.session.uid}, $(this).data('couchmode'));
      console.log('script', 'data-couchmode', $(this).data('couchmode'), args);
      Couchmode.init(args);
  });

  // -- couchmode autoplay
  $('a[data-couchmode-autoplay="1"]').each(function(){
    console.log('script', 'couchmode autoplay', $(this));
    $(this).trigger('click');
    return false;
  });

  // -- player autoload
  $('[data-player-autoload]').each(function(){
    var trigger = $(this);
    console.log('script', 'player autoload', trigger.data('player-autoload'), trigger);
    Player.init(trigger);
    var args = trigger.data('player-jscontrolbar') ? {control: 'disabled'} : {};
    Player.playOccurrence(trigger.data('player-autoload'), function(){
      if (trigger.data('player-muted')) {
        Player.mute();
      }
    }, args);
    
    $(this).data('player-loaded', 1);
  });

  // -- carousel autoload
  $('[data-carousel-autoload="1"]').each(function(){
    console.log('script', 'carousel-autoload', $(this));
    $(this).carousel({interval: 7000, pause: 'hover'});
    $(this).data('carousel-loaded', 1);
  });

  // -- .fav : retirer / popover
  $('.actions .fav').live('hover', function(event) {
    //console.log('script', '.fav:hover', event.type);
    if (event.type == 'mouseover' || event.type == 'mouseenter') {
      // retirer
      if ($(this).hasClass('btn-primary')) {
        $(this).removeClass('btn-primary')
               .addClass('btn-danger')
               .html('<i class="icon-remove-sign icon-white"></i> Retirer des playlists');
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
  if ($('#view-channel').length > 0) {
    $('.trigger-channel').click(function(){
      UI.refreshChannel($(this).parent().data('channel-id'));
    });
    $('.trigger-channel-date').change(function(){
      UI.refreshChannel($(this).data('channel-id'));
    });
    if (channel_name = $('#view-channel h1').html()) {
      $('[title="'+channel_name+' Replay"]').parent().addClass('active');
    }
  }

  // -- program
  if ($('#view-program').length > 0) {

    //no deportes
    if ($('#trigger-deportes').data('nb') == 0) {
      $('#triggers li:nth-child(2) a').trigger('click');
    }

    //ics
    $('#broadcasts tr').click(function(e){
      e.preventDefault();
      document.location = API.config.base + '1/icsfile/' + $(this).data('id')  + '.ics';
      return false;
    });

    //episodes
    $('#program-offers .episode').live('hover', function(event) {
      var trigger = $(this);
      if (event.type == 'mouseover' || event.type == 'mouseenter') {
        if (!trigger.data('loaded')) {
          API.query('GET',
                    'program/' + $(this).data('episode-id') + '.json',
                    {
                      with_metadata: 1,
                      img_width: 200
                    },
                    function(json) {
                      var content = (json.year != null ? json.year : '') + 
                                    '<br/><small>' + json.description + '</small>' +
                                    '<hr/><p align="center"><img src="' + json.picture + '" alt="' + json.title + '" /></p>';
                      trigger.data('loaded', true);
                      trigger.attr('data-content', content);
                      trigger.popover('show');
                    });
        } else {
          trigger.popover('show');
        }
      } else {
        trigger.popover('hide');
      }
    });

    //theaters
    var trigger = $('#trigger-theaters, #trigger-theaters-geoloc');
    var container = $('#theaters-list');
    console.log('trigger-theaters', trigger);
    trigger.live('click', function(){
      container.empty();
      UI.appendLoader(container);
      //geoloc
      API.geolocation(function(position){
        container.load(container.data('api-url') + '?latlng=' + position);
      }, function(msg, code){
        container.preprend('<p class="alert alert-error">' + msg + '</p>');
      });
      // - de 10
      if ($('#trigger-theaters').data('nb') <= 10) {
        API.query('GET',
                  container.data('api-url'),
                  {dataType: 'text html'},
                  function(datas){
                    UI.removeLoader(container);
                    container.html(datas);
        });
      }
      return false;
    });
    $('#theaters-search').submit(function(){
      container.empty();
      UI.appendLoader(container);
      API.query('GET',
                API.config.v3_url + container.data('api-url') + '?q=' + escape($('#theaters-search .search-query').val()),
                {dataType: 'text html'},
                function(datas){
                  UI.removeLoader(container);
                  container.html(datas);
      });
      return false;
    });
    
    //youtube
    var trigger = $('#view-program [data-more-streaming]');
    if (trigger &&
        trigger.data('more-streaming')) {
      console.log('data-more-streaming', trigger);
      var url = 'program/more-streaming/' + trigger.data('more-streaming') + '.json';
      API.query('GET',
                url,
                {nb_results: 24},
                function(programs) {
                  if (programs.length == 0) {
                    return;
                  }
                  //TODO : sort by duration ?
                  console.log('more-streaming', ' callback', programs.length);
                  trigger.prepend('<br/><p class="lead"><small>' + programs.length + ' vidéos YouTube</small></p>');
                  var container = $('#ytCarousel .carousel-inner .item:first-child');
                  var c_index = 0;
                  for (var i = 0; i < programs.length; i++) {
                    //console.log('youtube callback', 'c_index:' + c_index, 'modulo:' + i%8, container);
                    if (i%8 == 0) {
                      c_index++;
                      var item = $('<div class="item' + (i ==0 ? ' active' : '') + '"></div>')
                      container = $('#ytCarousel .carousel-inner').append(item);
                    }
                    item.append('<a href="#" data-couchmode=\'{"type": "remote", "id": "' + encodeURIComponent(url) + '", "autoplay": "' + programs[i].id + '"}\' class="pull-left">' +
                                   '<span>' + programs[i].duration + ' min.</span>' +
                                   '<img width="150px" class="img-polaroid" alt="' + programs[i].title + '" src="' + programs[i].picture + '" />' +
                                   '<div class="title">' + programs[i].title + '</div>' +
                                   '</a>');
                  }
                  
                  $('#ytCarousel').carousel({interval: 7000, pause: 'hover'}).removeClass('hide');
                });
    };
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

  /* FB */
  function fbsync() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.', response);
      API.query('POST', 'user', {
                  session_uid: Skhf.session.uid,
                  fbuid: response.id,
                  username: response.email,
                },
                function(){
                  Skhf.session.sync(function(){
                    $('.modal').modal('hide');
                  });
                });
    });
  }
  function fblogin() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        $('#fbconnect-infos').html('<span class="alert alert-success">Connexion à Facebook réussie ! Chargement ...</span>');
        fbsync();
      } else {
        // cancelled
        $('#fbconnect-infos').html('<span class="alert alert-error">La connexion à Facebook a échoué !</span>');
      }
    },{scope:'user_birthday,user_online_presence,email,read_friendlists,publish_stream,offline_access,friends_birthday,friends_likes,friends_online_presence,publish_actions'});
  }
  /* on shown
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.', response);
        $('#fbconnect-infos').html('<small>(' + response.name + ')</small>');
      });
    }
  });
  */
  //trigger
  $('#fbconnect').live('click', function(){
    console.log('script', 'trigger FB');
    fblogin();
    return false;
  })


  /* END */
  
  // -- playlist friends
  UI.addFriendsPlaylists();
});
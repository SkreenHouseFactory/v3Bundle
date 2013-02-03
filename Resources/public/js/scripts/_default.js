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

			/* pages */
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
  $('a[data-modal]').live('click', function(e){
    e.preventDefault();
    console.log('script', 'a[data-modal]', $(this).data('modal'), 'click');

    if ($(this).data('modal') == 'remote') {
      UI.appendLoader($('.modal .modal-body'), 1000);
      $('.modal .modal-header h3').html($(this).data('modal-title'));
      $('.modal .modal-body').load($(this).attr('href'));
      $('.modal').modal('show');
    } else {
			API.quickLaunchModal($(this).data('modal'));
			if ($(this).data('modal') == 'card') { //TODO : use UI.callbackModal
  			$('.modal').on('hidden',function(e) {
  			 e.preventDefault();
  				var url = document.location.toString();
  				if (url.match('#')) {
  					url = url.split("#")[0];
  				}
//	    API.linkV2(url + "#payment");
  		   	API.linkV2(url);
  		   	return false;
  			});
			}
    }
    return false;
  });

  // -- ui form
  $('[data-form="catch"]').each(function(){
    var form = $(this);
    API.catchForm(form, function(json){
      //callback
      console.log('ui form catched', form);
			// Modification préférences utilisateur
			if (form.attr('name') == 'user_settings_profile_form') {
				if ((typeof(json) != 'undefined') && (typeof(json.success) != 'undefined')) {
//					console.log("la value",$('input[name="update_mail"]').attr('value'));
					$('.username').html($('input[name="update_mail"]',form).attr('value'));
				}
			} else if (form.attr('name') == 'user_settings_password_form') {
			}
    });
  });

  // -- ui modal
  $('.modal').on('show', function(){
    $('.popover:visible').popover('hide');
    Player.pause();
    carousels = $('.carousel');
    if (carousels.length > 0) {
      carousels.each(function(){
        $(this).carousel('pause');
      });  
    }
  });
  $('.modal').on('hidden', function(){
    $('.popover:visible').popover('hide');
    $('.modal .modal-body').empty();
    
    //hack addtofavorite fb + callback modal
    if (UI.callbackModal) {
      UI.callbackModal();
      UI.callbackModal = null;
    }
    //TODO : Player.play();
    carousels = $('.carousel');
    if (carousels.length > 0) {
      carousels.each(function(){
        $(this).carousel('cycle');
      });
    }
  });

  // -- ui actions : play
  $('.slider li:not(.selector)').live('click', function(e){
    console.log('script', '.slider li:not(.selector)', $('a.title', this));
    document.location = API.config.v3_root + $('a.title', this).attr('href');
    return false;
  });
  /*
    if ($(this).parent().parent().find('.badge')) {
      API.markAsRed($(this).parent().data('id'));
    }
  });
  */

  // -- carousel autoload
  $('[data-carousel-autoload="1"]').each(function(){
    console.log('script', 'carousel-autoload', $(this));
    $(this).carousel({interval: 7000, pause: 'hover'});
    $(this).data('carousel-loaded', 1);
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
    console.log('script fbsync', 'fetching information...');
    FB.api('/me', function(response) {
      console.log('script fbsync', 'success: ' + response.name, response, FB.getAuthResponse());
      API.query('POST', 'user', {
                  session_uid: Skhf.session.uid,
                  fbuid: response.id,
                  username: response.email,
                  access_token: FB.getAuthResponse()['accessToken']
                },
                function(){
                  console.log('script fbsync', 'API.query callback');
                  Skhf.session.sync(function(sessionDatas){
                    $('.modal').modal('hide');
                    Skhf.session.signin(sessionDatas, function(){
                      console.log('script fbsync', 'API.query callback', 'Skhf.session.signin callback', sessionDatas);
                    });
                  });
                });
    });
  }
  function fblogin() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        $('#fbconnect-infos').html('<span class="alert alert-success nowrap">Connexion réussie! Chargement...</span>');
        fbsync();
      } else {
        // cancelled
        $('#fbconnect-infos').html('<span class="alert alert-error nowrap">La connexion a échoué !</span>');
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
  setTimeout(function(){
    UI.addFriendsPrograms();
  }, 700);
});

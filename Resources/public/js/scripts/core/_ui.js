/**
* load view scripts
* core : script that can be reused in other apps / bundles
*
*/

var UiView;
UiView = {
  elmt: null,
  init: function(elmt) {
    console.log('UiView.init', elmt);

    this.elmt = typeof elmt != 'undefined' && elmt ? elmt : $('body');
    if (history.pushState) {
      this.initHistory();
    }
    this.onLoad();
  },
  checkUrl: function() {
    if (document.location.href.match(/\?play/gi)) {
      console.log('?play', getUrlParameter('play'));
      $('[data-play="'+getUrlParameter('play')+'"]').trigger('click');
    }
    if (document.location.href.match(/\?click=/gi)) {
      setTimeout(function(){
        console.log('?click', getUrlParameter('click'), $(getUrlParameter('click')));
        $(getUrlParameter('click')).trigger('click');
      }, 500);
    }
  },
  update: function(elmt) {
    console.log('UiView.update', elmt);
    this.initDataTriggers(elmt);
    this.checkUrl();
  },
  onLoad: function() {
    console.log('UiView.onLoad');
    //data triggers
    this.initDataLive();
    this.initDataTriggers(this.elmt);
    this.checkUrl();

    // autoload modal from url
    var triggerModal = getUrlParameter('modal');
    if (triggerModal) {
      API.quickLaunchModal(triggerModal);
    }
    var urlPopin = getUrlParameter('popin');
    if (urlPopin) {
      API.launchModal((API.config.popin + urlPopin + '&proxy=v3').replace('createIframe', ','));
    }

    // trigger onload
    if ($('.trigger-onload').length > 0) {
      setTimeout(function(){
        $('.trigger-onload').each(function(){
          console.log('script', '.trigger-onload', $(this));
          $(this).trigger('click');
        });
      }, 500);
    }

    // ui modal
    if ($('.modal').length > 0) {
      $('.modal').on('shown.bs.modal', function(){
        //retrait des popover
        $('.popover').remove();
        //pause du player (retait pour iphone)
        if (navigator.userAgent.match(/iPhone|iPod/)) {
          Player.pause();
        } else if (typeof Skhf.Player != 'undefined' && typeof Skhf.session.email != 'undefined') {
          Skhf.Player.pause(); 
        }
        //pause carousels
        carousels = $('.carousel');
        if (carousels.length > 0) {
          carousels.each(function(){
            if ($(this).parent().attr('id') != 'carousel-bonus') //TOFIX
              $(this).carousel('pause');
          });  
        }
      });
      $('.modal').on('hidden.bs.modal', function(){
        $('.popover').remove();
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
    }
   
    // -- carousel pagnination ajax
    $('.carousel[data-api-url]').on('slide.bs.carousel', function(e){
      console.log('scripts/program.js', 'on slide.bs.carousel', e);
      var carousel = $(this);
      var current_slide = $('.carousel-inner .item.active', carousel);
      var idx = current_slide.index('.item');
      var ids = new Array();
      $('.tv-component', carousel).each(function(){
        ids.push($(this).data('id'));
      })
      $('.carousel-inner .item:empty', carousel).each(function(){
        UI.appendLoader($(this), 100);
      })
      setTimeout(function() {
        var new_slide = $('.carousel-inner .item.active', carousel);
        if ($('.tv-component', new_slide).length) {
          console.log('scripts/program.js', 'on slide.bs.carousel', 'already loaded');
          return;
        }
        new_slide.load(API.config.v3_url + '/slider/page?api-url=' + escape(carousel.data('api-url')) + '&page='+(idx+1)+'&img_width=143&img_height=180&slider_img_width=445&slider_img_height=180&offset='+(idx*6)+'&nb_results=6&exclude_ids='+ids.join(','), function(){
          Skhf.session.checkCredentials();
        });
      }, 700);
    })

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
      return false;
    });
    //remove popover
    $(document).on('click', '.popover .close', function() {
      //console.log('script', 'popovers destroy', $('.popover'));
      $('.popover').remove();
      return false;
    })

    // -- tooltip
    if ($('[data-toggle="tooltip"]').length > 0) {
      $('[data-toggle="tooltip"]').tooltip();
    }
    
    // -- focus search
    /*
    if (!navigator.userAgent.match(/iPhone|iPod/)) {
      console.log('script', 'focus', $('.navbar-search .search-query'));
      $('.navbar-search .search-query').focus();
    }
    */
  },
  initHistory: function(){
    var self = this;
    $(window).bind('popstate', function(e) {
      console.log('UiView.initHistory', 'popstate', e.originalEvent.state);
      if (e.originalEvent.state && typeof e.originalEvent.state.custom != 'undefined') {
        $('#content').load(window.location.pathname + '?xhr=1', function() {
          console.log(e.originalEvent.state );
          if(e.originalEvent.state.document_title){
            document.title = e.originalEvent.state.document_title;
          }
          if(e.originalEvent.state.has_filter == true){
            $('.dropdown-filters2').removeClass('hide');
          }
          if(e.originalEvent.state.has_skin){
           self.refreshAjax(null,null,e.originalEvent.state.has_skin);
         }
          });
      }
    });
  },
  refreshAjax: function(has_playlist, has_dropdown_filter, has_skin){
    console.log('UIView.refreshAjax', has_playlist, has_dropdown_filter, has_skin, 'body_background:', $('.body_background'))
    $('html, body').animate({scrollTop:0}, 'fast');
    if ($('a.background')) {
       $('a.background').remove();
    }
    if ($('.body_background')) { 
      $('body').removeClass();
      body_background = $('.body_background').data('refresh-bodybackground');
      body_class = $('.body_background').data('refresh-bodyclass');
      $('body').css('background',body_background);
      $('body').addClass(body_class);
    }
    if (has_skin){
      $('body').addClass('skin');
       $(document).ajaxStop(function() {
        Skin.initHome();
      });
    }
    if ($('#top-header').css('display') == "none") {
      $('#top-header').css('display','block');
    }
   if (has_playlist == true) {
       $('body').addClass('playlist-in');
    }
     $('body').addClass('view-ajax');
    if(has_dropdown_filter == true) {
      $('.dropdown-filters2').addClass('hide');
    }
    Skhf.session.checkCredentials();
  },
  initDataLive: function(elmt) {
    var self = this;
    console.log('UiView.initDataLive', elmt);
    var elmt = typeof elmt != 'undefined' ? elmt : document;
    // -- modal
    this.initDataModalTriggers(elmt);
    // -- play deporte
    $(elmt).on('click', '[data-play],[data-play-api]', function(){
      var playapi = $(this).data('play-api');
      var id = playapi && typeof playapi.playId != 'undefined' ? playapi.playId :  $(this).data('play');
      console.log('script', 'data-play', id, $(this).data('play-args'), Player.state);
      if (Player.state == 'playing') {
        console.log('script', 'data-play', 'Pause current player');
        Player.pause();
      }

      //console.log('UiView.initDataLive', '[data-play] play-pass', $(this).data('play-pass'));
      API.play(id, $(this).data('play-args'), $(this).data('play-pass'));

      var trigger = $(this);
      window.onSkPlayerIframeApiReady = function(){
        var params = $.extend(playapi, {events: {
          'onStart': function(){
          },
          'onLoad': function(){
          },
          'onFinish': function(){
          }
        }});
        Skhf.Player = new Skhf.BasePlayer(trigger.attr('id'), params);
      }
      return false;
    });
    // -- player channel
    $(elmt).on('click', '[data-play-channel]', function(){
      console.log('script', 'data-play-channel', $(this).data('play-channel'), Player.state);
      var args = $.extend({type: 'channel', id: $(this).data('play-channel'), session_uid: Skhf.session.uid, hide_sliders: 1}, args);
      Couchmode.init(args);
      return false;
    });
    // -- player iframe
    $(elmt).on('click', '[data-play-iframe]', function(event, prevent){
      if ('matchMedia' in window) {
        if (window.matchMedia('(max-width:767px)').matches) {
          if ($(this).parents('body.view-tvgrid #channels > li') && typeof prevent == 'undefined') {
            // console.log('CATCH IT');
            return false;
          }
        }
      }
      console.log('script', 'data-play-iframe', $(this).data('play-iframe'), Player.state);
      
      var trigger = $(this);
      var url = isNaN(trigger.data('play-iframe')) ? trigger.data('play-iframe') : '//api.myskreen.com/skPlayerPlugin/iframe.php?is_iframe=1&play='+trigger.data('play-iframe');
      var params = {
        url: url + (url.indexOf('?') == -1 ? '?' : '&') + 'session_uid=' + Skhf.session.uid,
        env: API.config.env,
        reload: true,
        events: {
          'onStart': function(){
          },
          'onLoad': function(){
          },
          'onFinish': function(){
          }
        }
      }

      //player ?
      if (trigger.data('player-elmt')) {
        Player.stop();
        Player.elmt = $(trigger.data('player-elmt'));
        console.log('script', 'data-play-iframe', 'set player', Player.elmt);
      } else if (!Player.elmt) {
        console.log('script', 'data-play-iframe', 'set default player');
        Player.stop();
        Player.elmt = $('#player.default-player');
      } else {
        console.log('script', 'data-play-iframe', 'player exists', Player.elmt);
      }
      
      if (Player.elmt.hasClass('default-player')) {

        Player.elmt.html('<a class="btn btn-default close">Fermer</a>');

        console.log('script', 'data-play-iframe', 'launch default player');
        Player.elmt.addClass('in');
        $('body').append('<div class="modal-backdrop modal-player in"></div>');
  
        $('.close', Player.elmt).on('click', function(e) {
          e.preventDefault();
          $('iframe', Player.elmt).remove();
          Player.elmt.removeClass('in');
          $('.modal-backdrop.modal-player').remove();
        })
      }

      Skhf.Player = new Skhf.BasePlayer(Player.elmt.attr('id'), params);
      return false;
    });
    // -- couchmode
    $(elmt).on('click', '[data-couchmode]', function(){
      if (Player.state == 'playing') {
        console.log('script', 'data-couchmode', 'Pause current player');
        Player.pause();
      }
      var args = $.extend({session_uid: Skhf.session.uid}, $(this).data('couchmode'));
      console.log('script', 'data-couchmode', $(this).data('couchmode'), args);
      Couchmode.init(args);
      //hack close player
      if ($('#couchmode #couchmode-close').length == 0) {
        $('#couchmode').prepend('<div id="couchmode-close"><i class="glyphicon-remove glyphicon-white"></i> Fermer</div>');
      }
    });
    //autoplay
    $('[data-autoplay]').each(function(){
      if (!$('iframe', $(this)).length) {
        $(this).trigger('click');
      }
      Player.elmt=$(this);
    })
    //track event
    $(elmt).on('click', '[data-track-event]', function () {
      console.log('script', 'data-track-event', $(this).data('track-event'));
      vars = $(this).data('track-event').split(',')
      API.trackEvent(
        vars[0],
        typeof vars[1] != 'undefined' ? vars[1] : '',
        typeof vars[2] != 'undefined' ? vars[2] : ''
      );
    });
    
    // toggle text in element
    $(elmt).on('click', '[data-toggle-text]', function () {
      if (!$(this).hasClass('no-toggle-touch')) {
        var html = $(this).html();
        // console.log('script', '[data-toggle-text]', $(this).data('toggle-text'), html);
        $(this).html($(this).data('toggle-text'));
        $(this).data('toggle-text', html);
      }
    });
    // toggle display
    $(elmt).on('click', '[data-toggle-display]', function () {
      // console.log('script', '[data-toggle-display]', $(this).data('toggle-display'));
      if (!$(this).hasClass('no-toggle-touch')) {
        if($(this).data('toggle-animation') == 'slide'){
          $($(this).data('toggle-display')).slideToggle();
        } else {
          $($(this).data('toggle-display')).toggle();
        }
      } else {
        var location = $(this).data('relocation').replace('app_dev.php/','');
        window.location = API.config.v3_root + location;
        return;
      }
    });
    $(elmt).on('click', '[data-toggle-hide]', function () {
      // console.log('script', '[data-toggle-hide]', $(this).data('toggle-hide'));
      $($(this).data('toggle-hide')).toggleClass('hide');
    });

    // -- remote data in html elmt
    $(elmt).on('click', '[data-trigger-click]', function(){
      // console.log('script', '[data-trigger-click]', $(this).data('trigger-click'), $($(this).data('trigger-click')));
      if (window.matchMedia('(max-width:767px)').matches) {
        if ($(this).parents('body.view-tvgrid #channels > li .actions')) {
          $($(this).data('trigger-click')).trigger('click', ['prevent']);
          return false;
        }
      }
      $($(this).data('trigger-click')).trigger('click');
      return false;
    });

    // -- remote data in html elmt
    $(elmt).on('click', '[data-ajax]', function(e){
      if ( $('html').hasClass('lt-ie9')){
        window.location.href = trigger.data('ajax');
      } else {
        //
        var trigger = $(this); 
        var has_dropdown_filter = false;
        if ($('body').hasClass('playlist-in')){
          var has_playlist = true;
        }
        if ($('body').hasClass('skin')){
          has_skin = true;
        }
        if($('.dropdown-filters2').length > 0 && !$('.dropdown-filters2').hasClass('hide') ){
          var has_dropdown_filter = true;
        }
        //history
        console.log('script', '[data-ajax]', $(this).data('ajax'));
        console.log('History.pushStates');
        if (history.pushState) {
         if ( history.state == null ) {
           if( $('body').hasClass('view-tvgrid')) {
             var gridPath = $('#view-tvgrid time').attr('timestamp') + '/';
             history.pushState({path: window.location.href, document_title: document.title }, document.title, gridPath);
           } else{            
     
            history.pushState({path: window.location.href, document_title: document.title ,has_filter : has_dropdown_filter, has_skin: typeof has_skin !="undefined"? has_skin : ''}, document.title, window.location.href);  
           }
         }
         history.pushState({path: trigger.data('ajax')}, trigger.html(), trigger.data('ajax').replace(' ', ''));
        }
        $('.tooltip').remove();
        console.log('script', '[data-ajax]', $(this).data('ajax'), $('body').attr('class'));
        console.log('bodyRemoveClass');
        //add body class to overload view-homes
        $('body').removeClass('view-redirect')
               .addClass('view-ajax')
               .css('background','')
               .attr('class','');
        $('html, body').animate({scrollTop:0}, 'fast');

        //load ajax
        console.log('script', '[data-ajax]', $(this).data('ajax'), $('body').attr('class'));
        $($(this).attr('rel')).empty();
        UI.appendLoader($($(this).attr('rel')));
        if ($(this).data('ajax').indexOf('#') != -1) {
          var url = $(this).data('ajax');
        } else {
          var suffix = $(this).data('ajax').indexOf('?') == -1 ? '?skip_varnish' : '&skip_varnish';
          var url = $(this).data('ajax') + suffix;
        }
        $($(this).attr('rel')).load(url, function() {
          console.log('script', '[data-ajax]', 'callback', 'ajax-play', trigger.data('ajax-play'));
          seo.transform();
          //update data body
          UI.unloadRedirect();
          //trigger playlists
          UI.loadPlaylistTriggers('like', Skhf.session.datas.queue.split(','), elmt);
          if (trigger.data('ajax-play')) {
            if (Player.state == 'playing') {
              console.log('script', 'data-play', 'Pause current player');
              Player.pause();
            }
            API.play(trigger.data('ajax-play'), trigger.data('play-args'));
          }
          if (typeof ProgramView != 'undefined') {
            ProgramView.loadMoreStreaming();
          }
          $('#top-playlist').on('hide.bs.collapse', function () {
            console.log('script', '#top-playlist on hide');
            $('body').removeClass('playlist-in');
            if( $('body').hasClass('view-program_pere') || $('body').hasClass('view-ajax') ){
              $('body').addClass('playlist-w-in');
            }
          });

          self.refreshAjax(has_playlist, has_dropdown_filter);
        });
        //HACK notifications
        if ($(this).parents('li.open:first').length) {
          $(this).parents('li.open:first').removeClass('open');
        }

        document.title = 'programmes, TV, replay | mySkreen.com';
        return false;
      }
    });
    // -- redirect
    $(elmt).on('click', '[data-redirect]', function(){
      console.log('script', 'player redirect', $(this));
      if ($(this).data('redirect') == 'unload') {
        UI.unloadRedirect();
        $('#redirect').attr('style','');
      } else {
        UI.loadRedirect($(this).data('redirect'), $(this).data('seo-url'));
      }
      //hack notifications
      if ($(this).parents('li.open:first').length) {
        $(this).parents('li.open:first').removeClass('open');
      }
      return false;
    });
    // -- remove dom from elmt id
    $(elmt).on('click', '[data-remove]', function(){
      console.log('script', 'data-remove', $(this));
      $($(this).data('remove')).slideUp().remove();
      $(this).removeAttr('data-remove');
      return false;
    });

    // -- remote data in html elmt
    $(elmt).on('submit', 'form[data-form-ajax]', function(e){
      e.preventDefault();
      var form = $(this);
      console.log('script', 'data-form-ajax', $(this).attr('action'), $.extend($(this).serializeFullArray(), {dataType: 'text/html'}));
      UI.appendLoader($(form.data('form-ajax')).empty());
      $.post(
        $(this).attr('action'), 
        $.extend($(this).serializeFullArray(), {dataType: 'text/html'}), 
        function(html){
          console.log('script', 'callback data-form-ajax', form.data('form-ajax'))
          $(form.data('form-ajax')).html(html).fadeIn();
          UI.loadPlaylistTriggers(null, null, $(form.data('form-ajax')));
       });
    });
    // -- btn-radio
    $('[data-toggle="buttons-radio"] > *').on('click', function() { //TODO Le live ne marche pas, du coup HACK en mettant on
      $('> *', $(this).parent()).removeClass('active btn-info');
      $(this).addClass('active btn-info');
    });
  },
  initDataTriggers: function(elmt) {
    this.initDataPlayerTriggers(elmt);

    // -- ui form
    $('[data-form="catch"]', elmt).each(function(){
      var form = $(this);
      API.catchForm(form, function(json){
        //callback
        console.log('ui form catched', form);
        // Modification préférences utilisateur : TODO => place in scripts/settings.js
        if (form.attr('name') == 'user_settings_profile_form') {
          if ((typeof(json) != 'undefined') && (typeof(json.success) != 'undefined')) {
            //console.log("la value",$('input[name="update_mail"]').attr('value'));
            $('.username').html($('input[name="update_mail"]',form).attr('value'));
          }
        } else if (form.attr('name') == 'user_settings_password_form') {
        }
      });
    });

    // -- carousel autoload
    $('[data-carousel-autoload="1"]', elmt).each(function(){
      console.log('script', 'carousel-autoload', $(this));
      $(this).carousel({interval: false, pause: 'hover'});
      $(this).data('carousel-loaded', 1);
    });

    // -- sliders autoload
    $('.slider[data-autoload="1"]:not(.initialized)', elmt).each(function(){
      new BaseSlider({}, function(){}, $(this));
      //console.log('UI.init', 'autoload sliders', $(this));
    });

    // -- popover
    if ($('[data-content]', elmt).length > 0) {
      $('[data-content]').popover();
    }
  },
  initDataModalTriggers: function(elmt) {
    // trigger modal
    $(elmt).on('click', 'a[data-modal], a[data-modal-internal], [data-modal-remote]', function(e){
      console.log('script', 'a[data-modal], [data-modal-remote]', 'click');
      e.preventDefault();
      var trigger = $(this);
      if (trigger.data('modal') == 'remote' || trigger.data('modal-remote')) {
        if (trigger.data('modal-remote')) {
          var url = trigger.data('modal-remote').indexOf('http://') == -1 ? API.config.v3_root + trigger.data('modal-remote') : trigger.data('modal-remote');
        } else {
          var url = trigger.attr('href');
        }
        var args = {};
        if (!url.match(/^http(s|)\:\/\//)) {
          url  = API.config.v3_url + url;
          $.extend(args, {dataType: 'text html'});
        }
        UI.appendLoader($('.modal .modal-body').empty(), 1000);
        API.query('GET', url, args, function(data){
          //html
          if (typeof data == 'object' && typeof data.html != 'undefined') {
            $('.modal .modal-body').html(data.html);
          } else {
            $('.modal .modal-body').html(data);
          }
          //form
          API.catchForm($('.modal'));
          //title
          if (trigger.data('modal-title')) {
            $('.modal .modal-header .modal-title').html(trigger.data('modal-title'));
          }
          //message
          if (trigger.data('modal-message')) {
            console.log('scripts/core', '_ui.js', 'message modal');
            $('.modal .modal-message').html('<p>' + trigger.data('modal-message') + '</p>');
          }
          $('#skModal.modal').modal('show');
        })
      } else {
        API.quickLaunchModal(trigger.data('modal'));
        /*
        if (trigger.data('modal') == 'card') { //TODO : use UI.callbackModal
          $('.modal').on('hidden',function(e) {
           e.preventDefault();
            var url = document.location.toString();
            if (url.match('#')) {
              url = url.split("#")[0];
            }
             API.linkV2(url);
             return false;
          });
        }
        */
      }
      return false;
    });
  },
  initDataPlayerTriggers: function(elmt) {
    // -- couchmode autoplay
    $('a[data-couchmode-autoplay="1"]', elmt).each(function(){
      console.log('script', 'couchmode autoplay', $(this));
      $(this).trigger('click');
      return false;
    });
    // -- player autoload
    $('[data-player="init"]', elmt).each(function(){
      console.log('script', 'data-player="init"', $(this));
      Player.init($(this));
    });
    // -- player autoload
    $('[data-play-autoload]', elmt).each(function(){
      var trigger = $(this);
      console.log('script', 'play autoload', trigger.data('play-autoload'), trigger);
      Player.init(trigger, $(trigger.data('play-meta-elmt')));
      Player.playOccurrence(trigger.data('play-autoload'), function(){
        if (trigger.data('play-muted')) {
          Player.mute();
        }
      }, trigger.data('play-args'));

      $(this).data('play-loaded', 1);
    });
  }
}
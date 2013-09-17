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
  update: function(elmt) {
    console.log('UiView.update', elmt);
    this.initDataTriggers(elmt);
  },
  onLoad: function() {
    console.log('UiView.onLoad');
    //data triggers
    this.initDataLive();
    this.initDataTriggers(this.elmt);

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
          Player.stop();
        } else {
          Player.stop(); 
          // on est en iframe, le player ne peut plus etre en pause.
          // Player.pause();
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
   
    // -- carousel
    /*
    $('[data-carousel="autoload"]').each(function(){
      console.log('script', '[data-carousel="autoload"]', $(this));
      $(this).carousel();
    });
    */
    /*
      if ($(this).parent().parent().find('.badge')) {
        API.markAsRed($(this).parent().data('id'));
      }
    });
    */
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
      if (e.originalEvent.state) {
        $('#content').load(window.location.pathname + '?xhr=1', function() {
          console.log(e.originalEvent.state );
          if(e.originalEvent.state.document_title){
            document.title = e.originalEvent.state.document_title;
          }
           self.refreshAjax();
        });
      }
    });
  },
  refreshAjax: function(has_playlist){
    console.log('refreshAjax()')
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
    if($('.navbar').css('display') == "none"){
      $('.navbar').css('display','block');
    }
     if ( has_playlist == true ){
         $('body').addClass('playlist-in');
      }
       $('body').addClass('view-ajax');

  },
  initDataLive: function(elmt) {
    var self = this;
    console.log('UiView.initDataLive', elmt);
    var elmt = typeof elmt != 'undefined' ? elmt : document;
    // -- modal
    this.initDataModalTriggers(elmt);
    // -- play deporte
    $(elmt).on('click', '[data-play]', function(){
      console.log('script', 'data-play', $(this).data('play'), $(this).data('play-args'), Player.state);
      if (Player.state == 'playing') {
        console.log('script', 'data-play', 'Pause current player');
        Player.pause();
      }
      //console.log('UiView.initDataLive', '[data-play] play-pass', $(this).data('play-pass'));
      API.play($(this).data('play'), $(this).data('play-args'), $(this).data('play-pass'));
      if ($(this).data('playlist')) {
        console.log('script', 'data-play', 'playlist');
        //handle end payer
        if ($(this).data('duration')) {
          $('.playing', $(this).data('playlist')).removeClass('playing');
          $(this).parent().addClass('playing');
          if ($next = $(this).parent().next()) {
            console.log('script', 'data-play', 'playlist', 'next', $next);
            if ($play = $next.find('[data-play]')) {
              console.log('script', 'data-play', 'playlist', 'setTimeout', $(this).data('duration'), $play);
              setTimeout(function(){
                $play.trigger('click');
              }, parseInt($(this).data('duration'))*1000)
            }
          }
        }
      }
      return false;
    });
    $('[data-autoplay]').each(function(){
      $(this).trigger('click');
    })
    // -- player iframe
    $(elmt).on('click', '[data-play-iframe]', function(){
      console.log('script', 'data-play-iframe', $(this).data('play-iframe'), Player.state);
      iframe = $('iframe', Player.elmt);
      if (iframe.length) {
        iframe.attr('src', $(this).data('play-iframe'));
      }
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
    // toggle text in element
    $(document).on('click', '[data-toggle-text]', function () {
      var html = $(this).html();
      console.log('script', '[data-toggle-text]', $(this).data('toggle-text'), html);
      $(this).html($(this).data('toggle-text'));
      $(this).data('toggle-text', html);
    });
    // -- remote data in html elmt
    $(elmt).on('click', '[data-ajax]', function(e){
      var trigger = $(this); 
      if ( $('html').hasClass('lt-ie9')){
        window.location.href = trigger.data('ajax');
      } else {
        //history
        console.log('script', '[data-ajax]', $(this).data('ajax'));
        console.log('History.pushStates');
        if (history.pushState) {
        if ( history.state == null ) {
          if( $('body').hasClass('view-tvgrid')) {
            var gridPath = $('#grid time').attr('timestamp') + '/';
            history.pushState({path: window.location.href, document_title: document.title }, document.title, gridPath);
          } else{
           history.pushState({path: window.location.href, document_title: document.title }, document.title, window.location.href);
          }
        }
        history.pushState({path: trigger.data('ajax')}, trigger.html(), trigger.data('ajax'));
      }
      $('.tooltip').remove();
       console.log('script', '[data-ajax]', $(this).data('ajax'), $('body').attr('class'));
      if ($('body').hasClass('playlist-in')){
      var has_playlist = true;
      }
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
        var url = $(this).data('ajax').replace('#', '?skip_varnish#');
      } else {
        var suffix = $(this).data('ajax').indexOf('?') == -1 ? '?skip_varnish' : '&skip_varnish';
        var url = $(this).data('ajax') + suffix;
      }
      console.log('before Load');
      $($(this).attr('rel')).load(url, function() {
        console.log('script', '[data-ajax]', 'callback', 'ajax-play', trigger.data('ajax-play'));
        //update data body
        UI.unloadRedirect();
        //trigger playlists
        UI.loadPlaylistTriggers('like', Skhf.session.datas.queue.split(','), elmt);
        //ajax play ?
        if (trigger.data('offers')) {
          $('.trigger-'+ trigger.data('offers')).trigger('click');
        }
        if (trigger.data('ajax-play')) {
          if (Player.state == 'playing') {
            console.log('script', 'data-play', 'Pause current player');
            Player.pause();
          }
          API.play(trigger.data('ajax-play'), trigger.data('play-args'));
        }
        console.log('callback');
        ProgramView.loadMoreStreaming();
        PlayerScroll.initPlayerScroll();
        $('#top-playlist').on('hide.bs.collapse', function () {
          console.log('script', '#top-playlist on hide');
          $('body').removeClass('playlist-in');
          if( $('body').hasClass('view-program_pere') || $('body').hasClass('view-ajax') ){
            $('body').addClass('playlist-w-in');
          }
        });
      });
      //HACK notifications
      if ($(this).parents('li.open:first').length) {
        $(this).parents('li.open:first').removeClass('open');
      }
      console.log('after load');
      self.refreshAjax(has_playlist);
            console.log('after refresh Ajax');

      document.title = 'programmes, TV, replay | mySkreen.com';
      return false;
      }
    });
    // -- redirect
    $(elmt).on('click', '[data-redirect]', function(){
      console.log('script', 'player redirect', $(this));
      if ($(this).data('redirect') == 'unload') {
        UI.unloadRedirect();
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
          $(form.data('form-ajax')).html(html);
          UI.loadPlaylistTriggers(null, null, form.data('form-ajax'), $(form.data('form-ajax')));
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
        // Modification préférences utilisateur
        if (form.attr('name') == 'user_settings_profile_form') {
          if ((typeof(json) != 'undefined') && (typeof(json.success) != 'undefined')) {
    //          console.log("la value",$('input[name="update_mail"]').attr('value'));
            $('.username').html($('input[name="update_mail"]',form).attr('value'));
          }
        } else if (form.attr('name') == 'user_settings_password_form') {
        }
      });
    });

    // -- carousel autoload
    $('[data-carousel-autoload="1"]', elmt).each(function(){
      console.log('script', 'carousel-autoload', $(this));
      $(this).carousel({interval: 7000, pause: 'hover'});
      $(this).data('carousel-loaded', 1);
    });

    // -- sliders autoload
    $('.slider[data-autoload="1"]', elmt).each(function(){
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
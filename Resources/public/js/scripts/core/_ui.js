$(document).ready(function(){
  console.log('scripts', 'load scripts/ui.js');
  UiView.init();
});

var UiView;
UiView = {
  elmt: null,
  init: function(elmt) {
    console.log('UiView.init', elmt);
    this.elmt = typeof elmt != 'undefined' && elmt ? elmt : $('body');

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

    // -- modal
    var triggerModal = getUrlParameter('modal');
    if (triggerModal) {
      API.quickLaunchModal(triggerModal);
    }
    // ui modal
    if ($('.modal').length > 0) {
      $('.modal').on('show', function(){
        $('.popover').remove();
        Player.pause();
        carousels = $('.carousel');
        if (carousels.length > 0) {
          carousels.each(function(){
            $(this).carousel('pause');
          });  
        }
      });
      $('.modal').on('hidden', function(){
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

    // -- ui actions : play
    $(document).on('click', '.slider li:not(.selector)', function(e){
      console.log('script', '.slider li:not(.selector)', $('a.title', this));
      if (typeof $('a.title', this).attr('href') == 'undefined') {
        $('a.title', this).trigger('click');
      } else {
        document.location = $('a.title', this).attr('href');
      }
      return false;
    });
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
    });
    //remove popover
    $(document).on('click', '.popover .close', function() {
      //console.log('script', 'popovers destroy', $('.popover'));
      $('.popover').remove();
      return false;
    })

    // -- tooltip
    if ($('[rel="tooltip"]').length > 0) {
      $('[rel="tooltip"]').tooltip();
    }
  },
  initDataLive: function(elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : document;
    // -- play deporte
    $(elmt).on('click', '[data-play]', function(){
      console.log('script', 'data-play', $(this).data('play'), $(this).data('play-args'), Player.state);
      if (Player.state == 'playing') {
        console.log('script', 'data-play', 'Pause current player');
        Player.pause();
      }
      API.play($(this).data('play'), $(this).data('play-args'));
      return false;
    });
    // -- couchmode
    $(elmt).on('click', '[data-couchmode]', function(){
      if (Player.state == 'playing') {
        console.log('script', 'data-play', 'Pause current player');
        Player.pause();
      }
      var args = $.extend({session_uid: Skhf.session.uid}, $(this).data('couchmode'));
      console.log('script', 'data-couchmode', $(this).data('couchmode'), args);
      Couchmode.init(args);

      //hack close player
      if ($('#couchmode #couchmode-close').length == 0) {
        $('#couchmode').prepend('<div id="couchmode-close"><i class="icon-remove icon-white"></i> Fermer</div>');
      }
    });
    // -- remote data in html elmt
    $(elmt).on('click', '[data-ajax]', function(e){
      //e.preventDefault();
      console.log('script', '[data-ajax]', $(this).data('ajax'));
      //remove home body class
      $('body').removeClass('view-homes');
      $($(this).attr('rel')).empty();
      UI.appendLoader($($(this).attr('rel')));
      if ($(this).data('ajax').indexOf('#') != -1) {
        var url = $(this).data('ajax').replace('#', '?skip_varnish#');
      } else {
        var suffix = $(this).data('ajax').indexOf('?') == -1 ? '?skip_varnish' : '&skip_varnish';
        var url = $(this).data('ajax') + suffix;
      }
      $($(this).attr('rel')).load(url, function() {
        UI.unloadRedirect();
      });
      return false;
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
    // -- btn-radio
    $(elmt).on('click', '[data-toggle="buttons-radio"] > *', function(){
      $('> *', $(this).parent()).removeClass('active btn-info');
      $(this).addClass('active btn-info');
    });
  },
  initDataTriggers: function(elmt) {
    this.initDataPlayerTriggers(elmt);
    this.initDataModalTriggers(elmt);

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
    $('a[data-modal], [data-modal-remote]', elmt).on('click', function(e){
      console.log('script', 'a[data-modal], [data-modal-remote]', 'click');
      e.preventDefault();
      var trigger = $(this);
      if (trigger.data('modal') == 'remote' || trigger.data('modal-remote')) {
        var url = trigger.data('modal-remote') ? trigger.data('modal-remote') : trigger.attr('href');
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
            $('.modal .modal-header h3').html(trigger.data('modal-title'));
          }
          //message
          if (trigger.data('modal-message')) {
            $('.modal .modal-body').prepend('<p class="alert alert-success">' + trigger.data('modal-message') + '</p>');
          }
          $('.modal').modal('show');
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
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
    this.initHistory();
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
    
    // TEST !
    if (window.location.href == "http://v3.dev3.myskreen.typhon.net/app_dev.php/pluzz-vad/?preview=1"){
          $('body').css("background-image", "url('http://mskstatic.com/medias/photos/channel/19-pluzz-vad.jpg')");
           $('body').css("background-position", "top center");
           $('body').css("background-repeat", "no-repeat");
           $('#cover').css("margin-bottom","10px");
           $('#cover .header-container').prepend('<div class="container"><div class="well"><div class="well-inner"></div><div class="actions slider"><a class="fav fav-like btn btn-large btn-primary" data-placement="left" data-original-title><i class="icon-plus-sign icon-white"></i> Suivre</a></div></div></div>');
           $('#cover .header-container .container .well').css("background-image", "url('http://s1.mskstatic.com/245/330/medias/photos/programmes/moins_de3540000/3517970/plus-belle-la-vie.jpg?201307151412')");
           $('#cover .header-container .container .well').css("background-repeat", "no-repeat");
           $('#cover .header-container .container .well').css("background-position", "10px 10px");
           $('#cover .header-container .container .well').css("background-color", "transparent");
           $('#cover .header-container .container .well').css("margin","60px 0px");
           $('#cover .header-container .container .well').css("background-size","150px 200px");
           $('#cover .header-container .container .well .well-inner').prepend('<iframe frameborder="0" width="420" height="270" src="http://www.dailymotion.com/embed/video/x102q8s/?autoPlay=1&logo=0&related=0"></iframe>')
           $('div.well').css('background-color','none');
           $('#channel-programs').after('<p>Retrouvez sur <strong>Pluzz VAD</strong>,  toutes les vidéos en <strong>streaming</strong> et en <strong>replay</strong> de <strong>France Télévisions</strong> !</p><p>Découvrez l\'ensemble des vidéos à la demande sur <strong>Pluzz VAD</strong> : séries, cinémas, documentaires, spectacles.</p><p><strong>Pluzz VAD</strong> propose <strong>des films complets disponibles en streaming</strong>. On peut retrouver dans le catalogue :</p><p><a href="http://www.myskreen.com/film/comedies/4565741-2-days-in-new-york/">2 days in New York</a>, <a href="http://www.myskreen.com/film/drames/4726222-populaire/">Populaire</a>, <a href="http://www.myskreen.com/film/policier-thriller/4745222-le-capital/">Le capital</a>, <a href="http://www.myskreen.com/film/biographie-biopic/4653555-renoir/">Renoir</a>,  <a href="http://www.myskreen.com/film/action-aventure/4653561-summertime/">Summer time</a>  et beaucoup d’autres encore...</p></br><p>Voir toutes <strong>les séries disponibles en streaming</strong> sur <strong>Pluzz VAD</strong>:</p><p><a href="http://www.myskreen.com/serie/drames/3517970-plus-belle-la-vie/">Plus belle la vie</a>, le gros succès de <strong>France 3</strong>, <a href="http://www.myskreen.com/serie/policier-thriller/5054354-detectives/">Détectives</a> et <a href="http://www.myskreen.com/serie/policier-thriller/4956881-candice-renoir/">Candice Renoir</a> de <strong>France 2</strong>....</p></br><p>Retrouvez <strong>tous les spectacles en replay et streaming</strong>  comme les spectacles de <a href="http://www.myskreen.com/spectacle/humour/3925489-pierre-palmade-j-ai-jamais-ete-aussi-vieux/">Pierre Palmade: J\'ai jamais été aussi vieux</a>, <a href="http://www.myskreen.com/spectacle/humour/3893907-marc-jolivet-ecoutez-voir/">Marc Jolivet</a>...</p><p><strong>Pluzz VAD</strong> propose aussi un catalogue dédié aux plus petits, avec son offre de <strong>films et dessins animés en streaming</strong>. On retrouve <a href="http://www.myskreen.com/film/jeunesse/4320062-tobby-la-star-des-toutous/">Tobby, la star des Toutous</a>, <a href="http://www.myskreen.com/film/jeunesse/3615260-jack-et-le-haricot-magique/">Jack et le haricot magique</a>...</p><p><strong>mySkreen</strong> vous permet de retrouver l’ensemble de l’offre en streaming de <strong>Pluzz VAD réunit sur une seule chaîne dédiée</strong>.</p><p>Vous pouvez aussi regarder en <strong>replay</strong> et <strong>gratuitement</strong> tous les programmes de <strong>France Télévisons</strong> sur <a href="http://www.myskreen.com/france-2/">France 2</a>, <a href="http://www.myskreen.com/france-3/">France 3</a>, <a href="http://www.myskreen.com/france-4/">France 4</a>, <a href="http://www.myskreen.com/france-5/">France 5<a> et <a href="http://www.myskreen.com/france-ô/">France Ô<a>.</p></br>');
        }
    // ui modal
    if ($('.modal').length > 0) {
      $('.modal').on('show', function(){
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
      return false;
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
    
    // -- focus search
    if (!navigator.userAgent.match(/iPhone|iPod/)) {
      console.log('script', 'focus', $('.navbar-search .search-query'));
      $('.navbar-search .search-query').focus();
    }
  },
  initHistory: function(){

    $(window).bind('popstate', function(e) {
      console.log('UiView.initHistory', 'popstate', e.originalEvent.state);
      if (e.originalEvent.state) {
        $('#content').load(window.location.pathname + '?xhr=1', function() {
          if (e.originalEvent.state.cover) {
            $('body').removeClass('no-cover').addClass('cover');
          } else {
            $('body').removeClass('cover').addClass('no-cover');
          }
        });
      }
    });
  },
  initDataLive: function(elmt) {
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
      API.play($(this).data('play'), $(this).data('play-args'));
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
        $('#couchmode').prepend('<div id="couchmode-close"><i class="icon-remove icon-white"></i> Fermer</div>');
      }
    });
    // -- remote data in html elmt
    $(elmt).on('click', '[data-ajax]', function(e){

      
      var trigger = $(this);
      //e.preventDefault();
      console.log('script', '[data-ajax]', $(this).data('ajax'));
      
      if ( history.state == null ) {
        history.pushState({path: window.location.href , cover: $('body').hasClass('cover')}, document.title, window.location.href);
      }
      history.pushState({path: $(this).data('ajax') , cover: $('body').hasClass('cover')}, $(this).html(), $(this).data('ajax'));
    

      
      
      var trigger = $(this);

      //add body class to overload view-homes
      $('body').removeClass('view-redirect');
      $('body').addClass('view-ajax');
      if ($(this).data('ajax').indexOf('view-cover') > 0) {
        $('body').removeClass('no-cover').addClass('cover');
      } else {
        $('body').removeClass('cover').addClass('no-cover');
      }
      console.log('script', '[data-ajax]', $(this).data('ajax'), $('body').attr('class'));
      //load ajax
      $($(this).attr('rel')).empty();
      UI.appendLoader($($(this).attr('rel')));
      if ($(this).data('ajax').indexOf('#') != -1) {
        var url = $(this).data('ajax').replace('#', '?skip_varnish#');
      } else {
        var suffix = $(this).data('ajax').indexOf('?') == -1 ? '?skip_varnish' : '&skip_varnish';
        var url = $(this).data('ajax') + suffix;
      }
      $($(this).attr('rel')).load(url, function() {
        console.log('script', '[data-ajax]', 'clalback', 'ajax-play', trigger.data('ajax-play'));
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
      });
      //HACK notifications
      if ($(this).parents('li.open:first').length) {
        $(this).parents('li.open:first').removeClass('open');
      }

      document.title = 'programmes, TV, replay | mySkreen.com';
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
    // -- remove dom from elmt id
    $(elmt).on('click', '[data-remove]', function(){
      console.log('script', 'data-remove', $(this));
      $($(this).data('remove')).slideUp().remove();
      return false;
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
        var url = trigger.data('modal-remote') ? API.config.v3_root + trigger.data('modal-remote') : trigger.attr('href');
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
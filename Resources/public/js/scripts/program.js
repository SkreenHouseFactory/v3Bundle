// -- program

//surcharge session sync args to get sVOD :
Session_sync_args =  { 'with_svod': 1 };

$(document).ready(function(){
  if ($('#view-program').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    //Skhf.session.callbackInit = null;
    Skhf.session.callbackSignout = function() {
      ProgramView.unloadProgramUsersDatas($('#view-program').data('id'));
    }
    Skhf.session.callbackSignin = function() {
      if (Skhf.session.datas.email) {
        ProgramView.loadProgramUsersDatas($('#view-program').data('id'));
      }
      //theater playlist et fallback géoloc
      if (Skhf.session.datas.email &&
          $('#program-offers #trigger-theaters-playlist').length && 
          !document.location.href.match(/theater_id=/)){ //desactivé si id cinéma dans url
        $('#program-offers #trigger-theaters-playlist').trigger('click');
      } else if ($('#program-offers #trigger-theaters-geoloc').length) {
        $('#program-offers #trigger-theaters-geoloc').trigger('click');
      }
      //affichage bulle pendant 4s sur fiche programme
      /*
      if (!Skhf.session.datas.email && 
          $('#program-follow .fav').length > 0) {
        setTimeout(function(){
          if (!$('#skModal').hasClass('in')) {
            $('#program-follow .fav').each(function(){
              var trigger = $(this);
              UI.installPopover(trigger);
              trigger.popover('show');

              setTimeout(function(){
                trigger.popover('hide');
              }, 6000);
            });
          }
        }, 2000);
      }
      */
    }
    // -- add preference callback : incitation à suivre des related
    if (!navigator.userAgent.match(/iPhone|iPod/)) { //not optimized for iPhone
      UI.callbackTogglePlaylist = function(parameter, value, remove, trigger, return_data) {
        console.log('UI.callbackTogglePlaylist', 'return_data', return_data);
        if (typeof return_data != 'undefined') {
          // -- réinitialisation callback pour rester sur la popin
          UI.callbackTogglePlaylist = function(parameter, value, remove, trigger) {
            if ($('.modal .slider li').length) {
              trigger.parents('.actions:first').remove();
            } else {
              $('.modal').modal('hide');
            }
          }
          //related channels
          if (return_data.channels) {
            $('.modal .modal-header h3').html('Voulez-vous suivre aussi ces chaînes ?');
            $('.modal .modal-body').html('<p class="alert alert-info">Cliquez sur les chaînes qui vous intéressent pour ne rater aucune diffusion (TV, Replay, VOD, Cinéma).</p><div class="slider slider-list"><ul class="items"></ul></div>');
            new BaseSlider({
              scroll: 'no',
              programs: return_data.channels
            }, function(){
              var trigger = $(this);
              $('.modal .slider li a[href]').addClass('fav fav-channel')
                                            .attr('href', '#')
                                            .data('ajax', '');
              $('.modal .slider li').append('<span class="hide add-playlist btn btn-primary"><i class="icon-plus-sign icon-white"></i> Suivre</span>')
                                    .on('click', function(){
                UI.togglePlaylist($(this).find('a.title'), false);
              });
            }, $('.modal .slider'));

            $('.modal').modal();
          //related same_playlist
          } else if (return_data.programs) {
            //TODO : insert programs in modal
            $('.modal .modal-header h3').html('Programmes fréquemments suivis ensembles');
            $('.modal .modal-body').html('<p class="alert alert-info">Suivez tous les programmes que vous aimez pour ne rater aucune diffusion (TV, Replay, VOD, Cinéma).</p><div class="slider slider-list"><ul class="items"></ul></div>');
            new BaseSlider({
              scroll: 'no',
              programs: return_data.programs
            }, function(){
              var trigger = $(this);
              $('.modal .slider li a[href]').addClass('fav fav-like')
                                            .attr('href', '#')
                                            .data('ajax', '');
              $('.modal .slider li').append('<span class="hide add-playlist btn btn-primary"><i class="icon-plus-sign icon-white"></i> Suivre</span>')
                                    .on('click', function(){
                UI.togglePlaylist($(this).find('a.title'), false);
              });
            }, $('.modal .slider'));

            $('.modal').modal();
          }
        }
      }
    }

    //////////// SCRIPTS ////////////////

    //no deportes
    var offers = getUrlParameter('offers');
    if (offers) {
      console.log('offers',  offers);
      $('#trigger-' + offers).trigger('click');
    } else if (!$('#trigger-plays').length ) {
      $('#triggers li:first-child a').trigger('click');
    }

    //autoload from url
    if (document.location.href.match(/\?rent/gi)) {
      $('#plays [data-play]:first').trigger('click');
    } else if (document.location.href.match(/\?follow/gi)) {
      if (!$('.actions .fav').hasClass('fav-on')) {
        $('.actions .fav').trigger('click');
      }
    } else if (document.location.href.match(/\?play/gi)) {
      console.log('?play', getUrlParameter('play'));
      $('[data-play="'+getUrlParameter('play')+'"]').trigger('click');
    }

    //handle video mention
    $('[data-play]').on('click', function(e){
      if ($(this).parents('[data-play-text]:first').length) {
        $('#program-teaser-header').html($(this).parents('[data-play-text]:first').data('play-text'));
      }
    });

    //ics
    $('[data-ics-occurrence]').on('click', function(e){
      e.preventDefault();
      document.location = API.config.base + '1/icsfile/' + $(this).data('id')  + '.ics';
      return false;
    });

    //episodes
    $('#program-episodes ul li a[data-season]').on('click', function(){
      $('#program-episodes ul li').removeClass('active');
      $(this).parent().addClass('active');
      $('ul#episodes-list li:not(.hide)').addClass('hide');
      $('ul#episodes-list li.season-' + $(this).data('season')).removeClass('hide');
    })
    /*
    $('#program-offers [data-content]').on('hover', function(event) {
      var trigger = $(this);
      var timeout = null;
      if (event.type == 'mouseover' || event.type == 'mouseenter') {
        console.log(trigger);
        if (!trigger.data('loaded')) {
          API.query(
            'GET',
            'program/' + $(this).data('episode-id') + '.json',
            {
              with_description: 1,
              img_width: 200,
              episode_only: 1
            },
            function(json) {
              $('.popover:visible').hide();
              trigger.attr('data-loaded', 1);
              if (json.description != null) {
                var picture = json.picture != null ? '<hr/><p align="center"><img src="' + json.picture + '" alt="' + json.title + '" />' : '';
                var content = '<strong>' + 
                              (json.season_number ? ' Saison ' + json.season_number : '') + 
                              (json.episode_number ? ' Episode ' + json.episode_number : '') + 
                              (json.season_number || json.episode_number  ? ' - ' : '') + 
                              (json.year != null ? json.year : '') +
                              '</strong><br/><small>' + json.description + '</small>' + picture + '</p>';
                trigger.attr('data-content', content);
                trigger.popover();
                trigger.popover('show');
              } else {
                trigger.removeAttr('data-content');
              }
            });
        } else if (trigger.attr('data-content') != 'undefined' && 
                   trigger.attr('data-content')) {
          $('.popover').hide();
          trigger.popover('show');
        }
      } else {
        trigger.popover('hide');
      }
    });
    */


    //init
    if (!$('#view-program').hasClass('isInitialized')) {
     ProgramView.init();
    }

    // tracking
    $('[data-track-channel]').each(function() {
      //track channel
      //API.trackVar(1, 'Chaîne', $(this).data('track-channel'), 3);
      API.trackEvent('Chaîne', $(this).data('track-channel'), 'page=programme');
    });
    
    // ui text show more
    $('.show-more').on('click', function () {
      var $this = $(this);
      $('.text', $(this).parent()).toggleClass('show-more-height');
    });

    // Déplier la liste des acteurs
    $('.actors_reveal').on('click', function () {
      $('.actors_entrop').toggleClass('hide');
    });  
  }
});

// -- ProgramView
var ProgramView;
ProgramView = {
  init: function() {
     
    //hack player pas initialisé
    if ($('#program-teaser-player iframe').length && 
        !Player.elmt) {
      Player.elmt = $('#program-teaser-player');
    }

    this.loadMoreStreaming();
    $('#view-program').addClass('isInitialized');
      
  },
  unloadProgramUsersDatas: function(id) {
    
  },
  //load user program's infos
  loadProgramUsersDatas: function(id) {

    // friends
    if ( Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
      var container_friends = $('#program-friends .share-on');
      UI.appendLoader(container_friends);
      Skhf.session.getSocialDatas(function(friends, friends_programs) {
        console.log('UI.loadProgramUsersDatas', 'callback session.getSocialDatas', id, friends_programs[id]);
        container_friends.removeClass('hide'); //HACK : TODO appel après connexion
        UI.removeLoader(container_friends);
        if (typeof friends_programs[id] != 'undefined') {
          UI.addFriends(container_friends, friends_programs[id])
        } else {
          container_friends.append('<p class="alert">Aucun ami trouvé !</p><a href="#same_playlists" class="btn btn-block">Ils ajoutent aussi à leurs playlists &raquo;</a>');
        }
      });
    }

    //SVOD
    console.log('UI.loadProgramUsersDatas', 'svods', Skhf.session.datas.svods);
    if (Skhf.session.datas.svods != 'undefined') {
      for (k in Skhf.session.datas.svods) {
        var subscription_id = Skhf.session.datas.svods[k].pass.subscription_id;
        console.log('UI.loadProgramUsersDatas', 'svods found', '[data-play-pass="' + subscription_id + '"]' );
        if ($('[data-play-pass="' + subscription_id + '"]').length) {
          $('[data-play-pass="' + subscription_id + '"] td .btn')
            .addClass('btn-success')
            .html('<i class="glyphicon glyphicon-play"></i> Abonné');
        }
      }
    }

    // VOD & notifications
    API.query(
      'GET', 
      'program/' + id + '.json', 
      {
        no_metadata: 0,
        with_notifications: 1,
        session_uid: Skhf.session.uid
      }, 
      function(datas){
        console.log('UI.loadProgramUsersDatas', 'callback', datas);
        //bought ?
        if (typeof datas.purchased != 'undefined' &&
            datas.purchased) {
          console.log('UI.loadProgramUsersDatas', 'datas.purchased ', datas.purchased);
          for (k in datas.purchased) {
            if( API.formatTimestamp(datas.purchased[k]) != 'undefined' ){
              console.log('UI.loadProgramUsersDatas', 'purchased', '#program-offers [data-id="' + k + '"] td .btn', $('#program-offers [data-id="' + k + '"] td .btn'), k, API.formatTimestamp(datas.purchased[k]));
              $('#program-offers [data-id="' + k + '"]').each(function(){
                if (typeof $(this).data('play-pass') == 'undefined') {
                  $('td .btn', this)
                    .addClass('btn-success')
                    .html('<i class="glyphicon glyphicon-play"></i> Voir');
                }
              })
            }
          }
        }
        //notifs
        if (typeof datas.boutons_notifications != 'undefined' && 
            datas.boutons_notifications &&
            datas.boutons_notifications['new'].count > 0) {
          for (k in datas.boutons_notifications['new']) {
            var notifs = datas.boutons_notifications['new'][k];
            if (notifs.length > 0 && k != 'count' ) {
              $('#trigger-' + k).append('<span class="badge badge-important">' + notifs.length + '</span>');                  
              for(k in notifs){
                $('#program-offers #' + k + ' .table-container').addClass('has-notification');
                $('#program-offers [data-id="' + notifs[k] + '"] td:first-child').html('<span class="badge badge-important">1</span>');
              };
            }
          };
        }
    });
  },
  loadMoreStreaming: function() {
    //youtube
    var container = $('[data-more-streaming]');
    if (container.length &&
        container.data('more-streaming')) {
      if ($('.carousel.carousel-youtube .item').length) {
        console.log('data-more-streaming', 'already loaded');
        return;
      }

      console.log('data-more-streaming', container);
      var url = 'program/more-streaming/' + container.data('more-streaming') + '.json?nb_results=24';
      UI.appendLoader(container);
      API.query(
        'GET',
        url,
        {nb_results: 24},
        function(programs) {
          UI.removeLoader(container);
          if (programs.length == 0 || typeof programs.length == 'undefined') {
            console.warn('data-more-streaming', 'no programs found');
            container.remove();
            return;
          }
          //TODO : sort by duration ?
          console.log('more-streaming', ' callback', programs.length);
          var carousel = $('.carousel-inner .item:first-child', container);
          var c_index = 0;
          var nb_page = 6;
          for (var i = 0; i < programs.length; i++) {
            //console.log('youtube callback', 'c_index:' + c_index, 'modulo:' + i%8, programs[i]);
            if (i%nb_page == 0) {
              c_index++;
              var item = $('<div class="item' + (i ==0 ? ' active' : '') + '"></div>')
              carousel = $('.carousel-inner', container).append(item);
            }
            item.append(
              '<a data-play-iframe="http://www.youtube.com/embed/' + encodeURIComponent(programs[i].id) + '?autoplay=1" class="pull-left">' +
              '<span>' + programs[i].duration + ' min.</span>' +
              '<img class="img-polaroid" alt="' + programs[i].title + '" src="' + programs[i].picture + '" />' +
              '<div class="title">' + programs[i].title + '</div>' +
              '</a>'
            );
          }
          if (programs.length > nb_page) {
            console.log('scripts/program.js', 'carousel youtube init', $('#carousel-youtube .carousel'));
            $('#carousel-youtube .carousel').removeClass('hide')
                                            .carousel({interval: 7000, pause: 'hover'})
                                            .carousel('cycle'); //{interval: 7000, pause: 'hover'}
            $('#carousel-youtube').append('<p class="alert alert-info">Ces extraits sont récupérés automatiquement sur Youtube notamment. Il se peut qu\'ils ne correspondent pas tout à fait au programme recherché et les sites référencés sont seuls responsables du contenu qu\'ils proposent.</p>');

          }  
        });
    };
  }
}
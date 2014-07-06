//console.log('scripts/program.js', 'chargement', Skhf.session);

// -- program
// -- ProgramView
var ProgramView;
ProgramView = {
  init: function() {
    this.loadMoreStreaming();
    $('#view-program').addClass('isInitialized');
  },
  unloadProgramUsersDatas: function(id) {
    
  },
  //load user program's infos
  loadProgramUsersDatas: function(id) {

    // friends
    if ( Skhf.session.datas.fb_uid && Skhf.session.datas.fb_access_token) {
      var container_friends = $('#program-friends .share-friends');
      UI.appendLoader(container_friends);
      Skhf.session.getSocialDatas(function(friends, friends_programs) {
        console.log('UI.loadProgramUsersDatas', 'callback session.getSocialDatas', id, friends_programs[id]);
        container_friends.removeClass('hide'); //HACK : TODO appel après connexion
        UI.removeLoader(container_friends);
        if (typeof friends_programs[id] != 'undefined') {
          $(container_friends).html('<div class="friends-title">Ils l\'ont ajouté à leurs listes</div>')
          UI.addFriends(container_friends, friends_programs[id])
        } else {
          container_friends.addClass('hide');
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
              console.log('UI.loadProgramUsersDatas', 'purchased', '.tab-content [data-id="' + k + '"] td .btn', $('.tab-content [data-id="' + k + '"] td .btn'), k, API.formatTimestamp(datas.purchased[k]));
              $('.tab-content [data-id="' + k + '"], .best-offer[data-id="' + k + '"]').each(function(){
                if (typeof $(this).data('play-pass') == 'undefined') {
                  $('td .btn', this)
                    .addClass('btn-success')
                    .removeClass('btn-voir')
                    .html('<i class="glyphicon glyphicon-play"></i> Voir (loué)');
                  $('.col-xs-3 .btn', this)
                    .addClass('btn-success')
                    .removeClass('btn-voir')
                    .html('<i class="glyphicon glyphicon-play"></i> Voir (loué)');
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
              $('#program-offers .panel-' + k).append('<span class="badge label-danger">' + notifs.length + ' nouveaux</span>');           
              for (k in notifs){
                $('#program-offers [data-id="' + notifs[k] + '"] td:first-child').append('<span class="badge label-danger">Nouveau</span>');
              };
            }
          };
        }
    });
  },
  loadModal: function() {
    //modal
      var program_id = $('.fav-like[data-id]').data('id');
      var cookie = API.cookie('visited_programs') ? API.cookie('visited_programs').split(',') : [];
      console.log('scripts/program.js', 'visited_programs', program_id, cookie)
      if (!cookie || $.inArray('' + program_id, cookie) == -1 || document.location.href.match(/\?follow/gi)) {
         if( $('.help-sprite-ms_btn_close').length ){
          $('.help-sprite-ms_btn_close').trigger('click');
         }

        if ($('#program-modal').length){
          //si modal
          if (Skhf.session.datas.email) {
            $('#program-modal').addClass('connected');
          }
          if (!Skhf.session.datas.email ||
              !Skhf.session.isInPlaylist('like', $('.btn-suivre[data-id]').data('id'))) {
            $('#program-modal').modal('show');
          }
          API.cookie('visited_programs', (cookie.length ? cookie.join(',') + ',' : null) + program_id);
          
          $('#triggerfav').on('click', function() {
            $('.btn-suivre[data-id].fav-like').trigger('click');
            $('#program-modal').modal('hide');
          })
          $('#fbconnect').on('click', function() {
            Skhf.session.callbackSignin = function(sessionData) {
              //add channel to playlist
              if (sessionData.email) {
                var id = $('[data-id]').data('id');
                console.log('scripts/program.js', 'back from signin', id, sessionData.queue.split(','));

                if (($('.btn-suivre[data-id].fav-like').length && $.inArray(id, sessionData.queue.split(',')) == -1)) {
                  $('.btn-suivre[data-id].fav-like').trigger('click');
                }
              }
            }
          }
        })
      }
    }
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
      var url = 'program/more-streaming/' + container.data('more-streaming') + '.json';
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
            $('#carousel-youtube').append('<p class="grey">Ces extraits sont récupérés automatiquement sur Youtube notamment. Il se peut qu\'ils ne correspondent pas tout à fait au programme recherché et les sites référencés sont seuls responsables du contenu qu\'ils proposent.</p>');

          }  
        });
    };
  }
}


$(document).on('click', '[data-play], [data-play-iframe]', function(){
  //remove
  $('.is-playing').each(function(){
    $(this).removeClass('is-playing');
    $('.offers',$(this)).html('<button type="button" class="btn btn-voir"><i class="glyphicon glyphicon-play"></i>&nbsp;Voir </button>');
    var btn = $('.btn', $(this));
    btn.removeClass('disabled');
    btn.html(btn.data('text-save'));
  });
  //Add
  $(this).addClass('is-playing');
  var btn = $('.is-playing .btn');
  btn.addClass('disabled');
  btn.data('text-save', btn.html());
  btn.html('Lecture en cours');
  if ($(this).parents('#videos').length) {
    console.log('scripts/program.js', 'is-playing', 'videos tab');
    $('a[href="#videos"]').trigger('click');
  }
});

//surcharge session sync args to get sVOD :
Session_sync_args = { 'with_svod': 1 };

$(document).ready(function(){

  console.log('scripts/program.js', 'enter document ready', Skhf.session.callbackSignin);

  if ($('#view-program').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    //Skhf.session.callbackInit = null;
    console.log('scripts/program.js', 'Skhf avant callbackSignout', Skhf);
    Skhf.session.callbackSignout = function() {
      ProgramView.unloadProgramUsersDatas($('#view-program').data('id'));
    }

    var dialog_displayed = false;

    Skhf.session.callbackSignin['program'] = function() {
      console.log('scripts/program.js', 'callbackSignin', 'Beginning callbackSignin');

      //load user's data
      if (Skhf.session.datas.email) {
        ProgramView.loadProgramUsersDatas($('#view-program').data('id'));
      }

      //theater playlist et fallback géoloc
      if(!document.location.href.match(/theater_id=/)){
        if (Skhf.session.datas.email &&
            $('.tab-content #trigger-theaters-playlist').length){ //desactivé si id cinéma dans url
          $('.tab-content #trigger-theaters-playlist').trigger('click');
        } else if ($('.tab-content #trigger-theaters-geoloc').length) {
          $('.tab-content #trigger-theaters-geoloc').trigger('click');
        }
      }
      
      //modal program
      ProgramView.loadModal();

      //dialog
      if (!dialog_displayed) {
        if (typeof Skhf.session.datas.email == 'undefined' || Skhf.session.datas.email == null ) {
          var name = $('#fake_h1').html();
          name = jQuery.trim(name);
          if (name.length > 25) {
            name = name.substring(0, 25).trim(this) + "...";
          }
          setTimeout(function(){
            var dialog = new Dialog('notConnectedOnProgram',{
              '%name%': name,
            }, 7000);
            dialog_displayed = true;
          }, 5000);
        }
      }
      
    }

    // -- add preference callback : incitation à suivre des related
    if (!navigator.userAgent.match(/iPhone|iPod/)) { //not optimized for iPhone
      UI.callbackTogglePlaylist = function(parameter, value, remove, trigger, return_data) {
        console.log('UI.callbackTogglePlaylist', 'return_data', return_data);
        if (!remove) {
          real = $('[itemprop="director"]');
          if (real.length == 1) {
            more = '';
            $('.channel-to-follow').each(function() {
              more += '<li> - <a data-channel-name="'+$('img', $(this)).data('track-channel')+'" data-placement="left" data-id="'+$(this).data('id')+'" class="fav fav-channel underline">la chaîne "'+$('img', $(this)).data('track-channel')+'"</a></li>';
            });
            var dialog = new Dialog('relatedDirectorToFollow',{
              '%id%': real.data('id'),
              '%name%': $('span', real).html(),
              '%more%': more,
            },15000);
          }
        }
        /*
        if (typeof return_data != 'undefined') {
          // -- réinitialisation callback pour rester sur la popin
          UI.callbackTogglePlaylist = function(parameter, value, remove, trigger) {
            if ($('#skModal.modal .slider li').length) {
              trigger.parents('.btn-suivre[data-id]:first').remove();
            } else {
              $('#skModal.modal').modal('hide');
            }
          }
          //related channels
          if (return_data.channels) {
            $('#skModal.modal .modal-header .modal-title').html('Le programme a été ajouté à vos listes !');
            $('#skModal.modal .modal-header .modal-message').html('<p><b>Voulez-vous suivre aussi ces chaînes ?</b><br/>Nous vous suggérons d\'ajouter ces chaînes également pour ne rater aucune de leurs diffusions (TV, Replay, VOD, Cinéma).</p>');
            $('#skModal.modal .modal-body').html('<div class="slider slider-list"><ul class="items"></ul></div>');
            new BaseSlider({
              scroll: 'no',
              programs: return_data.channels
            }, function(){
              var trigger = $(this);
              $('#skModal.modal .slider li a[href]').addClass('fav fav-channel')
                                            .attr('href', '#')
                                            .data('ajax', '');
              $('#skModal.modal .slider li').append('<span class="add-playlist btn btn-suivre"><i class="glyphicon glyphicon-plus-sign"></i> Suivre</span>')
                                            .addClass('pull-left')
                                            .on('click', function(){
                UI.togglePlaylist($(this).find('a.title'), false);
              });

            }, $('#skModal.modal .slider'));

            $('#skModal.modal').modal();
          //related same_playlist
          } else if (return_data.programs) {
            //TODO : insert programs in modal
            $('#skModal.modal .modal-header .modal-title').html('Le programme a été ajouté à vos listes !');
            $('#skModal.modal .modal-header .modal-message').html('<p><b>Programmes fréquemment suivis ensemble</b><br/>Nous vous suggérons d\'ajouter ces programmes également pour ne rater aucune de leurs diffusions (TV, Replay, VOD, Cinéma).</p>');
            $('#skModal.modal .modal-body').html('<div class="slider slider-list"><ul class="items"></ul></div>');
            new BaseSlider({
              scroll: 'no',
              programs: return_data.programs
            }, function(){
              var trigger = $(this);
              $('#skModal.modal .slider li a[href]').addClass('fav fav-like')
                                            .attr('href', '#')
                                            .data('ajax', '');
              $('#skModal.modal .slider li').append('<span class="add-playlist btn btn-suivre"><i class="glyphicon glyphicon-plus-sign"></i> Suivre</span>')
                                            .addClass('pull-left')
                                            .on('click', function(){
                UI.togglePlaylist($(this).find('a.title'), false);
              });
            }, $('#skModal.modal .slider'));

            $('#skModal.modal').modal();
          }
        }
        */
      }
    }
   
    //////////// SCRIPTS ////////////////
    $('#affiche .btn').on("click", function(){
      $('#couchmode').empty();
      $('#couchmode').prepend('<div class="#couchmode-program-img" style="height:100%;top: 90px;margin-left:-225px;left: 50%;position: fixed;"><a class="close-btn" style="color:white;float:right"><i class="glyphicon glyphicon-remove"></i></a>'+$(this).data('big-picture')+'</div>');
      $('#couchmode-program-img').attr('style','height:75%;');
      $('#couchmode').show();
      $('.close-btn').on('click', function(){
        $('#couchmode-program-img').remove();
        $('#couchmode').hide();
      });
    });
    
    //modal
    if ($('#program-modal').length){
      $('.modal .trigger-suivre').on('click',function(){
        $('#program-modal').modal('hide');
        $('.btn-suivre').trigger('click');
      });
    }
    //autoload from url
    if (document.location.href.match(/\?rent/gi)) {
      $('#program-offers [data-play]:first').trigger('click');
    } else if (document.location.href.match(/\?follow/gi)) {
      if ($('#program-modal').length){
        ProgramView.loadModal();
      } else if (!$('.btn-suivre[data-id]').hasClass('fav-on')) {
        $('.btn-suivre[data-id]').trigger('click');
      }
    }
    
    //autoload episodes/seasons
    if ($('[data-autoload-episodes]').length) {
      $('[data-autoload-episodes]').each(function(){
        $(this).load(
          API.config.v3_root + '/episodes-list/' + $(this).data('autoload-episodes') + '/'
        );
      });
    }

    //scroll-to-title from best-offer
    $('[data-scroll-to-title]').on('click', function(){
      $(document).scrollTop(475);
      return false;
    });

    //episodes
    $(document).on('click', '#program-episodes .btn-group .btn[data-season]', function(){
      $('#program-episodes .btn-group .btn').removeClass('active');
      $(this).addClass('active');
      $('ul#episodes-list li:not(.hide)').addClass('hide');
      $('ul#episodes-list li.season-' + $(this).data('season')).removeClass('hide');
    })

    //init
    console.log('scripts/program.js', 'before PG init', Skhf.session.callbackSignin);
    if ($('#view-program').hasClass('isInitialized') == false) {
      ProgramView.init();
      console.log('scripts/program.js', 'after PG init');
    }

    // tracking
    $('[data-track-channel]').each(function() {
      //track channel
      //API.trackVar(1, 'Chaîne', $(this).data('track-channel'), 3);
      API.trackEvent('Chaîne', $(this).data('track-channel'), 'page=programme');
    });

    // ui text show more
    $(document).on('click', '.show-all', function () {
      var self = $(this);
      $('.text', $(this).parent()).toggleClass('show-more-height');
      if ($('.text', $(this).parent()).hasClass('show-more-height')) {
        $('.show-more-text').html('Voir plus');
        $('.marge-synopsis').css('padding-bottom','290px');
      } else{
        var height = $('.panel-synopsis').css('height');
        height = parseInt($('.panel-synopsis').css('height'))+19;
        $('.marge-synopsis').css('padding-bottom',height);
        $('.show-more-text').html('Réduire le texte');
        
      }    
    });

    // Déplier la liste des acteurs
    $('.actors_reveal').on('click', function () {
      $('.actors_entrop').toggleClass('hide');
    });  
  }

  //FB Message when click on friend-pic
  $(document).on('click', '#program-friends a', function(){
    var recipient = $(this).data('trigger-fb');
    var link = document.location.href;
    // console.log('scripts/user-friends.js', 'click on friend-pic under program', 'recipient', recipient);
    // console.log('scripts/user-friends.js', 'click on friend-pic under program', 'link', link);
    Facebook.sendMessageTo(recipient,link);
    return false;
  });

  //Scroll to player
  $(document).on('click', '[data-play], [data-play-iframe]', function(){
    $('html,body').animate({'scrollTop' : 0}, 1000);
  });

  //Roulette offers
  if ($('#best-offer-anchor').hasClass('external')) {
    var container = $('#best-offer-anchor .col-xs-13');
    UI.appendLoader(container, 7000);
    TimeOut = setTimeout(function(){
      UI.removeLoader(container);
      $('#best-offer-anchor .col-xs-3').html('<a type="button" class="btn btn-voir" href="#best-offer-anchor"><i class="glyphicon glyphicon-play"></i>&nbsp;Voir</a>');
      var number_offers = $('.offertable .external, .offertable .dvd, .offertable .itunes, .offertable .box, .offertable .console').length;
      var texte_offers = number_offers == 1 ? ' offre disponible sur une autre plateforme' : ' offres disponibles sur d\'autres plateformes';
      container.html('<p>'+number_offers+texte_offers+'</p>');
    },9000);
  }

  // Hide tab-content INFOS after loading (SEO)
  $('.bande_offers .tab-content #infos.active:not(.active-forced)').removeClass('active');
  
  // Manage synopsis long and short display after loading (SEO)
  $('#program-synopsis.synopsis-short').addClass('forced-height');
  if ($('#program-synopsis .tab-pane.text-toggle-extend').hasClass('synopsis-long')) {
    $('#program-synopsis .tab-pane.synopsis-long .text').addClass('show-more-height').prepend('<div class="gradient-hide"></div>');
    $('#program-synopsis .tab-pane.synopsis-long').append('<div class="show-all"><span class="show-more">...</span><span class="show-more-text">Voir plus</span></div>');
  }

  $(document).on('click', '.channel a.credential-cog', function(){
      window.open($(this).attr('href'));
      return false;
  });
  

});

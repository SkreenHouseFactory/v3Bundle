// -- program

$(document).ready(function(){
  if ($('#view-program').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    //Skhf.session.callbackInit = null;
    Skhf.session.callbackSignout = function() {
      ProgramView.unloadProgramUsersDatas($('#view-program').data('id'));
    }
    Skhf.session.callbackSignin = function() {
      ProgramView.loadProgramUsersDatas($('#view-program').data('id'));
      //theater playlist
      if ($('#program-offers #trigger-theaters-playlist').length && 
          !document.location.href.match(/theater_id=/)){ //desactivé si id cinéma dans url
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
    }

    //////////// SCRIPTS ////////////////

    //no deportes
    if ($('#trigger-plays').length == 0) {
      $('#triggers li:first-child a').trigger('click');
    }

    //ics
    $('[data-ics-occurrence]').click(function(e){
      e.preventDefault();
      document.location = API.config.base + '1/icsfile/' + $(this).data('id')  + '.ics';
      return false;
    });

    //episodes
    $('#program-offers .episode').live('hover', function(event) {
      var trigger = $(this);
      var timeout = null;
      if (event.type == 'mouseover' || event.type == 'mouseenter') {
        if (!trigger.data('loaded')) {
          API.query('GET',
                    'program/' + $(this).data('episode-id') + '.json',
                    {
                      with_description: 1,
                      img_width: 200,
                      episode_only: 1
                    },
                    function(json) {
                      $('.popover:visible').hide();
                      trigger.data('loaded', true);
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
                        trigger.attr('data-content', '');
                      }
                    });
        } else if (trigger.attr('data-content')) {
          $('.popover').hide();
          trigger.popover('show');
        }
      } else {
        trigger.popover('hide');
      }
    });

    //youtube
    var trigger = $('#view-program [data-more-streaming]');
    if ($('#carousel-youtube .item').length) {
      $('#trigger-youtube').append(' (' + $('#carousel-youtube .item').length + ')');
    } else if (trigger &&
               trigger.data('more-streaming')) {
      console.log('data-more-streaming', trigger);
      var url = 'program/more-streaming/' + trigger.data('more-streaming') + '.json?nb_results=24';
      API.query('GET',
                url,
                {nb_results: 24},
                function(programs) {
                  if (programs.length == 0 || typeof programs.length == 'undefined') {
                    $('.carousel-youtube').remove();
                    return;
                  }
                  //TODO : sort by duration ?
                  console.log('more-streaming', ' callback', programs.length);
                  $('#trigger-youtube').append(' (' + programs.length + ')');
                  if ($('#triggers li').length == 1) {
                    $('#trigger-youtube').trigger('click');
                  }
                  var container = $('#carousel-youtube .carousel-inner .item:first-child');
                  var c_index = 0;
                  var nb_page = 6;
                  for (var i = 0; i < programs.length; i++) {
                    //console.log('youtube callback', 'c_index:' + c_index, 'modulo:' + i%8, container);
                    if (i%nb_page == 0) {
                      c_index++;
                      var item = $('<div class="item' + (i ==0 ? ' active' : '') + '"></div>')
                      container = $('#carousel-youtube .carousel-inner').append(item);
                    }
                    item.append('<a href="#" data-couchmode=\'{"type": "remote", "id": "' + encodeURIComponent(url) + '", "hide_sliders": "1", "autoplay": "' + programs[i].id + '"}\' class="pull-left">' +
                                '<span>' + programs[i].duration + ' min.</span>' +
                                '<img class="img-polaroid" alt="' + programs[i].title + '" src="' + programs[i].picture + '" />' +
                                '<div class="title">' + programs[i].title + '</div>' +
                                '</a>');
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

    $('[data-track-channel]').each(function() {
      //track channel
      API.trackVar(1, 'Chaîne', $(this).data('track-channel'), 3);
    })
  }
});

// -- ProgramView
var ProgramView;
ProgramView = {
  unloadProgramUsersDatas: function(id) {
    
  },
  //load user program's infos
  loadProgramUsersDatas: function(id) {

    // friends
    if ( Skhf.session.datas.fb_uid) {
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

    // VOD & notifications
    API.query(
      'GET', 
      'program/' + id + '.json', 
      {
        no_metadata: 1,
        with_notifications: 1,
        session_uid: Skhf.session.uid
      }, 
      function(datas){
        console.log('UI.loadProgramUsersDatas', 'callback', datas);
        //bought ?
        if (typeof datas.purchased != 'undefined' &&
            datas.purchased) {
          for (k in datas.purchased) {
            console.log('UI.loadProgramUsersDatas', 'purchased', '#offers [data-id="' + k + '"] td.access', $('#offers [data-id="' + k + '"] td.access'), k, API.formatTimestamp(datas.purchased[k]));
            $('#offers [data-id="' + k + '"] td:last-child .btn').append('<span class="btn-block badge badge-warning">Loué le ' + API.formatTimestamp(datas.purchased[k]) + '</span>');
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
  }
}
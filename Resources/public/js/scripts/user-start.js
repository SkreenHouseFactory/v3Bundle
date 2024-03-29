function menuClassActive(elmt){
  $('.timeline li').removeClass('active');
  $(elmt).parents('li').addClass('active');
}

dispos = {
  1: 'A la demande',
  2: 'A la demande',
  3: 'En DVD',
  4: 'Au cinéma',
  5: 'A la télé',
  6: 'A la télé',
  7: 'En Replay',
  8: 'En Replay',
  9: 'Web TV',
  10: 'Web TV',
  11: 'A la demande',
  12: 'A la demande',
  13: 'Archives',
  14: 'Extraits',
  15: 'Bonus'
}

$(document).ready(function(){

  console.log('scripts/user-start.js', 'Avant Reset');
  API.cookie('start-mes-listes', null); //reset général
  console.log('scripts/user-start.js', 'Après Reset');

  $('form[data-step]').each(function(){
    API.cookie('start-mes-listes-'+$(this).data('step'), null); //reset
  });

  //load from session
  Skhf.session.callbackSignin['user-start'] = function() {
    if (Skhf.session.datas.email) {
      // Inscription cookie
      API.cookie('start-mes-listes-' + $(this).data('step'), 0);
      // Change of confirm button text
      $('#register').html('Voir ma chaîne');
      // Check for FB Connect or not
      if (!Skhf.session.datas.disallow_share) { // Share FB Off
        $('.panel-start .share-start').hide();
        $('.panel-start .user-friends-link').show();
      }
    } else {
      //count : init from cookie
      $('form[data-step]').each(function(){
        c = API.cookie('start-mes-listes-' + $(this).data('step'));
        console.log('scripts/user-start.js', 'count init', $(this).data('step'), c);
        if (parseInt(c) > 0) {
          count = $('#count-'+$(this).data('step'));
          count.html(c).css('display', 'inline-block');
        }
      });
    }
  }

  // Panel Slider Start in RWD mode
  var windowWidth = window.innerWidth;
  var leftLag = windowWidth;
  if (windowWidth < 768) {
    var panelStartWidth = windowWidth - 30;
    var firstPanelStartWidth = windowWidth - 15;
    $('#bandeau-listes .panel-start:first-child').css({
      width: firstPanelStartWidth+'px',
      marginRight: '30px'
    });
    $('#bandeau-listes .panel-start:not(:first-child)').css({
      width: panelStartWidth+'px',
      marginRight: '30px'
    });
  }

  // Animation of Panel Slider Start for RWD mode
  // Go to the right of the Panel Slider
  $(document).on('click', '.panel-start a[data-trigger-click]', function(){
    if ('matchMedia' in window) {
      if (window.matchMedia('(max-width:767px)').matches) {
        $('.forms-container').animate({'left': '-='+leftLag}, 500);
      }
    }
  });
  // Go to the left of the Panel Slider
  $(document).on('click', '.panel-start button[data-trigger-click]', function(){
    if ('matchMedia' in window) {
      if (window.matchMedia('(max-width:767px)').matches) {
        $('.forms-container').animate({'left': '+='+leftLag}, 500);
      }
    }
  });

  // Function of back-to-start button for RWD and Desktop mode
  $(document).on('click', "#back-to-start", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(max-width:767px)').matches) {
        $('.forms-container').animate({'left': '0px'}, 500);
      } else {
        $('.forms-container').animate({'left': '10px'}, 500);
        $('.timeline li').removeClass('active');
      }
    }
  });

  // Animation of Panel Slider Start for Desktop mode
  $(document).on('click', "#menu-films", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-920px'}, 500);
        menuClassActive(this);
      }
    }
  });

  $(document).on('click', "#menu-emissions", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-1990px'}, 500);
        menuClassActive(this);
      }
    }
  });

  $(document).on('click', "#menu-series", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-3000px'}, 500);
        menuClassActive(this);
      }
    }
  });

  $(document).on('click', "#menu-persons", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-4030px'}, 500);
        menuClassActive(this);
      }
    }
  });

  $(document).on('click', "#menu-theaters", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-5030px'}, 500);
        menuClassActive(this);
      }
    }
  });

  $(document).on('click', "#menu-categories", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-6070px'}, 500);
        menuClassActive(this);
      }
    }
  });

 /*
   $(document).on('click', "#menu-amis", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-7090px'}, 500);
        menuClassActive(this);
      }
    }
  });
  */

  $(document).on('click', "#menu-confirm", function() {
    // animate
    if ('matchMedia' in window) {
      if (window.matchMedia('(min-width:768px)').matches) {
        $('.forms-container').animate({'left': '-7090px'}, 500);//'-8110px'}, 500);
        menuClassActive(this);
      }
    }
  });

  //get notif
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
    console.log($(this));
    //allow register
    $('#register').removeClass('hide');
    
    //increment
    if ($(this).data('step')) {
      self = $(this);
      setTimeout(function(){ // wait 500 ms for preference to be added
        console.log('scripts/user-start.js', 'increment', 'debut count', self.data('step'));
        count = $('#count-'+self.data('step'));
        if (self.hasClass('fav-on')) {
          console.log('scripts/user-start.js', 'increment', 'fav-on');
          count.html(parseInt(count.html()) + 1);
          count.css('background-color', '#5cb85c');
        } else if (parseInt(count.html()) > 0) {
          count.html(parseInt(count.html()) - 1);
        }
        if (parseInt(count.html()) == 0) {
          count.hide();
        } else {
          count.css('display', 'inline-block');
        }
        API.cookie('start-mes-listes-' + self.data('step'), parseInt(count.html()));
      }, 3000);
    }

    var like_id = $(this).data('id');
    var like_name = ( typeof($(this).data('channel-name')) != 'undefined' ? $(this).data('channel-name') : $(this).data('name') );
    var like_name_episode = $(this).siblings('a').find('small').html();
    switch ($(this).data('step')){
      case 'films':
        var like_step = 'ce film';
        var confirm_type = 'film';
        break;
      case 'emissions':
        var like_step = 'cette émission';
        var confirm_type = 'émission';
        break;
      case 'series':
        var like_step = 'cette série';
        var confirm_type = 'série';
        break;
      case 'persons':
        var like_step = 'cette personnalité';
        var confirm_type = 'personnalité';
        break;
      case 'theaters':
        var like_step = 'ce cinéma';
        var confirm_type = 'salle de cinéma';
        break;
      case 'categories':
        var like_step = 'cette catégorie de programmes';
        var confirm_type = 'catégorie de programmes';
        break;
    }

    // console.log('scripts/user-start.js', 'like_step', like_step);
    // console.log('scripts/user-start.js', 'like_id', like_id);
    // console.log('scripts/user-start.js', 'like-name', like_name);
    // console.log('scripts/user-start.js', 'like-name-episode', like_name_episode);

    // populate confirmed div & Alert User
    var self = $(this)
    setTimeout(function(){ // wait 1500 ms for preference and fav-on to be added

      if (self.hasClass('fav-on')) {
        $('.no-results').addClass('hide');
        $('.results').removeClass('hide');
        $('.confirmed').addClass('populated');
        $('.confirmed ul').append('<li class="suggest like_' + like_id + '"><span class="col-xs-10">' + like_name + '</span> <em>'+confirm_type+'</em></li>');
        console.log('scripts/user-start.js', 'populate confirmed div :', 'Populate OK');
        // Alert User
        if ($('.confirmed .results ul li').length < 2) {
          console.log('scripts/user-start.js', 'notifs', 'comptabilisé');
          if(Skhf.session.user){
            if(Skhf.session.getNbPlaylists() == 1) {
              var dialog = new Dialog('firstItemInPlaylist',{
                '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
                '%content%': 'avec ' + like_step + ' ',
              },4500);
            }
          } else {
            var dialog = new Dialog('firstItemInPlaylist',{
              '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
              '%content%': 'avec ' + like_step + ' ',
            },4500);
          }
        } else if ($('.confirmed .results ul li').length < 11) {
          if (Skhf.session.user) {
            if (Skhf.session.getNbPlaylists() < 11) {
              var dialog = new Dialog('firstItemsInPlaylist',{
                '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
                '%content%': 'avec ' + like_step + ' ',
                '%nbfavori%': Skhf.session.getNbPlaylists() + ' favoris',
              },4500);
            }
          } else {
            var dialog = new Dialog('firstItemsInPlaylist',{
              '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
              '%content%': 'avec ' + like_step + ' ',
              '%nbfavori%': $('.confirmed .results ul li').length + ' favoris',
            },4500);
          }
        }
      } else {
        $('.confirmed ul li.like_' + like_id).remove();
        console.log('scripts/user-start.js', 'populate confirmed div :', 'Remove OK');
      }
    }, 3000);

    // // Alert User Start
    // setTimeout(function(){ // wait 1000 ms for preference and fav-on to be added 
    //   if (self.hasClass('fav-on')) {
    //     if ($('.confirmed .results ul li').length < 2) {
    //       console.log('scripts/user-start.js', 'notifs', 'comptabilisé');
    //       if(Skhf.session.user){
    //         if(Skhf.session.getNbPlaylists() == 1) {
    //           var dialog = new Dialog('firstItemInPlaylist',{
    //             '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
    //             '%content%': 'avec ' + like_step + ' ',
    //           },4500);
    //         }
    //       } else {
    //         var dialog = new Dialog('firstItemInPlaylist',{
    //           '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
    //           '%content%': 'avec ' + like_step + ' ',
    //         },4500);
    //       }
    //     } else if ($('.confirmed .results ul li').length < 11) {
    //       if (Skhf.session.user) {
    //         if (Skhf.session.getNbPlaylists() < 11) {
    //           var dialog = new Dialog('firstItemsInPlaylist',{
    //             '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
    //             '%content%': 'avec ' + like_step + ' ',
    //             '%nbfavori%': Skhf.session.getNbPlaylists() + ' favoris',
    //           },4500);
    //         }
    //       } else {
    //         var dialog = new Dialog('firstItemsInPlaylist',{
    //           '%title%': like_name + (typeof(like_name_episode) != 'undefined' ? like_name_episode : '' ),
    //           '%content%': 'avec ' + like_step + ' ',
    //           '%nbfavori%': $('.confirmed .results ul li').length + ' favoris',
    //         },4500);
    //       }
    //     }
    //   }
    // }, 1500);
    

    // Notifications
    // if (API.cookie('start-mes-listes')) {
    //   setTimeout(function(){ //wait 500ms for preference to be added
    //     API.query(
    //       'GET', 
    //       'notifications.json', 
    //       {
    //         lists: API.cookie('start-mes-listes').replace('queue', 'like'),
    //         time: new Date().getTime()
    //       }, 
    //       function(data){
    //         console.log(
    //           'scripts/user-start.js', 
    //           'notify callback', data, API.cookie('start-mes-listes').replace('queue', 'like')
    //         );
    //         for (k in data.notifications) {
    //           var n = data.notifications[k];
    //           //console.log('scripts/user-start.js', 'notify', n);
    //           //console.log('scripts/user-start.js', 'number of ajout_playlists', $('.confirmed .results ul li').length);
    //         }
    //     });
    //   }, 500);
    // }

  });

  //register
  $(document).on('click', '#register', function(){
    if (Skhf.session.datas.email) { // User Connected
      document.location = document.location.href.indexOf('goal') != -1 ? API.config.v3_root + '/user/recommend-channels/' : API.config.v3_root + '/user/programs';
    } else { // User Not connected
      UI.auth(function(){
        //alert('callbackAuth');
        //add to lists
        lists_in_session = JSON.parse(API.cookie('start-mes-listes'));
        console.log('scripts/user-start.js', '#register-click', lists_in_session);
        if (Skhf.session.datas.email && lists_in_session) {
          var nb_playlists_callback = 0;
          for(k in UI.available_playlists) {
            key = UI.available_playlists[k].replace('like', 'queue');
            ids = typeof lists_in_session[key] != 'undefined' ? lists_in_session[key] : [];
            if (Object.keys(ids).length) {
              nb_playlists_callback ++;
            }
          }
          console.log('scripts/user-start.js', 'callback UI.auth', 'nb_playlists_callback Init', nb_playlists_callback);
          for(k in UI.available_playlists) {
            console.log('scripts/user-start.js', 'callback UI.auth', 'nb_playlists_callback', nb_playlists_callback);
            key = UI.available_playlists[k].replace('like', 'queue');
            ids = typeof lists_in_session[key] != 'undefined' ? lists_in_session[key] : [];
            console.log('scripts/user-start.js', 'callback UI.auth', key, ids);
            var nb_ids = 0;
            if (Object.keys(ids).length > 0) {
              console.log('scripts/user-start.js', 'callback UI.auth', 'Length of ids', Object.keys(ids).length);
              nb_playlists_callback --;
              for (j in ids) {
                nb_ids ++;
                if (nb_ids == Object.keys(ids).length && nb_playlists_callback == 0){
                  var callback = function(){
                    document.location = API.config.v3_root + '/user/notifs/';
                  }
                } else {
                  var callback = null;
                }
                console.log('scripts/user-start.js', 'callback UI.auth', 'nb_ids', nb_ids);
                API.addPreference(UI.available_playlists[k], ids[j], callback);
                console.log('scripts/user-start.js', 'callback UI.auth', 'Callback', callback);
              }
            }
          }
        }
      });
    }
  });


  //forms not reacting to validation for avoiding reload of pages
  $('form[data-step]').on('submit', function(e){
    e.preventDefault();
    return false;
  });
  //forms responding with suggestions depending on text input
  $('form[data-step] input[type="text"]').keyup(function() {
    $(this).parents('form:first').find('.glyphicon.glyphicon-search').trigger('click');
  })
  $('form[data-step] .glyphicon.glyphicon-search').on('click', function() {
    input = $(this).parents('form:first').find('input[type="text"]');
    step = $(this).parents('form:first').data('step');
    results_container = $('#results-' + step + ' ul');
    console.log('scripts/user-start.js', 'search', input, step, results_container);
    switch(step) {
      case 'persons':
        fav = 'person';
        break;
      case 'theaters':
        fav = 'cinema';
        break;
      case 'channels':
        fav = 'channel';
        break;
      case 'categories':
        fav = 'category';
        break;
      default:
        fav = 'like';
        break;
    }
    q = input.val(); //$(this).find('input[type=text]').val();
    if (q.length < 3 || q == null) {
      console.warn('scripts/user-start.js', 'aborted : short query', q);
      return;
    }

    results_container.empty();
    API.query(
      'GET', 
      'search/autosuggest/' + q + '.json', 
      {
        only: step,
        img_width: 150,
        img_height: 200,
        advanced: 1,
        fields: 'unvailable,nb_followers,photo',
        title_only: 1
      }, 
      function(results){

        if (q != input.val()) {
          console.warn('UI.typeahead', 'outdated response', q);
          return;
        }
        
        results_container.empty().show();
        console.log('scripts/user-start.js', 'callback form', results_container);
        for (k in results) {
          console.log('scripts/user-start.js', 'result', results[k]);
          if (results_container.selector.indexOf('films') != -1 || results_container.selector.indexOf('series') != -1) {
            var type = 'films&series';
          } else if (results_container.selector.indexOf('theaters') != -1) {
            var type = 'theaters'
          }
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          
          if (typeof results[k].picture != 'undefined') {
            results_container.parent().addClass('slider slider-list');
            results_container.addClass('items');
            results_container.append('<li class="image-default root-'+results[k].id+'" data-id="'+results[k].id+'" data-name="' + title + '" data-play-program-id="'+results[k].id+'" style="background:url('+results[k].picture+') no-repeat center"><div class="tv-component"><a  data-trigger-click=".root-'+results[k].id+' .btn-suivre" class="wrap-title size-default"><span class="title"><i class="icon-th icon-white"></i><span class="ms-prog-title">'+ title +', '+results[k].year+'</span><span class="ms-prog-desc"><span data-name="'+ title +'" data-id="'+results[k].id+'" rel="popover" data-placement="top" data-store-in-session="1" class="btn btn-suivre btn-plus fav-' + fav + '" data-step="'+step+'"> Ajouter</span></span></span></a></div></li>')
          } else {
            results_container.parent().removeClass('slider slider-list');
            results_container.removeClass('items');
            results_container.append('<li class="row suggest"><a data-name="'+title+'" data-id="'+results[k].id+'" data-name="' + title + '" rel="popover" data-placement="top" data-store-in-session="1" class="btn btn-suivre btn-plus fav-' + fav + ' col-xs-2" data-step="'+step+'"> Ajouter</a>'+(typeof results[k].picture != 'undefined' ? '<div class="col-xs-1"><img src="'+results[k].picture+'" alt="Illustration de '+title+'" height="40" width="auto"></div>' : '' )+'<a data-trigger-click="a[data-id=\''+results[k].id+'\']"><span class="'+(typeof results[k].picture != 'undefined' ? 'col-xs-9' : 'col-xs-10' )+'">' + title + ((type == 'films&series' && typeof results[k].year != 'undefined') ? '<small> - ' + results[k].year + '</small>' : '') + ((type == 'theaters' && typeof results[k].ville != 'undefined') ? '<small> - '+results[k].ville+'</small>' : '') + '</span>' + (typeof results[k].nb_followers != 'undefined' && results[k].nb_followers ? '<span class="col-xs-4">suivi par  '+results[k].nb_followers+' personnes</span>' : '') + '</a></li>')
        }
      }
    });

    return false;
  });


  //add first flag
  if ($('#addflag')) {
    API.addPreference($('#addflag').data('flag-type'), $('#addflag').data('flag-id'), function(){
      console.log('script/user-start.js', 'autoflag added')
    });
  }

  //from hash
  var hash = window.location.hash.replace('#','').split('=');
  console.log('scripts/user-start.js', 'load hash', hash);
  if (typeof hash[0] != 'undefined' && typeof hash[1] != 'undefined') {
    var fav_name = hash[1];
    if (fav_name.indexOf(',') != -1) {
      var tmp = hash[1].split(',')
      var fav_name = tmp[0];
      var fav_id = tmp[0];
    }
    var fav = hash[0].replace('documentaire','film')
                     .replace('spectacle','film')
                     .replace('série','serie')
                     .replace('émission','emission')
    if ($('[data-step="'+fav+'s"]').length) {
      new Dialog('startLists',{},3000);
      console.log('scripts/user-start.js', 'trigger search');
      $('form[data-step="'+fav+'s"] input[type="text"]').attr('value', fav_name);
      $('form[data-step="'+fav+'s"] .glyphicon.glyphicon-search').trigger('click');
      setTimeout(function(){
        console.log('scripts/user-start.js', 'trigger search', 'setTimeout');
        $('li.suggest a[data-name="'+fav_name+'"], li[data-name="'+fav_name+'"] a').trigger('click');
        $('.start-list.btn').html('Continuer ma chaîne <span class="glyphicon glyphicon-circle-arrow-right"></span>')
      }, 2000)
    } else if (fav == 'trigger' && 
               $('[data-step="'+fav+'"]').length) {
      console.log('scripts/user-start.js', 'trigger menu', hash);
      $('#menu-'+fav).trigger('click');
    }
  }

  //geoloc onload
  $('.trigger-geoloc').on('click', function(){
  	API.geolocation(function(position){
  		$('#results-theaters li.load').load(API.config.v3_root+'/cinema/search?latlng=' + position + ' #table-theaters', function(){
        $('#table-theaters a[data-id]').attr('data-store-in-session', '1').attr('data-step', 'theaters');
        if (Skhf.session.user) {
          UI.loadPlaylistTriggers(
            'cinema', 
            Skhf.session.datas.cinema.split(','), 
            $(this)
          );
        }
  		});
  	}, function(msg, code){
  		results_container.prepend('<p class="alert alert-error">' + msg + '</p>');
  	});
	});

});


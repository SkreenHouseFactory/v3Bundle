// -- user start
function parallax(){
  var scrolled = $(window).scrollTop();
  $('.bg').css('top', -(scrolled*0.5)+'px');
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

  $('form[data-step]').each(function(){
    API.cookie('start-mes-listes-'+$(this).data('step'), null); //reset
  });

  //load from session
  Skhf.session.callbackSignin['user-start'] = function() {
    if (Skhf.session.datas.email) {
      API.cookie('start-mes-listes-' + $(this).data('step'), 0);
    } else {
      //count : init from cookie
      $('form[data-step]').each(function(){
        c = API.cookie('start-mes-listes-' + $(this).data('step'));
        console.log('scripts/user-start.js', 'count init', $(this).data('step'), c);
        if (parseInt(c) > 0) {
          count = $('#count-'+$(this).data('step'));
          count.html(c).show();
        }
      });
    }
  }

  //scrollspy
  $(window).scroll(function(e){
    parallax();
  });
  $('.forms-container').scrollspy({ target: '.navbar-vertical' });
  $('.timeline').affix({
    offset: {
      top: 205, 
      bottom: 250
    }
  });

  $('.timeline li').removeClass('active');
  $('.timeline li:first-child').addClass('active');

  $(".navbar-vertical ul li a[href^='#']").on('click', function(e) {
   // prevent default anchor click behavior
   e.preventDefault();
   // store hash
   var hash = this.hash;
   // animate
   $('html, body').animate({
       scrollTop: $(this.hash).offset().top-15
     }, 300, function(){
       // when done, add hash to url
       // (default click behaviour)
       window.location.hash = hash;
    });
  });

  //get notif
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
    
    //allow register
    $('#register').removeClass('hide');
    
    //increment
    if ($(this).data('step')) {
      count = $('#count-'+$(this).data('step'));
      if ($(this).hasClass('fav-on')) {
        count.html(parseInt(count.html()) + 1);
        count.css('background-color', '#5cb85c');
      } else if (parseInt(count.html()) > 0) {
        count.html(parseInt(count.html()) - 1);
      }
      if (parseInt(count.html()) == 0) {
        count.hide();
      } else {
        count.show();
      }
      API.cookie('start-mes-listes-' + $(this).data('step'), parseInt(count.html()));
    }
    
    if (API.cookie('start-mes-listes')) {
      setTimeout(function(){ //wait 500ms for preference to be added
        API.query(
          'GET', 
          'notifications.json', 
          {
            lists: API.cookie('start-mes-listes').replace('queue', 'like'),
            time: new Date().getTime()
          }, 
          function(data){
            console.log(
              'scripts/user-start.js', 
              'notify callback', data, API.cookie('start-mes-listes').replace('queue', 'like')
            );
            for (k in data.notifications) {
              n = data.notifications[k];
              console.log('scripts/user-start.js', 'notify', n);
              UI.loadAlertUser(
                n.title + (typeof n.title_episode != 'undefined' ? ' - ' + n.title_episode : ''), 
                n.subtitle,
              );
            }
        });
      }, 500);
    }

    // populate confirmed div
    if ($(this).hasClass('fav-on')) {
      $('.no-results').addClass('hide');
      $('.results').removeClass('hide');
      
      var like_id = $(this).data('id');
      //console.log('scripts/user-start.js', 'like_id', like_id);
      var like_title = $(this).parent('.suggest').children('a:not(.btn)').html();
      //console.log('scripts/user-start.js', 'like-title', like_title);
      $('.confirmed ul').append('<li class="suggest like_' + like_id + '">' + like_title + '</li>');
    } else {
      var like_id = $(this).data('id');
      $('.confirmed ul li.like_' + like_id).remove();
    }
  });

  //register
  $(document).on('click', '#register', function(){
    UI.auth(function(){
      lists_in_session = JSON.parse(API.cookie('start-mes-listes'));
      console.log('scripts/user-start.js', '#register-click', lists_in_session);
      if (Skhf.session.datas.email && lists_in_session) {
        for(k in UI.available_playlists) {
          key = UI.available_playlists[k].replace('like', 'queue');
          ids = typeof lists_in_session[key] != 'undefined' ? lists_in_session[key] : [];
          console.log('scripts/user-start.js', 'callback UI.auth', key, ids);
          for (j in ids) {
            API.addPreference(UI.available_playlists[k], ids[j]);
          }
        }
        $('.timeline .badge').html('0').hide();
        setTimeout(function(){
          Skhf.session.initSelector();
          API.query(
            'GET', 
            'notifications.json', 
            {
              lists: API.cookie('start-mes-listes').replace('queue', 'like'),
              session_uid: Skhf.session.uid,
              time: new Date().getTime()
            }, 
            function(data){
              console.log('scripts/user-start.js', 'UI.auth callback', 'create notifs');
          });
          API.cookie('start-mes-listes', null); //reset
        }, 2000);
      }
    });
  });


  //forms
  //$('form[data-step]').on('submit', function(e){
    //e.preventDefault();
  $('form[data-step] input[type="text"]').keyup(function() {
    input = $(this);
    step = $(this).parents('form:first').data('step');
    container = $('#results-' + step + ' ul');
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
    q = $(this).val(); //$(this).find('input[type=text]').val();
    if (q.length < 3 || q == null) {
      console.warn('scripts/user-start.js', 'aborted : short query', q);
      return;
    }

    container.empty();
    API.query(
      'GET', 
      'search/autosuggest/' + q + '.json', 
      {
        only: step,
        img_width: 50,
        img_height: 50,
        advanced: 1,
        with_unvailable: 1,
        with_nb_followers: 1,
        title_only: 1
      }, 
      function(results){

        if (q != input.val()) {
          console.warn('UI.typeahead', 'outdated response', q);
          return;
        }
        
        container.empty();
        console.log('scripts/user-start.js', 'callback form', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li class="row suggest"><a data-name="'+title+'" data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-' + fav + ' col-xs-1" data-step="'+step+'"></a><a data-trigger-click="a[data-id=\''+results[k].id+'\']"><span class="col-xs-7">' + title + '</span>' + (typeof results[k].has_vod != 'undefined' && results[k].has_vod > 0 ? '<span class="col-xs-4"><span class="label label-default">'+(dispos[results[k].has_vod])+'</span></span>' : '') + (typeof results[k].ville != 'undefined' ? '<span class="col-xs-4">'+results[k].ville+'</span>' : '') + (typeof results[k].nb_followers != 'undefined' && results[k].nb_followers ? '<span class="col-xs-4">suivi par  '+results[k].nb_followers+' personnes</span>' : '') + '</a></li>')
        }
    });

    return false;
  });


  //geoloc onload
	API.geolocation(function(position){
		$('#results-theaters li.load').load(API.config.v3_root+'/cinema/search?latlng=' + position + ' #table-theaters', function(){
      $('#table-theaters a[data-id]').attr('data-store-in-session', '1');
      if (Skhf.session.user) {
        UI.loadPlaylistTriggers(
          'cinema', 
          Skhf.session.datas.cinema.split(','), 
          $(this)
        );
      }
		});
	}, function(msg, code){
		container.prepend('<p class="alert alert-error">' + msg + '</p>');
	});
});

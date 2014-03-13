// -- user start

$(document).ready(function(){


  $('.forms-container').scrollspy({ target: '.navbar-vertical' });

  $('.timeline').affix({
    offset: {
      top: 275, 
      bottom: 250
    }
  })
  $('.timeline li').removeClass('active');
  $('.timeline li:first-child').addClass('active');

  //get notif
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
    
    //increment
    if ($(this).data('step')) {
      count = $('#count-'+$(this).data('step'));
      if ($(this).hasClass('fav-on')) {
        count.html(parseInt(count.html()) + 1);
        count.css('background-color', '#5cb85c');
      } else {
        count.html(parseInt(count.html()) - 1);
      }
      if (parseInt(count.html()) == 0) {
        count.hide();
      } else {
        count.show();
      }
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
          function(notifs){
            //do something
        });
      }, 500);
    }
  });

  //count : TODO init from session
  //...

  //register
  $('#register').on('click', function(){
    UI.auth(function(){
      lists_in_session = JSON.parse(API.cookie('start-mes-listes'));
      if (Skhf.session.datas.email && lists_in_session) {
        for(k in UI.available_playlists) {
          var ids = Skhf.session.getPlaylistIds(UI.available_playlists[k]);
          console.log('UI.loadPlaylistTriggers', 'scripts/user-start.js:', UI.available_playlists[k], ids);
          for (k in ids) {
            API.addPreference(UI.available_playlists, ids[k]);
          }
        }
      }
      API.cookie('start-mes-listes', null); //reset
    });
  });


  //forms
  $('form[data-step]').on('submit', function(e){
    e.preventDefault();
    container = $('#results-' + $(this).data('step') + ' ul');
    step = $(this).data('step');
    q = $(this).find('input[type=text]').val();
    container.empty();
    API.query(
      'GET', 
      'search/autosuggest/' + q + '.json', 
      {
        only: step,
        img_width: 50,
        img_height: 50,
        advanced: 1,
        with_unvailable: 1
      }, 
      function(results){
        console.log('scripts/user-start.js', 'callback form', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li class="clearfix">' + title + '<a data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-like pull-right" data-step="'+step+'">Ajouter à mes listes </a></li>')
        }
    });

    return false;
  })
});
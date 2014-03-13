// -- user start

$(document).ready(function(){

  //get notif
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
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

  //register
  $('#register').on('click', function(){
    UI.auth(function(){
      lists_in_session = JSON.parse(API.cookie('start-mes-listes'));
      if (Skhf.session.datas.email && lists_in_session) {
        for(k in UI.available_playlists) {
          var ids = Skhf.session.getPlaylistIds(UI.available_playlists[k]);
          console.log('UI.loadPlaylistTriggers', 'scripts/user-start.js:', this.available_playlists[k], ids);
          for (k in ids) {
            API.addPreference(UI.available_playlists, ids[k]);
          }
        }
      }
    });
  });

  //forms
  $('form').on('submit', function(e){
    e.preventDefault();
    container = $('#results-' + $(this).data('step') + ' ul');
    q = $(this).find('input[type=text]').val();
    container.empty();
    API.query(
      'GET', 
      'search/autosuggest/' + q + '.json', 
      {
        only: $(this).data('step'),
        img_width: 50,
        img_height: 50,
        advanced: 1,
        with_unvailable: 1
      }, 
      function(results){
        console.log('scripts/user-start.js', 'callback form', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li>' + title + '<a data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-like" data-original-title="" title="">Ajouter à mes listes </a></li>')
        }
    });

    return false;
  })
});
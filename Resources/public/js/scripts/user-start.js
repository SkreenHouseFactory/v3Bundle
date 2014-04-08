// -- user start
function parallax(){
  var scrolled = $(window).scrollTop();
  $('.bg').css('top', -(scrolled*0.5)+'px');
}

$(document).ready(function(){

  $(window).scroll(function(e){
    parallax();
  });

  $('.forms-container').scrollspy({ target: '.navbar-vertical' });

  $('.timeline').affix({
    offset: {
      top: 165, 
      bottom: 250
    }
  })
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
      API.cookie('start-mes-listes-'+$(this).data('step'), parseInt(count.html()));
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
            console.log('scripts/user-start.js', 'notify callback', data);
            for (k in data.notifications) {
              n = data.notifications[k];
              console.log('scripts/user-start.js', 'notify', n);
              API.notification(
                n.title + (typeof n.title_episode != 'undefined' ? ' - ' + n.title_episode : ''), 
                n.subtitle,
                n.ico
              );
            }
        });
      }, 500);
    }
  });

  //count : init from cookie
  $('form[data-step]').each(function(){
    c = API.cookie('start-mes-listes-' + $(this).data('step'));
    console.log('scripts/user-start.js', 'count init', $(this).data('step'), c);
    if (parseInt(c) > 0) {
      count = $('#count-'+$(this).data('step'));
      count.html(c).show();
    }
  });

  //register
  $('#register').on('click', function(){
    UI.auth(function(){
      lists_in_session = JSON.parse(API.cookie('start-mes-listes'));
      if (Skhf.session.datas.email && lists_in_session) {
        for(k in UI.available_playlists) {
          var ids = Skhf.session.getPlaylistIds(UI.available_playlists[k]);
          console.log('scripts/user-start.js', UI.available_playlists[k], ids);
          for (k in ids) {
            API.addPreference(UI.available_playlists, ids[k]);
          }
        }
      }
      API.cookie('start-mes-listes', null); //reset
    });
  });


  //forms
  //$('form[data-step]').on('submit', function(e){
    //e.preventDefault();
  $('form[data-step] input[type="text"]').keyup(function () {
    step = $(this).parents('form:first').data('step');
    container = $('#results-' + step + ' ul');
    q = $(this).val(); //$(this).find('input[type=text]').val();
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
        container.empty();
        console.log('scripts/user-start.js', 'callback form', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li class="clearfix"><span>' + title + '</span><a data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-like pull-right" data-step="'+step+'">Ajouter à mes listes </a></li>')
        }
    });

    return false;
  })
});
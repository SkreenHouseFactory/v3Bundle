$(document).ready(function(){
  
  // -- session
  Session.init(function(sessionData){
    console.log('context', Session.context);
    Session.signin(sessionData);
    Session.notify(sessionData.notifications);
    Session.initPlaylist(top.location);
  });

  // -- user
  $('#signin a').click(function(){
    if (Session.context == 'v2') {
      Session.postMessage(["signin"]);
    } else {
      API.quickLaunchModal('signin');
    }
  });
  $('#signed-in a').click(function(){
    if (Session.context == 'v2') {
      Session.postMessage(["signout"]);
    }
    Session.signout();
  });

  // -- nav
  $('.subnav .nav li').hover(function(e){
      e.preventDefault();

      $('.subnav .nav li').removeClass('active');
      $(this).addClass('active');
      
      $('#nav-toggle li').hide();
      $($('a', this).data('target')).fadeIn();
    },function(){    
  });

  // -- form
  $('#top-bar form.navbar-search').submit(function(){
    console.log('search', '/programmes/' + $('.search-query', this).value());
    API.linkV2('/programmes/' + $('.search-query', this).value());
    return false;
  });

  // -- typeahead
  UI.typeahead('.search-query');

  // -- playlist
  $('li.selector:not(.empty)', Session.playlist).live('click', function(){
    Session.loadPlaylist(this.id);
  });
  $('#top-playlist #selector-back a.btn:first').live('click', function(e){
    $(this).parent().hide();
    Session.unloadPlaylist(this.id);
  });

  // -- url
  $('a[data="url"]').live('click', function(e){
    e.event.preventDefault();
    API.linkV2($(this).data('url'));
  });

  // -- player
  $('a[data="player"]').live('click', function(e){
    e.event.preventDefault();
    UI.loadPlayer($(this).data('player'));
  });


  // -- actions : favorite & play
  $('.actions .fav').live('click', function(e){
    e.preventDefault();
    var trigger = $(this);
    var value = trigger.data('id');
    if (Session.datas.email) {
      API.togglePreference('like', value, trigger, function(){
        $('#playlist li[data-id="'+trigger.data('id')+'"]').animate({width:0}).remove();
      });
    } else {
      API.quickLaunchModal('signin', function(){
        if (Session.datas.email){
          API.togglePreference('like', value, trigger);
        }
      });
    }
  });
  $('.actions .play').live('click', function(e){
    e.preventDefault();
    API.linkV2($(this).attr('href'));
    return false;
  });
  $('.slider li').live('click', function(){
    API.linkV2($('.actions .play', this).attr('href'));
    return false;
  });

  // -- popover favorites
  //if (!Session.datas.email) {
    $('.actions .fav:not(.btn-primary)').live('mouseover', function() {
      $(this).popover({placement: 'top',
                       title:	function() { return 'Ajouter à vos favoris'},
                       content: 'Pour voir ce programme plus tard, pour être averti dès qu\'un épisode est disponible en Replay, etc.'})
             .popover('show');
    });
  //}

  // -- popover selector
  $('li.selector a').popover();
  
});

$(document).ready(function(){
  
  // -- session
  Session.init(function(sessionData){
    console.log('context', Session.context);
    Session.signin(sessionData);
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
  $('li.selector', Session.playlist).live('click', function(){
    Session.loadPlaylist(this.id);
  });
  $('#top-playlist #selector-back a.btn:first').live('click', function(e){
    Session.unloadPlaylist(this.id);
  });

});

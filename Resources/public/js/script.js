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
  var original_width = $('ul#playlist li').css('width');
  var playlist = $('ul#playlist');
  $('li.selector', playlist).live('click', function(){
    Session.loadPlaylist(this.id);
  });
  $('#top-playlist #selector-back a.btn:first').live('click', function(e){
    console.log('original_width', original_width);
    $(this).parent().hide();
    $('li:not(.selector, #item)', playlist).animate({width:0}, 500, function() {
      $(this).hide();
      $('li.selector', playlist).show().animate({width:original_width}, 500);
      UI.unloadSlider($('#top-playlist .slider'));
    });
  });

});

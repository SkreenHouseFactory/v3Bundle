$(document).ready(function(){
  
  // -- session
  Session.init(function(sessionData){
    console.log('context', Session.context);
    Session.signin(sessionData);
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
  var original_width = $('#top-playlist ul li').css('width');
  $('#selector li').live('click', function(e){
    $.get($(this).data('load-url').replace('session.uid', Session.uid), 
          {}, 
          function(data){
            $('#selector li').animate({width:0}, 500, function() {
              $('#top-playlist .container').html(data); 
              $('#top-playlist ul li').animate({width:original_width}, 500);
              UI.slider($('#top-playlist .slider'));
            });
          },
          'html');
    
  });
  $('#top-playlist .back-selector').live('click', function(e){
    console.log('original_width', original_width);
    $.get($('#top-playlist').data('selector-url').replace('session.uid', Session.uid), 
          {}, 
          function(data){
            $('#top-playlist ul li').animate({width:0}, 500, function() {
              $('#top-playlist .container').html(data);
              $('#top-playlist ul li').animate({width:original_width}, 500);
            });
          },
          'html');
  });

});

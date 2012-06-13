$(document).ready(function(){
  
  // -- session
  Session.init(function(sessionData){
    
    console.log('context', Session.context);
    
    $('#signin a').click(function(){
      if (Session.context == 'v2') {
        Session.postMessage(["signin"]);
      } else {
        API.quickLaunchModal('signin');
      }
    });
    
    return;
  
    //update user infos
    $('#signin').html(sessionData.email);
    
    //playlist
    Session.loadPlaylist(sessionData.queue);
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

  // -- playlist
  $('#selector li').live('click', function(e){
    $.get($(this).data('load-url').replace('%session.uid%', Session.uid), 
          {}, 
          function(data){
            $('#selector li').animate({width:0}, 500, function() {
              $('#top-playlist .container').html(data); 
            });
          },
          'html');
    
  });
  $('#top-playlist .back-selector').live('click', function(e){
    $.get($('#top-playlist').data('selector-url').replace('%session.uid%', Session.uid), 
          {}, 
          function(data){
            $('#top-playlist ul li').animate({width:0}, 500, function() {
              $('#top-playlist .container').html(data); 
            });
          },
          'html');
    
  });

});

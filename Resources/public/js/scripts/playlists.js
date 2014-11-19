// -- favoris
$(document).ready(function(){
  
  
  ////////////// CALLBACKS
  Skhf.session.callbackSignin['playlists'] = function() {
    console.log('#bandeau-listes', $('#bandeau-listes'));
    //mes listes
    if ($('#bandeau-listes').length) {
      $('#bandeau-listes .auth.titres > div').each(function(){
        if($(this).data('fav') == 'category') {
          var nb = Object.keys(Skhf.session.getPlaylistIds('category')).length + Object.keys(Skhf.session.getPlaylistIds('format-category')).length;
          $(this).find('.badge').html(nb);
        } else {
          var ids = Skhf.session.getPlaylistIds($(this).data('fav'));
          // console.log('scripts/playlists.js', 'bandeau-listes', 'ids', Object.keys(ids));
          $(this).find('.badge').html(Object.keys(ids).length);
        }
        // console.log('scripts/playlists.js', 'bandeau-listes', $(this));
        // console.log('scripts/playlists.js', 'number of each playlists', Object.keys(ids).length);
      })
    }
  }

  ////////////// SCRIPTS
  //console.log('scripts/core/playlists.js', 'load');

  // -- .fav : toggle
  $(document).on('click', '.slider li .fav-trash, .channels-list .channel_link .fav-trash', function(e){
    e.preventDefault();
    e.stopPropagation();
    UI.togglePlaylist($(this));

    return false;
  });
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
    console.log('scripts/core/playlists.js', '.fav click', $(this));
//    e.preventDefault();
//    e.stopPropagation();
    UI.togglePlaylist($(this));

    return false;
  });
  // -- .fav : retirer / popover
  $(document).on('mouseover', '[class*=" fav-"]:not(.fav-trash)', function(event) {
    console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
      // retirer
      if (trigger.hasClass('fav-on')) {
        trigger.removeClass('btn-success')
               .addClass('btn-danger')
               .html('Annuler');
      //popover
      } else if (!trigger.hasClass('btn-danger')) {
        if (!trigger.data('content')) {
          UI.installPopover(trigger);
        }
        trigger.popover('show');
      }
  });
  $(document).on('mouseout', '[class*=" fav-"]:not(.fav-trash)', function(event) {
    //console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
    trigger.popover('hide');
    if (trigger.hasClass('btn-danger')) {
      trigger.removeClass('btn-danger').addClass('btn-success').html('<i class="glyphicon glyphicon-ok"></i> Abonné');
    }
  });




  if ($('.teaser-container .glyphicon-resize-full').length) {
    // RESIZING OF PLAYER AND PLAYER SLIDER

    // Css for glyphicon
    var glyphicon_css_marginRight = '';
    var glyphicon_css_fontSize = '';
    var glyphicon_css_marginTop = '';
    // Css for col-xs-11
    var conatiner_player_css_position = '';
    var conatiner_player_css_zIndex = '';
    var conatiner_player_css_backgroundColor = '';
    var conatiner_player_css_height = '';
    var conatiner_player_css_padding = '';
    var conatiner_player_css_top = '';
    var conatiner_player_css_left = '';
    // Css for player-wrapper
    var player_wrapper_css_backgroundColor = '';
    // Css for teaser-title
    var teaser_title_css_marginTop = '';
    var teaser_title_css_position = '';
    var teaser_title_css_top = '';
    var teaser_title_css_right = '';
    // Css for user-queue-slider
    var user_queue_slider_css_margin = '';
    var user_queue_slider_css_backgroundColor = '';
    var user_queue_slider_css_opacity = '';
    var user_queue_slider_css_position = '';
    var user_queue_slider_css_bottom = '';
    var user_queue_slider_css_left = '';
    // Css for btn controllers
    var a_right_css_left = '';
    var a_right_css_marginRight = '';
    var a_left_css_marginLeft = '';

    // on Resize to Fullscreen
    $(document).on('click','.teaser-container .glyphicon-resize-full',function () {
      console.log('scripts/playlists.js', '.teaser-container .glyphicon-resize-full');

      glyphicon_css_marginTop = $(this).css('margin-top');
      glyphicon_css_marginRight = $(this).css('margin-right');
      glyphicon_css_fontSize = $(this).css('font-size');
      $(this).css({
        marginRight: '20px',
        fontSize: '1.5em',
        marginTop: '-5px'
      });

      conatiner_player_css_left = $('.container-player').css('left');
      conatiner_player_css_top = $('.container-player').css('top');
      conatiner_player_css_padding = $('.container-player').css('padding');
      conatiner_player_css_height = $('.container-player').css('height');
      conatiner_player_css_position = $('.container-player').css('position');
      conatiner_player_css_backgroundColor = $('.container-player').css('background-color');
      conatiner_player_css_zIndex = $('.container-player').css('z-index');
      $('.container-player').css({
        position: 'fixed',
        zIndex: '2000',
        backgroundColor: 'rgba(0,0,0,0.9)'
      });

      player_wrapper_css_backgroundColor = $('.player-wrapper').css('background-color');
      $('.player-wrapper').css({
        backgroundColor: 'transparent'
      });

      $('.teaser-container').css({
        height: '100%'
      });

      teaser_title_css_marginTop = $('.teaser-title').css('margin-top');
      teaser_title_css_position = $('.teaser-title').css('position');
      teaser_title_css_top = $('.teaser-title').css('top');
      teaser_title_css_right = $('.teaser-title').css('right');
      $('.teaser-title p').hide();
      $('.teaser-title').css({
        position: 'absolute',
        top: '0',
        right: '0'
      });
      $('.teaser-title').animate({
        marginTop: '15px'
      }, 500, function(){});

      user_queue_slider_css_margin = $('#user-queue-slider').css('margin');
      user_queue_slider_css_backgroundColor = $('#user-queue-slider').css('background-color');
      user_queue_slider_css_left = $('#user-queue-slider').css('left');
      user_queue_slider_css_bottom = $('#user-queue-slider').css('bottom');
      user_queue_slider_css_position = $('#user-queue-slider').css('position');
      user_queue_slider_css_opacity = $('#user-queue-slider').css('opacity');
      $('#user-queue-slider').css({
        margin: '0 auto',
        backgroundColor: 'black',
        left: '1%',
        bottom: '25px',
        opacity: '0.7',
        position: 'absolute'
      });
      $('#user-queue-slider').addClass('large-view');
      $('#user-queue-slider').removeClass('no-mousehidden');

      $('.container-player').animate({
        width: '100%',
        height: '100%',
        padding: '0',
        top: '0',
        left: '0'
      }, 500, function(){});
      $('#user-queue-slider').animate({
        width: '98%'
      }, 500, function(){});

      a_right_css_left = $('#user-queue-slider a.right').css('left');
      a_right_css_marginRight = $('#user-queue-slider a.right').css('margin-right');
      a_left_css_marginLeft = $('#user-queue-slider a.left').css('margin-left');
      $('#user-queue-slider a.right').css({
        left: 'auto',
        marginRight: '15px'
      });


      $('#user-queue-slider a.left').css({
        marginLeft: '10px'
      });

      $('.teaser-category').animate({
        width: '100%',
        height: '100%'
      }, 500, function(){});

      $(this).removeClass('glyphicon-resize-full');
      $(this).addClass('glyphicon-resize-small');

    });

    // Handling fade-in of slider player
      ($(window)/*, $('iframe').contents().find('body')*/).mousemove(function(e){
        if ($('#user-queue-slider').hasClass('no-mousehidden')) {
          e.preventDefault();
        } else if ($('#user-queue-slider').hasClass('large-view')) {
          setTimeout(function(){
            if (!$('#user-queue-slider').hasClass('no-mousehidden')) {
              $('#user-queue-slider').fadeOut('slow');
            }
            $('#user-queue-slider').removeClass('large-view');
          }, 3000);
        } else {
          $('#user-queue-slider').show();
          setTimeout(function(){
            if (!$('#user-queue-slider').hasClass('no-mousehidden')) {
              $('#user-queue-slider').fadeOut('slow');
            }
          }, 3000);
        }
      });
      /*$('iframe').contents().find('body').mousemove(function(e){
        if ($('#user-queue-slider').hasClass('no-mousehidden')) {
          e.preventDefault();
        } else if ($('#user-queue-slider').hasClass('large-view')) {
          setTimeout(function(){
            $('#user-queue-slider').fadeOut('slow');
            $('#user-queue-slider').removeClass('large-view');
          }, 3000);
        } else {
          $('#user-queue-slider').show();
          setTimeout(function(){
            if (!$('#user-queue-slider').hasClass('no-mousehidden')) {
              $('#user-queue-slider').fadeOut('slow');
            }
          }, 3000);
        }
      });*/

    // on Resize to small player
    $(document).on('click','.teaser-container .glyphicon-resize-small',function () {
      console.log('scripts/playlists.js', '.teaser-container .glyphicon-resize-small');

      $(this).css({
        marginRight: glyphicon_css_marginRight,
        fontSize: glyphicon_css_fontSize,
        marginTop: glyphicon_css_marginTop
      });

      $('.container-player').css({
        position: conatiner_player_css_position,
        zIndex: conatiner_player_css_zIndex,
        backgroundColor: conatiner_player_css_backgroundColor,
        width: '68.7%',
        height: conatiner_player_css_height,
        padding: conatiner_player_css_padding,
        top: conatiner_player_css_top,
        left: conatiner_player_css_left
      });

      $('.player-wrapper').css({
        backgroundColor: player_wrapper_css_backgroundColor
      });

      $('.teaser-container').css({
        height: 'auto'
      });

      $('.teaser-title').css({
        marginTop: teaser_title_css_marginTop,
        position: teaser_title_css_position,
        top: teaser_title_css_top,
        right : teaser_title_css_right
      });
      $('.teaser-title p').show();

      $('#user-queue-slider').css({
        margin: user_queue_slider_css_margin,
        backgroundColor: user_queue_slider_css_backgroundColor,
        width: '100%',
        left: user_queue_slider_css_left,
        bottom: user_queue_slider_css_bottom,
        opacity: user_queue_slider_css_opacity,
        position: user_queue_slider_css_position
      });
      if ($('#user-queue-slider').hasClass('large-view')) {
        $('#user-queue-slider').removeClass('large-view');
      }
      $('#user-queue-slider').show();
      $('#user-queue-slider').addClass('no-mousehidden');

      $('#user-queue-slider a.right').css({
        left: a_right_css_left,
        marginRight: a_right_css_marginRight
      });

      $('#user-queue-slider a.left').css({
        marginLeft: a_left_css_marginLeft
      });

      $('.teaser-category').css({
        width: '636px',
        height: '368px'
      });

      $(this).removeClass('glyphicon-resize-small');
      $(this).addClass('glyphicon-resize-full');
    });
  }

});
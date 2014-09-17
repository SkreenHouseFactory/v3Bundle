// -- channel

function load_program_user () {
  var ids = $('#user-programs').data('program-ids');
  var container = $('.user-loader');
  //var args = typeof args != 'undefined' ? {ids: ids} : {ids: ids};
  if($('#user-channel-programs-slider.slider').length) {
      UI.sliders['user-programs'] = new BaseSlider({
        'url': 'program.json?ids='+ids+'&skKey='+Skhf.session.uid},
        function(){
          UI.removeLoader(container);
        },
        $('#user-channel-programs-slider.slider')
      );
    }
}

$(document).ready(function(){

  // -- track channel
  var channel_name = $('h1').data('channel');
  var channel_id = $('.fav[data-id]').data('id');
  var channel_slug = $('h1').data('channel-slug');
  API.trackEvent('Chaîne', channel_name, 'page=chaine');


  // -- fournisseur
  if ($('#view-fournisseur').length) {
    if (channel_slug && $('#carousel-chaine').length) {
      console.log('scripts/channel.js', 'header fournisseur', 'activate channel', channel_slug);
      $('#carousel-chaine .item.active').removeClass('active');
      $('#carousel-chaine .item [data-channel-slug="' + channel_slug +'"]').addClass('selected');
      $('#carousel-chaine .item [data-channel-slug="' + channel_slug +'"]').parent().addClass('active');
    }

    $('.trigger-channel').on('click', function(){
      UI.refreshChannel($(this).parent().data('channel-id'));
    });
    $('.trigger-channel-date').on('change', function(){
      UI.refreshChannel($(this).data('channel-id'));
    });
    if (channel_name) {
      $('[title="' + channel_name + ' Replay"]').parent().addClass('active');
    }
    /*
    //access
    if ($('#access').length) {
      $('#access').on('change', function(){
        // ?
      })
    }
    */
    //tooltip
    $('a[data-toggle="tooltip"]').tooltip();
    //map
    if ($('#map-container').length) {
      var map;
      var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': $('#map-canvas').data('adress')}, function(results, status) {
        console.log('scripts/channel.js', 'google.maps', results);
        
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          //marker
          var marker = new google.maps.Marker({
           position: results[0].geometry.location,
          	map: map,
          	title: $('#map-canvas').data('name')
          });
          // fenêtre
          var myWindowOptions = {
          	content: '<h6>'+$('#map-canvas').data('name')+'</h6>'
          };
          var myInfoWindow = new google.maps.InfoWindow(myWindowOptions);
          google.maps.event.addListener(marker, 'click', function() {
          	myInfoWindow.open(map, marker);
          });
        } else {
          console.error('scripts/channel.js', 'Geocode was not successful for the following reason: ' + status);
        }
      });
    }

    // Sticky for theaters
    if ($('.view-fournisseur-cinema #theater-related').length) {
      if ($('html').hasClass('no-touch')) {
          $('.view-fournisseur-cinema #theater-related').stick_in_parent({offset_top: 70})
            .on('sticky_kit:bottom', function(e) {
              $('#theater-related').parent().attr('style', function(i, style) {
                return style.replace(/position[^;]+;?/g, '');
              });
              $('.view-fournisseur-cinema #theater-related').css({
                position: 'absolute',
                bottom: '0px',
                top: 'auto'
              });
          });
          // on page theater, modify sticky behaviour depending on display of bande_couleur_degrade
          $(document).on('click', '[data-toggle-display]', function () {
            setTimeout(function(){
              $(document.body).trigger('sticky_kit:recalc');
            }, 500);
          });
      }
    }

  // -- chaine
  } else if ($('#view-page').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    if (typeof Skhf.session.callbackSignin != 'undefined') {
      Skhf.session.callbackSignin['channel'] = function() {
        //follow
        if (document.location.href.match(/\?follow/gi) && 
            !$('.btn-suivre[data-id]').hasClass('fav-on') && 
            !$('.btn-suivre[data-id]').hasClass('triggered')) {
          $('.btn-suivre[data-id]').trigger('click').addClass('triggered');
        }
        // //modal
        // var cookie_visited_channels = API.cookie('visited_channels') ? API.cookie('visited_channels').split(',') : [];
        // console.log('scripts/channels.js', 'visited_channels', channel_id, cookie_visited_channels)
        // if (!cookie_visited_channels || $.inArray('' + channel_id, cookie_visited_channels) == -1) {

        //   if ($('#channel-modal').length && !document.location.href.match(/\?follow/gi)){
        //     //si modal
        //     if (Skhf.session.datas.email) {
        //       $('#channel-modal').addClass('connected');
        //     }
        //     if (!Skhf.session.datas.email || 
        //         !Skhf.session.isInPlaylist($('.fav').data('playlist'), $('.fav').data('id'))) {
        //       $('#channel-modal').modal('show');
        //     }
        //     API.cookie(
        //       'visited_channels', 
        //       (cookie_visited_channels.length ? cookie_visited_channels.join(',') + ',' : null) + channel_id
        //     );

        //     $('#triggerfav').on('click', function() {
        //       $('.fav[data-id]').trigger('click');
        //       $('#channel-modal').modal('hide');
        //     })
        //     $('#fbconnect').on('click', function() {
        //       Skhf.session.callbackSignin['channel'] = function(sessionData) {
        //         //add channel to playlist
        //         if (sessionData.email) {
        //           var id = $('.fav[data-id]').data('id');
        //           console.log('scripts/channels.js', 'back from signin', id, sessionData.page.split(','));

        //           if (($('.fav.fav-page').length && $.inArray(id, sessionData.page.split(',')) == -1) ||
        //               ($('.fav.fav-person').length && $.inArray(id, sessionData.person.split(',')) == -1) ||
        //               ($('.fav.fav-channel').length && $.inArray(id, sessionData.channel.split(',')) == -1) ||
        //               ($('.fav.fav-user').length && $.inArray(id, sessionData.user.split(',')) == -1)) {
        //             $('.fav[data-id]').trigger('click');
        //           }
        //         }
        //       }
        //     })
        //   }
        // }
      }
    }
    

    //////////// SCRIPTS GENERAUX ////////////////
    //setting
    //Scroll to player 
    
    $('html [data-play-url]').on('click', function () {
      console.log('TEST channel_id', channel_id);
      if (channel_id == 65 || channel_id == 1) {
        window.location.href = API.config.v3_url + $(this).data('play-seo-url');
      } else {
        $('html,body').animate({'scrollTop' : 60}, 1000);
      }
    });
    $('.modal .trigger-suivre').on('click',function(){
      $('#channel-modal').modal('hide');
      $('.btn-suivre').trigger('click');
      console.log('scripts/channel.js', 'trigger-suivre', $('.btn-suivre'));
    });


    //////////// SCRIPTS SPECIFIQUES ////////////////
    switch (channel_id) {

      // //APPS
      // case 64:
      //   if (!API.cookie('redirect_apps')) {
      //     console.log('scripts/channel.js', 'Channel Apps', 'No Cookie');
      //     API.cookie('redirect_apps', 1, 1);
      //     var ua = navigator.userAgent.toLowerCase();
      //     // Redirect to Android-site
      //     if(ua.indexOf('android') != -1 && ua.indexOf('mobile')) {
      //       window.location = 'https://play.google.com/store/apps/details?id=com.myskreen.android&hl=fr';
      //     }
      //     // Redirect to iTunes-site
      //     if(ua.indexOf('ios') != -1  || ua.indexOf('iphone') != -1 ||  ua.indexOf('ipod') != -1) {
      //       window.location = 'https://itunes.apple.com/us/app/myskreen/id714308898?l=fr&ls=1&mt=8';
      //     }
      //   }
      // break;
      //INCONNUS
      /*case 1:
      case 65:
        //INTEGRALE INCONNUS
        //trigger click sketch ?click=%5Bdata-id%3D"4939378"%5D
        console.log('scripts/channel.js', 'case 65', 'page bien reconnue');
        if ($('body').hasClass('view-channel-65')) {
          //switch video
          function switchVideo(trigger) {
            //history
            console.log('scripts/channel.js', 'switchVideo', trigger);
            history.pushState({
                custom: true, 
                program_id: trigger.data('id'), 
                path: window.location.href, 
                document_title: document.title ,
              }, 
              $(this).data('play-title') + ', L\'intégrale des Inconnus | myskreen', 
              window.location.pathname + '?click=[data-id="' + trigger.data('id') + '"]'
            );
            //scroll
            $('html,body').animate({'scrollTop' : 60}, 700);
            //play
            $('.row[data-selection-id]').addClass('hide');
            $('.row[data-selection-id='+trigger.data('selection')+']').removeClass('hide');
            $('.isplaying-title strong').html(trigger.data('play-title'));
            $('.player-block iframe').attr('src',trigger.data('play-url'));
            $('.row[data-selection-id='+trigger.data('selection')+'] .item').removeClass('active');
            $('.vidplaylist .vignette[data-id='+trigger.data('id')+']').parent().addClass('active');
            $('.vidplaylist .vignette').removeClass('playing');
            $('.vidplaylist .vignette[data-id='+trigger.data('id')+']').addClass('playing');
            $('.share-block').html('<iframe class="pull-left fbshare"  src="http://www.facebook.com/plugins/like.php?locale=fr_FR&amp;app_id=422066694500806&amp;href='+trigger.data('play-seo-url')+'&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=35" scrolling="no" frameborder="0" style="border:none; height:21px; margin-left:5px; overflow:hidden; width:93px;" allowTransparency="true"></iframe>'
              + '<iframe class="pull-left twitter-share" style="height: 20px;width: 94px; margin-right:0px; margin-left:5px;" allowtransparency="true" frameborder="0" scrolling="no" src="http://platform.twitter.com/widgets/tweet_button.1355514129.html#_=1356719798951&amp;id=twitter-widget-0&amp;lang=fr&amp;original_referer='+trigger.data('play-seo-url')+'&amp;size=m&amp;text='+trigger.data('share-text')+'&amp;url='+trigger.data('play-seo-url')+'" class="block-twitter" data-twttr-rendered="true"></iframe>'
              + '<iframe  class="g-plus-share" frameborder="0" scrolling="no" style="border-style:none; height:30px; margin: 0px 3px 0; visibility:visible; width:70px;" id="I0_share" name="I0_share" src="https://plusone.google.com/_/+1/fastbutton?bsv&amp;size=medium&amp;hl=fr&amp;url='+trigger.data('play-seo-url')+'&amp;id=I0_share" allowtransparency="true" data-gapiattached="true" title="+1"></iframe>'
            );
          }

          //popstate
          $(window).bind('popstate', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('scripts/channel.js', 'popstate', e.originalEvent.state);
            if (e.originalEvent.state) {
              console.log('scripts/channel.js', 'popstate', 'trigger', '[data-id="' + e.originalEvent.state.program_id + '"]');
              switchVideo($('[data-id="' + e.originalEvent.state.program_id + '"]'));
              //$('[data-id="' + e.originalEvent.state.program_id + '"]').trigger('click');
            }
          });

          $('[data-play-url]').on('click',function(){
            switchVideo($(this));
          });
          channel_id = 1; //hack modal
        }
      break;*/

      //PBLV
      case 28:
        var date = new Date();
        	var note = $('#note');
        	// Création de l'objet 'date' (année / mois / jour) ici initialisé au : 9 mars 2012
        	// Attention les mois commencent à 0 !
          var ts = new Date(date.getFullYear(),date.getMonth(),date.getDate(),10,0,0);
      
          switch (date.getDay()) {
            case 6:
              ts.setDate(date.getDate() + 2); 
            break;
            case 7:
              ts.setDate(date.getDate() + 1); 
            break;
          }

        	var newYear = true;
        	if((new Date()) > ts){
        		// The new year is here! Count towards something else.
        		// Notice the *1000 at the end - time must be in milliseconds
        		ts = (new Date()).getTime() + 10*24*60*60*1000;
        		newYear = false;
        	}

          if ((date.getHours() < 10 && date.getDay() != 6 && date.getDay() != 7) || 
              date.getDay() == 6 || 
              date.getDay() == 7){
            $('.well .fav div').remove();
          	$('#countdown').countdown({
          		timestamp	: ts,
          		callback	: function(days, hours, minutes, seconds){
          			var message = " Avant le prochain épisode en avant-première !";
          			note.html(message);
                if (hours == 0 && minutes == 0 &&  seconds == 0 ){
                  document.location.reload();
                }
          		}

          	});
          }
      break;
    }
  }

  // JS Specific for user-channel pages :

  // Load of programs list and load of player
  if ($('#user-programs').length) {
    Player.elmt = $('#player-user-ba');
    UI.appendLoader($('.user-loader'));
    setTimeout(function(){
      load_program_user();
    }, 1500);
  }

  // Prevent link to program page for player slider thumbs
  $(document).on('click', '#user-queue-slider li.actions a', function(e){
    e.preventDefault();
  });

  $('.header-channel-user button.auth').on('click', function(){
    console.log('scripts/channel.js', 'Button mychannel auth');
    Player.stop();
    var url = $(this).data('link');
    UI.auth(function(){
      if (Skhf.session.datas.email) {
        window.location.href = url;
      }
    });
  });

  // Selections of programs list depending on format
  $(document).on('click', '.user-programs-selector .btn', function() {
    var selector = $(this).data('show');
    if (selector == 'all') {
      $('#user-programs li.actions').css('display', 'inline-block');
      $('.user-programs-selector .btn').removeClass('btn-primary');
      $('.user-programs-selector .btn').addClass('btn-default');
      $('.user-programs-selector .btn[data-show="all"]').removeClass('btn-default').addClass('btn-primary');
    } else {
      $('#user-programs li.actions').css('display', 'none');
      $('#user-programs li.actions.'+selector+'').slideToggle();
      $('.user-programs-selector .btn').removeClass('btn-primary');
      $('.user-programs-selector .btn').addClass('btn-default');
      $('.user-programs-selector .btn[data-show="'+selector+'"]').removeClass('btn-default').addClass('btn-primary');
    }
  });

  // RESIZING OF PLAYER AND PLAYER SLIDER

  // Css for glyphicon
  var glyphicon_css_marginRight = '';
  var glyphicon_css_fontSize = '';
  var glyphicon_css_marginTop = '';
  // Css for col-xs-11
  var col_xs_11_css_position = '';
  var col_xs_11_css_zIndex = '';
  var col_xs_11_css_backgroundColor = '';
  var col_xs_11_css_height = '';
  var col_xs_11_css_padding = '';
  var col_xs_11_css_top = '';
  var col_xs_11_css_left = '';
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

    glyphicon_css_marginTop = $(this).css('margin-top');
    glyphicon_css_marginRight = $(this).css('margin-right');
    glyphicon_css_fontSize = $(this).css('font-size');
    $(this).css({
      marginRight: '20px',
      fontSize: '1.5em',
      marginTop: '-5px'
    });

    col_xs_11_css_left = $('.user-player .col-xs-11').css('left');
    col_xs_11_css_top = $('.user-player .col-xs-11').css('top');
    col_xs_11_css_padding = $('.user-player .col-xs-11').css('padding');
    col_xs_11_css_height = $('.user-player .col-xs-11').css('height');
    col_xs_11_css_position = $('.user-player .col-xs-11').css('position');
    col_xs_11_css_backgroundColor = $('.user-player .col-xs-11').css('background-color');
    col_xs_11_css_zIndex = $('.user-player .col-xs-11').css('z-index');
    $('.user-player .col-xs-11').css({
      position: 'fixed',
      zIndex: '2000',
      backgroundColor: 'rgba(0,0,0,0.9)'
    });

    player_wrapper_css_backgroundColor = $('.user-player .col-xs-11 .player-wrapper').css('background-color');
    $('.user-player .col-xs-11 .player-wrapper').css({
      backgroundColor: 'transparent'
    });

    $('.user-player .col-xs-11 .teaser-container').css({
      height: '100%'
    });

    teaser_title_css_marginTop = $('.user-player .col-xs-11 .teaser-title').css('margin-top');
    teaser_title_css_position = $('.user-player .col-xs-11 .teaser-title').css('position');
    teaser_title_css_top = $('.user-player .col-xs-11 .teaser-title').css('top');
    teaser_title_css_right = $('.user-player .col-xs-11 .teaser-title').css('right');
    $('.user-player .col-xs-11 .teaser-title p').hide();
    $('.user-player .col-xs-11 .teaser-title').css({
      position: 'absolute',
      top: '0',
      right: '0'
    });
    $('.user-player .col-xs-11 .teaser-title').animate({
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

    $('.user-player .col-xs-11').animate({
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

    // Handling fade-in of slider player
    ($(window)/*, $('iframe').contents().find('body')*/).mousemove(function(e){
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

  });

  // on Resize to small player
  $(document).on('click','.teaser-container .glyphicon-resize-small',function () {

    $(this).css({
      marginRight: glyphicon_css_marginRight,
      fontSize: glyphicon_css_fontSize,
      marginTop: glyphicon_css_marginTop
    });

    $('.user-player .col-xs-11').css({
      position: col_xs_11_css_position,
      zIndex: col_xs_11_css_zIndex,
      backgroundColor: col_xs_11_css_backgroundColor,
      width: '68.7%',
      height: col_xs_11_css_height,
      padding: col_xs_11_css_padding,
      top: col_xs_11_css_top,
      left: col_xs_11_css_left
    });

    $('.user-player .col-xs-11 .player-wrapper').css({
      backgroundColor: player_wrapper_css_backgroundColor
    });

    $('.user-player .col-xs-11 .teaser-container').css({
      height: 'auto'
    });

    $('.user-player .col-xs-11 .teaser-title').css({
      marginTop: teaser_title_css_marginTop,
      position: teaser_title_css_position,
      top: teaser_title_css_top,
      right : teaser_title_css_right
    });
    $('.user-player .col-xs-11 .teaser-title p').show();

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
    $('#user-queue-slider').removeClass('mousehidden');
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
      width: '600px',
      height: '347px'
    });

    $(this).removeClass('glyphicon-resize-small');
    $(this).addClass('glyphicon-resize-full');
  });

});

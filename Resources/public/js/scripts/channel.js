// -- channel
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
    //access
    if ($('#access').length) {
      $('#access').on('change', function(){
        
      })
    }
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

  // -- chaine
  } else if ($('#view-page').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    Skhf.session.callbackSignin = function() {
      //follow
      if (document.location.href.match(/\?follow/gi) && 
          !$('.btn-suivre[data-id]').hasClass('fav-on') && 
          !$('.btn-suivre[data-id]').hasClass('triggered')) {
        $('.btn-suivre[data-id]').trigger('click').addClass('triggered');
      }
      //modal
      var cookie_visited_channels = API.cookie('visited_channels') ? API.cookie('visited_channels').split(',') : [];
      console.log('scripts/channels.js', 'visited_channels', channel_id, cookie_visited_channels)
      if (!cookie_visited_channels || $.inArray('' + channel_id, cookie_visited_channels) == -1) {

        if ($('#channel-modal').length && !document.location.href.match(/\?follow/gi)){
          //si modal
          if (Skhf.session.datas.email) {
            $('#channel-modal').addClass('connected');
          }
          if (!Skhf.session.datas.email && 
              !Skhf.session.isInPlaylist($('.fav').data('playlist'), $('.fav').data('id'))) {
            $('#channel-modal').modal('show');
          }
          API.cookie(
            'visited_channels', 
            (cookie_visited_channels.length ? cookie_visited_channels.join(',') + ',' : null) + channel_id
          );

          $('#triggerfav').on('click', function() {
            $('.fav[data-id]').trigger('click');
            $('#channel-modal').modal('hide');
          })
          $('#fbconnect').on('click', function() {
            Skhf.session.callbackSignin = function(sessionData) {
              //add channel to playlist
              if (sessionData.email) {
                var id = $('.fav[data-id]').data('id');
                console.log('scripts/channels.js', 'back from signin', id, sessionData.page.split(','));

                if (($('.fav.fav-page').length && $.inArray(id, sessionData.page.split(',')) == -1) ||
                    ($('.fav.fav-person').length && $.inArray(id, sessionData.person.split(',')) == -1) ||
                    ($('.fav.fav-channel').length && $.inArray(id, sessionData.channel.split(',')) == -1) ||
                    ($('.fav.fav-user').length && $.inArray(id, sessionData.user.split(',')) == -1)) {
                  $('.fav[data-id]').trigger('click');
                }
              }
            }
          })
        }
      }
    }

    //////////// SCRIPTS GENERAUX ////////////////
    //setting
    //Scroll to player 
    
    $('html [data-play-url]').on('click', function () {
      $('html,body').animate({'scrollTop' : 60}, 1000);
    });
    $('.modal .trigger-suivre').on('click',function(){
      $('#channel-modal').modal('hide');
      $('.btn-suivre').trigger('click');
      console.log('scripts/channel.js', 'trigger-suivre', $('.btn-suivre'));
    });


    //////////// SCRIPTS SPECIFIQUES ////////////////
    switch (channel_id) {

      //APPS
      case 64:
        if (!API.cookie('redirect_apps')) {
          API.cookie('redirect_apps', 1, 1);
          var ua = navigator.userAgent.toLowerCase();
          // Redirect to Android-site
          if(ua.indexOf('android') != -1 && ua.indexOf('mobile')) {
            window.location = 'https://play.google.com/store/apps/details?id=com.myskreen.android&hl=fr';
          }
          // Redirect to iTunes-site
          if(ua.indexOf('ios') != -1  || ua.indexOf('iphone') != -1 ||  ua.indexOf('ipod') != -1) {
            window.location = 'https://itunes.apple.com/us/app/myskreen/id714308898?l=fr&ls=1&mt=8';
          }
        }
      break;

      //INTEGRALE INCONNUS
      //trigger click sketch ?click=%5Bdata-id%3D"4939378"%5D
      case 65:
        //switch vieo
        function switchVideo(trigger) {
          //history
          console.log(window.location);
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
      break;

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
});
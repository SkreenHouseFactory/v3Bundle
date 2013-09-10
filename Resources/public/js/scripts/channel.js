// -- channel
$(document).ready(function(){

  // -- track channel
  var channel_name = $('h1').data('channel');
  var channel_id = $('.fav[data-id]').data('id');

  //API.trackVar(1, 'Chaîne', channel_name, 3);
  API.trackEvent('Chaîne', channel_name, 'page=chaine');

  // -- fournisseur
  if ($('#view-fournisseur').length) {
    if (channel_name) {
      alert(channel_name.toUpperCase());
      $('#carousel-chaine .item.active').removeClass('active');
      $('[data-original-title="' + channel_name.toUpperCase() +'"]').addClass('selected');
      $('[data-original-title="' + channel_name.toUpperCase() +'"]').parent().addClass('active');

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
          console.error("Geocode was not successful for the following reason: " + status);
        }
      });
    }

  // -- chaine
  } else if ($('#view-page').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    Skhf.session.callbackSignin = function() {

      //modal
      var cookie = API.cookie('visited_channels') ? API.cookie('visited_channels').split(',') : [];
      console.log('scripts/channels.js', 'visited_channels', channel_id, cookie)
      if (!cookie || $.inArray('' + channel_id, cookie) == -1) {

        if ($('#channel-modal').length){
          //si modal
          if (Skhf.session.datas.email) {
            $('#channel-modal').addClass('connected');
          }
          if (!Skhf.session.datas.email && 
              !Skhf.session.isInPlaylist($('.fav').data('playlist'), $('.fav').data('id'))) {
            $('#channel-modal').modal('show');
          }
          API.cookie('visited_channels', (cookie.length ? cookie.join(',') + ',' : null) + channel_id);
          
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

    //////////// SCRIPTS ////////////////

    // -- countdown pblv
    //setting
    if (channel_id == 3517970) {
    	var note = $('#note'),
    		ts = new Date(2013,7,6,10,0,0),
    		newYear = true;
	
    	if((new Date()) > ts){
    		// The new year is here! Count towards something else.
    		// Notice the *1000 at the end - time must be in milliseconds
    		ts = (new Date()).getTime() + 10*24*60*60*1000;
    		newYear = false;
    	}
		
    	$('#countdown').countdown({
    		timestamp	: ts
    	});
    }
    if (channel_id == 28) {
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
    }
  }
});
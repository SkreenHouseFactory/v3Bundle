// -- channel
$(document).ready(function(){

  // -- track channel
  var channel_name = $('h1').data('channel');
  //API.trackVar(1, 'Chaîne', channel_name, 3);
  API.trackEvent('Chaîne', channel_name, 'page=chaine');

  // -- fournisseur
  if ($('#view-fournisseur').length) {
    $('.trigger-channel').click(function(){
      UI.refreshChannel($(this).parent().data('channel-id'));
    });
    $('.trigger-channel-date').change(function(){
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
      var channel_id = $('.actions[data-id]').data('id');
      var cookie = API.cookie('visited_channels') ? API.cookie('visited_channels').split(',') : [];
      console.log('scripts/channels.js', 'visited_channels', channel_id, cookie)
      if (!cookie || $.inArray('' + channel_id, cookie) == -1) {
   
        if ($('#channel-modal').length) { //si modal

          if (Skhf.session.datas.email) {
            $('#channel-modal').addClass('connected');
            console.log('SESSION DATA',Skhf.session);
          }
          if{Skhf.session.datas.email && 
            !Skhf.session.isInPlaylist($('.actions').data('playlist'),$('.actions').data('id'))){
            $('#channel-modal').modal('show');
          }
            console.log('scripts/channels.js', ' c', 'set cookie'),
            API.cookie('visited_channels', (cookie.length ? cookie.join(',') + ',' : null) + channel_id);
          
          $('#triggerfav').on('click', function() {
            $('.actions[data-id] .fav').trigger('click');
            $('#channel-modal').modal('hide');
          })
          $('#fbconnect').on('click', function() {
            Skhf.session.callbackSignin = function(sessionData) {
              //add channel to playlist
              if (sessionData.email) {
                var id = $('.actions[data-id]').data('id');
                console.log('scripts/channels.js', 'back from signin', id, sessionData.page.split(','));

                if (($('.actions[data-id] a.fav-page').length && $.inArray(id, sessionData.page.split(',')) == -1) ||
                    ($('.actions[data-id] a.fav-person').length && $.inArray(id, sessionData.person.split(',')) == -1) ||
                    ($('.actions[data-id] a.fav-channel').length && $.inArray(id, sessionData.channel.split(',')) == -1) ||
                    ($('.actions[data-id] a.fav-user').length && $.inArray(id, sessionData.user.split(',')) == -1)) {
                  $('.actions[data-id] a.fav').trigger('click');
                }
              }
            }
          })
        }
      }
    }

    //////////// SCRIPTS ////////////////
  }
});
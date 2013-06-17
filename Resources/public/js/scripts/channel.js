// -- channel
$(document).ready(function(){

  // -- track channel
  var channel_name = $('h1').data('channel');
  API.trackVar(1, 'Chaîne', channel_name, 3);

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
          }

          $('#channel-modal').modal('show');
          console.log('scripts/channels.js', 'visited_channels', 'set cookie'),
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
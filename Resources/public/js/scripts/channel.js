// -- channel
$(document).ready(function(){
  // -- fournisseur
  if ($('#view-fournisseur').length) {
    $('.trigger-channel').click(function(){
      UI.refreshChannel($(this).parent().data('channel-id'));
    });
    $('.trigger-channel-date').change(function(){
      UI.refreshChannel($(this).data('channel-id'));
    });
    if (channel_name = $('#view-channel h1').html()) {
      $('[title="' + channel_name + ' Replay"]').parent().addClass('active');
      //track channel
      API.trackVar(1, 'Chaîne', channel_name, 3);
    }

  // -- chaine
  } else if ($('#view-page').length) {

    //////////// CALLBACKS ////////////////
    // -- session sync
    Skhf.session.callbackSignin = function() {
      //add channel to playlist
      if (Skhf.session.datas.email) {
        if ($('.actions[data-id] a.fav').length) {
          $('.actions[data-id] a.fav').trigger('click');
        }
      }
    }

    //////////// SCRIPTS ////////////////
    //modal
    var channel_id = $('.actions[data-id]').data('id');
    var cookie = API.cookie('visited_channels') ? API.cookie('visited_channels').split(',') : [];
    console.log('scripts/channels.js', 'visited_channels', channel_id, cookie)
    if (!cookie ||
        $.inArray('' + channel_id, cookie) == -1) {

      if ($('#channel-modal').length) { //si modal
        $('#channel-modal').modal('show');
        console.log('scripts/channels.js', 'visited_channels', 'set cookie'),
        API.cookie('visited_channels', (cookie.length ? cookie.join(',') + ',' : null) + channel_id);
      }
    }
  }
});
// -- channel
$(document).ready(function(){
  if ($('#view-fournisseur').length > 0) {
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
  }
});
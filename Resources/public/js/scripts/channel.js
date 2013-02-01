// -- channel
$(document).ready(function(){
	if ($('#view-channel').length > 0) {
	  $('.trigger-channel').click(function(){
	    UI.refreshChannel($(this).parent().data('channel-id'));
	  });
	  $('.trigger-channel-date').change(function(){
	    UI.refreshChannel($(this).data('channel-id'));
	  });
	  if (channel_name = $('#view-channel h1').html()) {
	    $('[title="'+channel_name+' Replay"]').parent().addClass('active');
	  }
	}
});
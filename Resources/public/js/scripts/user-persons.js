// -- user persons

$(document).ready(function(){
  if ($('#view-user-persons').length) {


    //////////// CALLBACKS ////////////////
    // -- refresh on add person to playlist
    UI.callbackTogglePlaylist = function(parameter, value, remove, trigger) {
      if (parameter == 'person' && !remove) {
        document.location.reload();
      }
    }

    // filter
    $('.nav-pills li').on('click', function(){
      console.log('scripts/user-persons', $(this).data('toggle'), $(this))
      $('.nav-pills li').removeClass('active');
      if (!$(this).data('toggle')) {
        $('.nav-pills li:first').addClass('active');
        $('.table tr').show();
      } else {
        $(this).addClass('active');
        $('.table tr:not(.' + $(this).data('toggle') + ')').hide();
        $('.table tr.' + $(this).data('toggle')).show();
      }
    }) ;

  }
});

// -- favoris
$(document).ready(function(){
  //console.log('scripts/core/playlists.js', 'load');
  // -- .fav : toggle
  $(document).on('click', '.actions .fav', function(e){
//    console.log('scripts/core/playlists.js', '.fav click', $(this));
//    e.preventDefault();
//    e.stopPropagation();
    UI.togglePlaylist($(this));

    return false;
  });
  // -- .fav : retirer / popover
  $(document).on('hover', '.actions .fav:not(.fav-trash)', function(event) {
    //console.log('scripts/core/playlists.js', '.fav:hover', event.type);
    var trigger = $(this);
    if (event.type == 'mouseover' || event.type == 'mouseenter') {
      // retirer
      if (trigger.hasClass('fav-on')) {
        trigger.addClass('btn-danger')
               .html('<i class="icon-remove-sign icon-white"></i> Retirer des playlists');
      //popover
      } else if (!trigger.hasClass('btn-danger')) {
        if (!trigger.data('content')) {
          UI.installPopover(trigger);
        }
        trigger.popover('show');
      }
    } else if (event.type == 'mouseout' || event.type == 'mouseleave') {
      trigger.popover('hide');
      if (trigger.hasClass('btn-danger')) {
        trigger.removeClass('btn-danger').html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists');
      }
    }
  });
});
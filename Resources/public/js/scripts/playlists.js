// -- favoris
$(document).ready(function(){
  //console.log('scripts/core/playlists.js', 'load');
  // -- .fav : toggle
  $(document).on('click', '.slider li .fav-trash', function(e){
    $(this).data('id', $(this).parent().data('id'));
    e.preventDefault();
    e.stopPropagation();
    UI.togglePlaylist($(this));

    return false;
  });
  $(document).on('click', '[data-id][class*=" fav-"]', function(e){
    console.log('scripts/core/playlists.js', '.fav click', $(this));
//    e.preventDefault();
//    e.stopPropagation();
    UI.togglePlaylist($(this));

    return false;
  });
  // -- .fav : retirer / popover
  $(document).on('mouseover', '[data-id][class*=" fav-"]:not(.fav-trash)', function(event) {
    //console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
      // retirer
      if (trigger.hasClass('fav-on')) {
        trigger.addClass('btn-danger')
               .html('<i class="glyphicon glyphicon-remove"></i> Retirer des playlists');
      //popover
      } else if (!trigger.hasClass('btn-danger')) {
        if (!trigger.data('content')) {
          UI.installPopover(trigger);
        }
        trigger.popover('show');
      }
  });
  $(document).on('mouseout', '[data-id][class*=" fav-"]:not(.fav-trash)', function(event) {
    //console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
    trigger.popover('hide');
    if (trigger.hasClass('btn-danger')) {
      trigger.removeClass('btn-danger').html('<i class="glyphicon glyphicon-ok"></i> Dans vos playlists');
    }
  });
});
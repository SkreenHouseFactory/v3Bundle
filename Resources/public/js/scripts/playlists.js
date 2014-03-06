// -- favoris
$(document).ready(function(){
  
  
  ////////////// CALLBACKS
  Skhf.session.callbackSignin['playlists'] = function() {
    console.log('#bandeau-listes', $('#bandeau-listes'));
    //mes listes
    if ($('#bandeau-listes').length) {
      $('#bandeau-listes .user-on.titres > div').each(function(){
        var ids = Skhf.session.getPlaylistIds($(this).data('fav'))
        $(this).find('.badge').html(ids.length);
      })
    }
  }

  ////////////// SCRIPTS
  //console.log('scripts/core/playlists.js', 'load');

  $('.meslistes-plus').on('click', function(){
    $('.bande_couleur_degrade').slideToggle();
    $('.glyphicon', $(this)).toggleClass('glyphicon-collapse-down')
                            .toggleClass('glyphicon-collapse-up');
    if ($('.glyphicon', $(this)).hasClass('glyphicon-collapse-up')) {
      $('span', $(this)).html('&nbsp;Fermer');
    } else {
      $('span', $(this)).html('&nbsp;Plus d\'infos...');
    }
    return false;
  });

  // -- .fav : toggle
  $(document).on('click', '.slider li .fav-trash', function(e){
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
  $(document).on('mouseover', '[class*=" fav-"]:not(.fav-trash)', function(event) {
    console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
      // retirer
      if (trigger.hasClass('fav-on')) {
        trigger.removeClass('btn-success')
               .addClass('btn-danger')
               .html('Annuler');
      //popover
      } else if (!trigger.hasClass('btn-danger')) {
        if (!trigger.data('content')) {
          UI.installPopover(trigger);
        }
        trigger.popover('show');
      }
  });
  $(document).on('mouseout', '[class*=" fav-"]:not(.fav-trash)', function(event) {
    //console.log('scripts/core/playlists.js', '[class*=" fav-"]:mouseover');
    var trigger = $(this);
    trigger.popover('hide');
    if (trigger.hasClass('btn-danger')) {
      trigger.removeClass('btn-danger').addClass('btn-success').html('<i class="glyphicon glyphicon-ok"></i> Abonné');
    }
  });
});
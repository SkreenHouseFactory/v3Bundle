// -- program
$(document).ready(function(){
  if ($('#view-settings').length) {

    // Affichage de l'onglet correct sur la page settings
    var url = document.location.toString();
    if (url.match('settings') && url.match('#')) {
        $('.nav-pills a[href=#'+url.split('#')[1]+']').tab('show') ;
    }
    //newsletter
    $('.newsletter .btn').on('click', function(){
      if ($(this).data('share') == 'disallow') {
        API.query('POST', 'session/settings/' + Skhf.session.uid + '.json', {
                    newsletter: 'unsubscribe'
                  });
      } else {
        API.query('POST', 'session/settings/' + Skhf.session.uid + '.json', {
                    newsletter: 'subscribe'
                  });
      }
    });
    //notifications
    $('.notification .btn').on('click', function(){
      if ($(this).data('notify') == 'disallow') {
        API.query('POST', 'user/blacklist.json', {
                    email: Skhf.session.datas.email,
                    notifications: true
                  });
      } else {
        API.query('POST', 'user/blacklist.json', {
                    email: Skhf.session.datas.email,
                    notifications: true,
                    remove: true
                  });
      }
    });
  }
});
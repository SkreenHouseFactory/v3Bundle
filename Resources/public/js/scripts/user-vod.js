// -- user svod

$(document).ready(function(){
  if ($('#view-svod').length || $('#view-vod').length) {

    // filter
    $('.unsubscribe-svod').on('click', function(){
      console.log('scripts/user-svod', $(this).data('unsubscribe'));
      API.query(
        'POST',
        'session/settings/' + Skhf.session.uid + '.json',
        {
          unsubscribe_svod: $(this).data('code')
        },
        function() {
          document.location.reload();
        }
      );
    }) ;

  }
});

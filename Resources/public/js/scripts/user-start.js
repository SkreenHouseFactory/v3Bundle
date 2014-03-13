// -- user start

$(document).ready(function(){

  //forms
  $('form').on('submit', function(e){
    e.preventDefault();
    container = $('#results-' + $(this).data('step') + ' ul');
    q = $(this).find('input[type=text]').val();
    container.empty();
    API.query(
      'GET', 
      'search/autosuggest/' + q + '.json', 
      {
        only: $(this).data('step'),
        img_width: 50,
        img_height: 50,
        advanced: 1,
        with_unvailable: 1
      }, 
      function(results){
        console.log('scripts/user-start.js', 'callback', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li>' + title + '<a data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-like" data-original-title="" title="">Ajouter à mes listes </a></li>')
        }
    });

    return false;
  })
});
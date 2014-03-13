// -- user start

$(document).ready(function(){

  $('.forms-container').scrollspy({ target: '.navbar-vertical' });

  $('.timeline').affix({
    offset: {
      top: 275, 
      bottom: 250
    }
  })
  $('.timeline li').removeClass('active');
  $('.timeline li:first-child').addClass('active');

  //forms
  $('form').on('submit', function(e){
    e.preventDefault();
    var self = $(this);
    q = $(this).find('input[type=text]').val();
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
        container = $('#results-' + self.data('step') + ' ul');
        console.log('scripts/user-start.js', 'callback', container);
        for (k in results) {
          title = typeof results[k].title != 'undefined' ? results[k].title : results[k].name;
          container.append('<li class="clearfix">' + title + '<a data-id="'+results[k].id+'" rel="popover" data-placement="left" data-store-in-session="1" class="btn btn-suivre btn-plus fav-like pull-right" data-original-title="" title="">Ajouter à mes listes </a></li>')
        }
    });

    return false;
  })
});
// -- person
console.log('scripts/person.js', 'try', $('#view-person'));
$(document).ready(function(){
  if ($('#view-person').length) {
    console.log('scripts/person.js', 'load');

    //////////// CALLBACKS ////////////////
    // -- add preference callback : incitation à suivre des related
    if (!navigator.userAgent.match(/iPhone|iPod/)) { //not optimized for iPhone
      console.log('scripts/person.js', 'define callbackTogglePlaylist');
      UI.callbackTogglePlaylist = function(parameter, value, remove, trigger, return_data) {
        if (!remove) {
          more = '';
          $('#person-related .person-relations').each(function() {
            more += '<li> - <a data-placement="left" data-id="'+$(this).data('id')+'" class="fav fav-person underline">"'+$('a.name', $(this)).html()+'"</a></li>';
          });
          var dialog = new Dialog('relatedToFollow',{
            '%more%': more,
          },15000);
        }
      }
    }

    // toggle display
    $('[data-filter-format]').on('click', function () {
      console.log('scripts/person.js', '[data-filter-format]', $(this).data('filter-format'));
      if ($(this).data('filter-format') == 'all') {
        $('.items li').show();
      } else {
        $('.items li').hide();
        $('.items li.'+$(this).data('filter-format')).show();
      }
    });
  }
});
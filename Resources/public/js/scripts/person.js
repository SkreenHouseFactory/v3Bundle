// -- program

$(document).ready(function(){
  if ($('#view-person').length) {
    // toggle display
    $('[data-filter-format]').on('click', function () {
      console.log('script', '[data-filter-format]', $(this).data('filter-format'));
      if ($(this).data('filter-format') == 'all') {
        $('.items li').show();
      } else {
        $('.items li').hide();
        $('.items li.'+$(this).data('filter-format')).show();
      }
    });
  }
});
// -- program
$(document).ready(function(){
  if ($('#view-user-persons').length) {

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

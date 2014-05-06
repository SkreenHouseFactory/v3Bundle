$(document).ready(function(){
  $(document).on('click', '.onoffswitch', function(){
    console.log('scripts/category.js', 'Click Switch');
    if ($(this).data('ajax').indexOf('/myskreen/') != -1) {
      console.log('scripts/category.js', 'Click Switch', 'myskreen ds le data-ajax');
      var new_data_ajax = $(this).data('ajax').replace('/myskreen/', '/');
      console.log('scripts/category.js', 'new_data_ajax', new_data_ajax);
      $(this).data('ajax', new_data_ajax);
      $(this).find('#myonoffswitch').attr('checked', true);
    } else {
      console.log('scripts/category.js', 'Click Switch', 'PAS myskreen ds le data-ajax');
      var new_data_ajax = $(this).data('ajax').replace('/ #', '/myskreen/ #');
      console.log('scripts/category.js', 'new_data_ajax', new_data_ajax);
      $(this).data('ajax', new_data_ajax);
      $(this).find('#myonoffswitch').attr('checked', false);
    }
  });
});
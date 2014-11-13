$(document).ready(function(){
  
  //scrollspy
  /*
  $('body').scrollspy({ target: '.teaser-container' })
  $('.teaser-container').on('activate.bs.scrollspy', function () {
    alert("spy");
    $('.teaser-container').addClass('teaser-fixed');
  })
  */
  
  API.query(
    'GET',
    'category/' + $('#view-category').data('id') + '.json',
    {
      fields: 'programs,notifications',
      facets: 'format:' + $('#view-category').data('format-facet'),
      offset: 0,
      nb_results: 100,
      disable_search_by_format: 1
    },
    function(data){
      console.log('scripts/category.js', 'notifications callback', data.notifications);
  })
  
  /*
  //filtre 
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
  */
  
  
  $('[data-play-program-id]:first').trigger('click');
});
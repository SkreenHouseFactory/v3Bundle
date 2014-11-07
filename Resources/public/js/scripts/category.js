$(document).ready(function(){
  

  $('[data-play-program-id]').on('click', function(e){
    e.preventDefault();
    console.log('scripts/category.js', 'play program');
    $('.teaser-category iframe').attr('src', 'http://player.myskreen.com/watch-program-'+$(this).data('play-program-id')+'/');
    
    API.query(
      'GET', 
      'program/' + $(this).data('play-program-id') + '.json', 
      { no_metadata: 0 }, 
      function(program){
        console.log('scripts/category.js', 'update program info', program);
        $('.teaser-title').html(
          program.title + ', ' + 
          '<br/><small>' + program.format.name + ' - ' + program.duration + 'mn</small>' +
          '<br/><a class="btn btn-default" href="' + program.seo_url + '">Voir maintenant</a>' +
          '<br/><a class="btn btn-default btn-suivre btn-plus fav-program" data-id="' + program.id + '">Ajouter à mes listes</a>'
        );
      });

    return false;
  });
  
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
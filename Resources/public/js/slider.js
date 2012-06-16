// -- Slider
var Slider;
Slider = {
  item_width: 150,
  pager_nb_results: 10,
  //init
  init: function(slider) {
    console.log('Slider.init', slider);
    var container = $('.slider-container', slider);
    var items = $('ul', container);
    items.css('width', parseInt(this.item_width) * items.children().length);
    console.log('Slider.init', 'width', items.css('width'));

    if (slider.hasClass('initialized')) {
      console.log('Slider.init', 'already initialized');
      return;
    }

    var next = $('.next', slider);
    var prev = $('.prev', slider);

    if (items.children().filter(':not(.selector, #item)').length <= 5) {
      console.log('Slider.init', 'count', items.children().filter(':not(.selector, #item)').length, items);
      return;
    }

    next.bind('click', function(){
      //console.log('next', container.css('left'), container.css('width'));
      if (parseInt(items.css('left')) < 2000 || items.css('left') == 'auto') {
        items.animate({left: '+=-'+parseInt(container.css('width'))}, 500, function() {
          console.log('pager', parseInt(items.css('left')) + parseInt(container.css('width')), items.css('width'));
          if (parseInt(items.css('left')) + parseInt(container.css('width')) == 0) {
            next.css({'visibility':'hidden'});
            //pager
            if (slider.data('pager-url')) {
              var loader = $('<div>').append($('#playlist li#item').clone()
                                                                   .attr('id','')
                                                                   .addClass('loader')).html();
              items.append(loader);

              Slider.load(slider, slider.data('pager-url'));
              slider.data('pager-offset', Slider.pager_nb_results + parseInt(slider.data('pager-offset')));
            }
          }
          if (prev.css('visibility') == 'hidden') {
            prev.css({'visibility':'visible'});
          }
        });
      }
    }).css({'visibility':'visible'});

    $('.prev', slider).bind('click', function(){
      //console.log('prev', container.css('left'), container.css('width'));
      if (-parseInt(items.css('left')) < parseInt(items.css('width'))) {
        items.animate({left: '+=' + parseInt(container.css('width'))}, 500, function() {
          console.log('pager', items.css('left'), items.css('width'));
          if (parseInt(items.css('left')) == 0) {
            prev.css({'visibility':'hidden'});
            if (next.css('visibility') == 'hidden') {
              next.css({'visibility':'visible'});
            }
          }
        });
      }
    });

    slider.addClass('initialized')
  },
  remove: function(slider) {
    $('.next, .prev', slider).css({'visibility':'hidden'});
    $('.next, .prev', slider).unbind('click');
    $('ul', slider).css('left', '0px');
    slider.removeClass('initialized');
  },
  load: function(slider, url, callback) {
    $.get(url, 
          {}, 
          function(programs){
            $('li:not(.selector, #item)', slider).remove(); 
            for (key in programs) {
              var program = programs[key];
              var item = $('<div>').append($('li#item', slider).clone()
                                                                 .attr('id','')
                                                                 .addClass('to_animate')
                                                                 .addClass(program.deporte?'deporte':'')).html();
              var title = program.format != 'Film' ? program.title : '';
              var pere  = program.episodeof ? program.episodeof : program;
              $('ul', slider).append(item.replace('%seo_add_title%',pere.title + ', ' + program.format + ' - ' + program.year)
                                         .replace('%seo_play_title%',program.title)
                                         .replace('%title%',title)
                                         .replace('%img%',program.picture)
                                         .replace('%url%',program.seo_url)
                                         .replace('%id%',program.id)
                                         .replace('%player%',program.player));
            }

            Slider.init(slider);
            if (typeof callback != 'undefined'){
              callback();
            }
            
            $('li.to_animate', slider).animate({width:Slider.item_width}, 500).removeClass('to_animate');
          },
          'json');
  }
}
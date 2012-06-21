// -- Slider
var Slider;
Slider = {
  item_width: 150,
  item_height: 200,
  item_sample_selector: '[data-id="%id%"]',
  pager_nb_results: 10,
  //init
  init: function(slider) {
    console.log('Slider.init', slider);
    var self = this;
    var container = $('.slider-container', slider);
    var next = $('.next', slider);
    var prev = $('.prev', slider);
    var items = $('ul', container);
    items.css('width', parseInt(this.item_width) * items.children().length);
    console.log('Slider.init', 'width', items.css('width'));

    if (slider.hasClass('initialized')) {
      next.css({'visibility':'visible'});
      console.log('Slider.init', 'already initialized');
      return;
    }

    if (items.children().filter(':not(.selector, '+this.item_sample_selector+')').length <= 5) {
      console.log('Slider.init', 'count', items.children().filter(':not(.selector, '+this.item_sample_selector+')').length, items);
      return;
    }

    next.bind('click', function(){
      //console.log('next', container.css('left'), container.css('width'));
      if (parseInt(items.css('left')) < container.css('width') || items.css('left') == 'auto') {
        items.animate({left: '+=-'+parseInt(container.css('width'))}, 500, function() {
          console.log('pager', parseInt(items.css('left')) + parseInt(container.css('width')), items.css('width'));
          if (parseInt(items.css('left')) + parseInt(container.css('width')) == 0) {
            next.css({'visibility':'hidden'});
            //pager
            if (slider.data('pager-url')) {
              var offset = Slider.pager_nb_results + parseInt(slider.data('pager-offset'));
              var loader = $('<div>').append($('#playlist li'+self.item_sample_selector)
                                        .clone()
                                        .data('id','loader')).html();
              items.append(loader);

              Slider.load(slider, 
                          slider.data('pager-url').replace('session.uid', Session.uid)
                                                  .replace('group.name', 'cine')+'?offset='+offset,
                          function(){},
                          true);
              slider.data('pager-offset', offset);
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
  load: function(slider, url, callback, keep) {
    var self = this;
    API.query('GET', 
              url, 
              {},
              function(programs){
                if (typeof keep == 'undifined') {
                  $('li:not(.selector, '+self.item_sample_selector+')', slider).remove();
                }
                for (key in programs) {
                  var program = programs[key];
                  var popular_channel = program.popular_channel ? '<img alt="'+program.popular_channel.name+' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';
                  var item = $('li'+self.item_sample_selector, slider).clone()
                                                                   .addClass('to_animate')
                                                                   .addClass(program.deporte?'deporte':'');
                  if (Session.datas.email &&
                      $.inArray(program.id, Session.datas.notifications.programs.new)) {
                    $(li).prepend(UI.badge_notification.replace('%count%', 1));
                  }
                                                                   
                  var title = program.format != 'Film' ? program.title : '';
                  var pere  = program.episodeof ? program.episodeof : program;
                  var li    = $('<div>').append(item).html()
                                  .replace('%seo_add_title%',pere.title + ', ' + program.format + ' - ' + program.year)
                                  .replace('%seo_play_title%',program.title)
                                  .replace('%seo_play_title%',program.title)
                                  .replace('%title%',title)
                                  .replace('%img%',program.picture)
                                  .replace('%url%',program.seo_url)
                                  .replace('%url%',program.seo_url)
                                  .replace('%id%',program.id)
                                  .replace('%player%', typeof program.player != 'undefined' ? program.player : '')
                                  .replace('%popular_channel%',popular_channel)

                  $(li).appendTo($('ul', slider));
                  //console.log('Slider.load', 'added', $(li), program);
                }
                
                Slider.init(slider);
                if (typeof callback != 'undefined'){
                  callback();
                }
                
                $('li.to_animate', slider).animate({width:Slider.item_width}, 500).removeClass('to_animate');
              });
  }
}
// -- Slider
var Slider;
Slider = {
  item_width: 150,
  item_height: 200,
  pager_nb_results: 10,
  sample: '',
  //init
  init: function(slider) {
    //console.log('Slider.init', slider);
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

    if (items.children().filter(':not(.selector, :first)').length <= 5) {
      console.log('Slider.init', 'count', items.children().filter(':not(.selector, :last)').length, items);
      return;
    }

    next.bind('click', function(){
      console.log('next', container.css('left'), container.css('width'));
      if (parseInt(container.css('left')) < container.css('width') || container.css('left') == 'auto') {
        items.animate({left: '+=-'+parseInt(container.css('width'))}, 500, function() {
          console.log('pager', parseInt(items.css('left')) + parseInt(container.css('width')), items.css('width'));
          if (parseInt(items.css('left')) + parseInt(container.css('width')) == 0) {
            next.css({'visibility':'hidden'});
            //pager
            if (slider.data('pager-url')) {
              var offset = self.pager_nb_results + parseInt(slider.data('pager-offset'));
              slider.data('pager-offset', offset);
              var loader = $(this.sample).addClass('loader');
              UI.appendLoader(loader);
              items.append(loader);
              self.load(slider, 
                        slider.data('pager-url').replace('session.uid', Session.uid)
                                                 .replace('group.name', Session.access) + '?offset=' + offset,
                        function(){
                          items.find('.loader').remove();
                        },
                        true);
            }
          }
          if (prev.css('visibility') == 'hidden') {
            prev.css({'visibility':'visible'});
          }
        });
      }
    }).css({'visibility':'visible'});

    $('.prev', slider).bind('click', function(){
      console.log('prev', container.css('left'), container.css('width'));
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
    if (!this.sample) {
      this.sample = $('<div>').append($('#playlist li:first')).html();
    }
    API.query('GET', 
              url, 
              {},
              function(programs){
                if (typeof keep == 'undefined') {
                  $('li:not(.selector, :first)', slider).remove();
                }
                self.insertProgram(slider, programs);
                self.init(slider);
                if (typeof callback != 'undefined'){
                  callback();
                }
                $('li.to_animate', slider).animate({width:Slider.item_width}, 500).removeClass('to_animate');
              });
  },
  insertProgram: function(slider, programs){
    for (key in programs) {
      var program = programs[key];
      var popular_channel = program.popular_channel ? '<img alt="'+program.popular_channel.name+' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';                        
      var title = program.format != 'Film' ? program.title : '';
      var pere  = program.episodeof ? program.episodeof : program;
      var li    = $(this.sample.replace('%seo_add_title%', pere.title + ', ' + program.format + ' - ' + program.year)
                               .replace('%seo_play_title%', program.title)
                               .replace('%seo_play_title%', program.title)
                               .replace('%title%',title)
                               .replace('http://img/', program.picture)
                               .replace('%url%', program.seo_url)
                               .replace('%url%', program.seo_url)
                               .replace('%id%', program.id)
                               .replace('%player%', typeof program.player != 'undefined' ? program.player : '')
                               .replace('%popular_channel%', popular_channel));
      //console.log('Slider.load', 'added', li, this.sample);
      if (Session.datas.notifications &&
          $.inArray(''+pere.id, Session.datas.notifications.programs.new) != -1) {
        li.prepend(UI.badge_notification.replace('%count%', 'nouvelle vidéo'));
      }
      if (program.deporte) {
        li.addClass('deporte');
      }
      if (program.friend_uids) {
        this.addFriends(li, program.friend_uids);
      }
      li.addClass('to_animate').show();
      li.appendTo($('ul', slider));
      //console.log('Slider.load', 'added', li, program);
    }
  },
  addFriends: function(li, friend_uids){
    console.log('Slider.addFriends', friend_uids, Session.datas.friends);
    var div = $('<div class="friends"></div>');
    var friend_uids = friend_uids.split(',');
    for (key in friend_uids) {
      if (typeof Session.datas.friends[friend_uids[key]]) {
        var friend = Session.datas.friends[friend_uids[key]];
        div.append('<a rel="tooltip" title="'+friend.name+'" href="#"><img src="'+friend.pic_square+'" alt="'+friend.name+'" /></a>'); 
      }
    }

    div.prependTo(li);
  }
}
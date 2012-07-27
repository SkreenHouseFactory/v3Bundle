// -- Slider
var Slider;
Slider = {
  item_width: 150,
  item_height: 200,
  item_margin: 7,
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
    //console.log('Slider.init', 'width', items.css('width'));

    if (slider.hasClass('initialized')) {
      next.css({'visibility':'visible'});
      console.log('Slider.init', 'already initialized');
      return;
    }

    if (items.children().filter(':not(.selector, :first)').length <= 5) {
      console.log('Slider.init', 'not initialized', 'count:' + items.children().filter(':not(.selector, :last)').length, items);
      return;
    }

    slider.addClass('navigate');

    next.bind('click', function(){
      console.log('next', container.css('left'), container.css('width'));
      if (parseInt(container.css('left')) < container.css('width') || container.css('left') == 'auto') {
        items.animate({left: '+=-'+parseInt(container.css('width'))}, 500, function() {
          //console.log('pager', parseInt(items.css('left')),  parseInt(container.css('width')), items.css('width'), slider.data('pager-offset'));
          console.log('pager', $('li:not(.selector)', items).length * (self.item_width+self.item_margin*2) - parseInt(container.css('width')),  parseInt(items.css('left')), slider.data('pager-offset'));
          if ($('li:not(.selector)', items).length * (self.item_width+self.item_margin*2) - parseInt(container.css('width')) < -parseInt(items.css('left'))) {
            next.css({'visibility':'hidden'});
            //pager
            if (slider.data('pager-url')) {
              var offset = self.pager_nb_results + parseInt(slider.data('pager-offset'));
              slider.data('pager-offset', offset);
              //console.log('pager-offset', 'set', offset, slider, slider.data('pager-offset'));
              self.addLoader(slider);
              self.load(slider, 
                        slider.data('pager-url').replace('session.uid', Session.uid)
                                                .replace('group.name', Session.access) + '?offset=' + offset,
                        function(nb_programs){
                          self.removeLoader(slider);
                          if (nb_programs < 3) {
                            next.css('visibility','hidden');
                          }
                          if (nb_programs < self.pager_nb_results) {
                            slider.addClass('loaded'); //le slider ne pagine plus
                          }
                        },
                        true);
            }
          }
          if (!slider.hasClass('back')) {
            slider.addClass('back');
          }
        });
      }
    }).css({'visibility':'visible'});

    prev.bind('click', function(){
      console.log('prev', parseInt(container.css('left')), parseInt(container.css('width')));
      if (-parseInt(items.css('left')) < parseInt(items.css('width'))) {
        items.animate({left: '+=' + parseInt(container.css('width'))}, 500, function() {
          console.log('pager', parseInt(items.css('left')), parseInt(items.css('width')));
          console.log('pager =>', $('li:not(.selector)', items).length * (self.item_width+self.item_margin*2) - parseInt(container.css('width')),  parseInt(items.css('left')), slider.data('pager-offset'));
          if (parseInt(items.css('left')) >= -1) {
            slider.removeClass('back');
          }
          if (next.css('visibility') == 'hidden') {
            next.css({'visibility':'visible'});
          }
        });
      }
    });

    slider.addClass('initialized')
  },
  remove: function(slider) {
    //console.log('Slider.remove', slider);
    $('.next', slider).css({'visibility':'hidden'});
    $('.next, .prev', slider).unbind('click');
    $('ul', slider).css('left', '0px');
    slider.data('pager-offset', 0);
    slider.removeClass('initialized navigate back loaded empty');
  },
  addLoader: function(slider) {
    var loader = $(this.sample).addClass('loader').empty().css('width', this.item_width + 'px').show();
    loader.append('Chargement ...')
    UI.appendLoader(loader);
    console.log('Sliser.addLoader', loader);
    $('ul', slider).append(loader);
  },
  removeLoader: function(slider) {
    $('.loader', slider).remove();
  },
  load: function(slider, url, callback, keep, args) {
    var self = this;
    if (!this.sample) {
      this.sample = $('<div>').append($('#playlist li:first').clone()).html();
    }
    var args = typeof args != 'undefined' ? args : {};
    API.query('GET',
              url, 
              args,
              function(programs){
                console.log('Slider.load', programs.length, programs);
                
                if (typeof keep == 'undefined' && keep == null) {
                  $('li:not(.selector, :first)', slider).remove();
                }
                if (programs.length > 0 || typeof programs[0] != 'undefined') {
                  self.insertProgram(slider, programs);
                  self.init(slider);
                } else if ($('li', slider).length == 0) {
                  slider.addClass('empty');
                }
                if (typeof callback != 'undefined'){
                  callback(programs.length);
                }
                $('li.to_animate', slider).animate({width:Slider.item_width}, 500).removeClass('to_animate');
              });
  },
  insertProgram: function(slider, programs){
    console.log('Slider.insertProgram', slider, programs);
    for (key in programs) {
      var program = programs[key];
      var popular_channel = program.popular_channel ? '<img alt="'+program.popular_channel.name+' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';                        
      var title = program.format != 'Film' ? program.title : '';
      var pere  = program.episodeof ? program.episodeof : program;
      var seo_url = program.seo_url + (slider.attr('id') == 'playlist' ? program.seo_url + '?keepPlaylist' : '');
      if (program.has_vod == 4) { //cine
        var seo_play_title = 'Voir au cinéma';
      } else if (program.has_vod == 3) { //dvd
        var seo_play_title = 'Voir en dvd';
      } else if (program.has_vod == 5) { //tv
        var seo_play_title = 'Voir à la télé';
      } else if (program.has_vod == 6) { //commande replay
        var seo_play_title = 'Bientôt en replay';
      } else if (program.has_vod == 7 || program.has_vod == 8) {
        var seo_play_title = 'Voir en replay';
      } else {
        var seo_play_title = 'Voir en streaming';
      }
      var li    = $(this.sample.replace('%seo_add_title%', pere.title + ', ' + program.format + ' - ' + program.year)
                               .replace('%seo_play_title%', seo_play_title)
                               .replace('%seo_play_title%', seo_play_title)
                               .replace('%title%',title)
                               .replace('%url%', seo_url)
                               .replace('%url%', seo_url)
                               .replace('%id%', program.id)
                               .replace('%popular_channel%', popular_channel));
      li.css('background-image', 'url(' + program.picture + ')');
      $('.actions', li).data('id', program.id);
      
      //console.log('Slider.load', 'added', li, this.sample);
      if (Session.datas.notifications &&
          $.inArray(''+pere.id, Session.datas.notifications.programs.new) != -1) {
        li.prepend(UI.badge_notification.replace('%count%', 'nouveau'));
      }
      if (program.deporte) {
        li.addClass('deporte');
      }
      if (program.friend_uids) {
        UI.addFriends(li, program.friend_uids.split(','));
      }
      this.addProgramBestOffer(li, program);
      li.addClass('to_animate').show();
      li.appendTo($('ul', slider));
      
      //console.log('Slider.load', 'added', li, program);
    }
    $('a[rel="tooltip"]', slider).tooltip();
  },
  addProgramBestOffer: function(li, program) {
    var o = program.best_offer;
    if (typeof o != 'undefined') {
      var btn = $('.actions .play', li);
      btn.html(o.dispo);
      if (o.player) {
        console.log('Slider.addBestOffer', 'add player', o.player);
        btn.attr('href', btn.attr('href') + '&action=louer');
        //btn.attr('data-player', o.player);
      } else if (o.url) {
        console.log('Slider.addBestOffer', 'add url', o.url);
        //si context = v3
        if (API.context == 'v3') {
          var url = unescape(o.url.match(/\/redirection\/.+\?/g)[0].replace('/redirection/','').replace('?',''));
          btn.attr('data-redirect', 1).attr('href', url);
        } else {
          btn.attr('data-redirect', 1).attr('href', o.url + '&access=' + Session.access);
        }
      } else {
        btn.attr('href', btn.attr('href') + '&action=louer');
      }
    }
  }
}
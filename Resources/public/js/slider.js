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
      if (parseInt(container.css('left')) < parseInt(container.css('width')) || container.css('left') == 'auto') {
        items.animate({'left': '+=-'+parseInt(container.css('width'))}, 500, function() {
          //console.log('pager', parseInt(items.css('left')),  parseInt(container.css('width')), items.css('width'), slider.data('pager-offset'));
          console.log('pager', $('li:not(.selector)', items).length * (self.item_width+self.item_margin*2) - parseInt(container.css('width')),  parseInt(items.css('left')), slider.data('pager-offset'));
          if ($('li:not(.selector)', items).length * (self.item_width+self.item_margin*2) - parseInt(container.css('width')) < -parseInt(items.css('left'))) {
            next.css({'visibility':'hidden'});
            //pager
            console.log('Slider.init', 'pager-url', slider.data('pager-url'));
            if (slider.data('pager-url')) {
              var offset = self.pager_nb_results + parseInt(slider.data('pager-offset'));
              slider.data('pager-offset', offset);
              //console.log('pager-offset', 'set', offset, slider, slider.data('pager-offset'));
              self.addLoader(slider);
              self.load(slider, 
                        slider.data('pager-url').replace('session.uid', Skhf.session.uid)
                                                .replace('group.name', Skhf.session.access) + '?with_best_offer=1&offset=' + offset,
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
        items.animate({'left': '+=' + parseInt(container.css('width'))}, 500, function() {
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
    console.log('Slider.remove', slider);
    $('.next', slider).css({'visibility':'hidden'});
    $('.next, .prev', slider).unbind('click');
    $('ul', slider).css('left', '0px');
    slider.data('pager-offset', 0);
    slider.data('nb-programs', 0);
    slider.removeClass('initialized navigate back loaded empty');// social');
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
    //prevent multiple loadings
    if (UI.playlist.hasClass('loading')) {
      console.warn('Slider.load', 'already loading');
      return;
    }
    slider.addClass('loading');

    var self = this;
    if (!this.sample) {
      this.sample = $('<div>').append($('#playlist li:first').clone()).html();
    }

    if (slider.data('pager-offset') == 0) {
      $('li:not(.selector)', slider).remove();
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
                  self.insertPrograms(slider, programs);
                  self.init(slider);
                  slider.data('nb-programs', programs.length);
                } else if ($('li', slider).length == 0) {
                  slider.addClass('empty');
                }
                if (typeof callback != 'undefined'){
                  callback(slider);
                }
                $('li.to_animate', slider).animate({'width':Slider.item_width}, 500).removeClass('to_animate');
                slider.removeClass('loading');
              });
  },
  insertPrograms: function(slider, programs){
    console.log('Slider.insertPrograms', slider, programs, Skhf.session.datas.notifications.programs['new']);
    for (key in programs) {
      var program = programs[key];
      var popular_channel = program.popular_channel ? '<img alt="' + program.popular_channel.name + ' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';                        
      var pere  = program.episodeof ? program.episodeof : program;
      var seo_url = API.config.site_url + program.seo_url + (slider.attr('id') == 'playlist' ? '?keepPlaylist' : '');
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
                               .replace('%seo_play_title%', seo_play_title).replace('%seo_play_title%', seo_play_title)
                               .replace('%title%', program.title)
                               .replace('%url%', seo_url).replace('%url%', seo_url)
                               .replace('%id%', pere.id).replace('%id%', pere.id)
                               .replace('%onglet%', program.onglet.toLowerCase())
                               .replace('%popular_channel%', popular_channel));
      li.css('background-image', 'url(' + program.picture + ')');
      $('.actions', li).data('id', program.id);
      
      //console.log('Slider.load', 'added', li, this.sample);
      if (Skhf.session.datas.notifications &&
          $.inArray('' + pere.id, Skhf.session.datas.notifications.programs['new']) != -1) { //'' + pere.id
        li.prepend(UI.badge_notification.replace('%count%', 'nouveau'));
      }
      if (program.deporte) {
        li.addClass('deporte');
        $('.title', li).each(function(){
          $(this).prepend('<i class="icon-th icon-white"></i> ');
        });
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
    UI.loadUserPrograms(Skhf.session.datas.queue, slider);
  },
  addProgramBestOffer: function(li, program) {
    var o = program.best_offer;
    if (typeof o != 'undefined') {
      var btn = $('.actions .play', li);
      btn.html(o.dispo);
      if (o.player) {
        console.log('Slider.addBestOffer', 'add player', o.player);
        btn.attr('href', btn.attr('href') + '?onglet=' + Skhf.session.access);
        //btn.attr('data-player', o.player);
      } else if (o.url) {
        console.log('Slider.addBestOffer', 'add url', o.url);
        //si context = v3
        if (API.context == 'v3') {
          btn.attr('data-redirect', 1).attr('href', o.url);
        } else {
          var host = 'http://' + document.location.host + (API.config.env == 'dev' ? '/app_dev.php' : '/app.php');
          var url =  host + '/redirection/' + escape(o.url) + '?access=' + Skhf.session.access;
          btn.attr('data-redirect', 1).attr('href', url);
        }
      } else {
        btn.attr('href', btn.attr('href') + '?access=' + Skhf.session.access);
      }
    }
  }
}
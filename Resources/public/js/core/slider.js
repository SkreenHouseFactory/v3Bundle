// -- BaseSlider
var BaseSlider = Class.extend({
  elmt: null,
  sample: null,
  params: {img_width: 150,
           img_height: 200,
           item_margin: 7,
           pager_nb_results: 10,
           type: 'scroll'},
  //init
  init: function(params, callback) {
    console.log('Slider.init', params, callback);
    this.elmt = this.getTemplate(params);
    this.params = $.extend(this.params, params);
    if (this.params.type == 'scroll') {
      this.elmt.append('<a class="next badge badge-inverse"><i class="icon-chevron-right icon-white"></i></a>');
      this.elmt.append('<a class="prev badge badge-inverse"><i class="icon-chevron-left icon-white"></i></a>');
    }

    //li sample
    if (this.sample == null) {
      this.sample = $('<div>').append($('.slider-sample').clone().removeClass('slider-sample')).html();
    }

    //programs
    if (typeof params.programs != 'undefined' && params.programs.length > 0) {
      console.log('Slider.init', 'insertPrograms');
      this.insertPrograms(params.programs, callback);
    } else {
      console.log('Slider.init', 'loadRemotePrograms');
      this.loadRemotePrograms(0, callback);
    }
  },
  render: function() {
    return this.elmt;
  },
  ui: function(callback) {
    console.log('Slider.ui', callback);
    var self = this;

    var container = $('.slider-container', this.elmt);
    var next = $('.next', this.elmt);
    var prev = $('.prev', this.elmt);
    var items = $('ul', container);
    items.css('width', parseInt(this.params.img_width) * items.children().length);
    //console.log('Slider.ui', 'width', items.css('width'));

    if (this.elmt.hasClass('initialized')) {
      next.css({'visibility':'visible'});
      console.log('Slider.ui', 'already initialized');
      return;
    }

    if (items.children().filter(':not(.selector, :first)').length <= 5) {
      console.log('Slider.ui', 'not initialized', 'count:' + items.children().filter(':not(.selector, :last)').length, items);
      return;
    }

    this.elmt.addClass('navigate');

    next.bind('click', function(){
      console.log('next', container.css('left'), container.css('width'));
      if (parseInt(container.css('left')) < parseInt(container.css('width')) || container.css('left') == 'auto') {
        items.animate({'left': '+=-'+parseInt(container.css('width'))}, 500, function() {
          //console.log('pager', parseInt(items.css('left')),  parseInt(container.css('width')), items.css('width'), self.elmt.data('pager-offset'));
          console.log('pager', $('li:not(.selector)', items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(container.css('width')),  parseInt(items.css('left')), self.elmt.data('pager-offset'));
          if ($('li:not(.selector)', items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(container.css('width')) < -parseInt(items.css('left'))) {
            next.css({'visibility':'hidden'});
            //pager
            console.log('Slider.ui', 'pager-url', self.elmt.data('pager-url'));
            if (self.elmt.data('pager-url')) {
              var offset = self.params.pager_nb_results + parseInt(self.elmt.data('pager-offset'));
              self.elmt.data('pager-offset', offset);
              //console.log('pager-offset', 'set', offset, self.elmt, self.elmt.data('pager-offset'));
              self.addLoader();
              self.loadRemotePrograms(self.getUrl(offset),
                                      function(nb_programs){
                                        self.removeLoader();
                                        if (nb_programs < 3) {
                                          next.css('visibility','hidden');
                                        }
                                        if (nb_programs < self.params.pager_nb_results) {
                                          self.elmt.addClass('loaded'); //le slider ne pagine plus
                                        }
                                      },
                                      true);
            }
          }
          if (!self.elmt.hasClass('back')) {
            self.elmt.addClass('back');
          }
        });
      }
    }).css({'visibility':'visible'});

    prev.bind('click', function(){
      console.log('prev', parseInt(container.css('left')), parseInt(container.css('width')));
      if (-parseInt(items.css('left')) < parseInt(items.css('width'))) {
        items.animate({'left': '+=' + parseInt(container.css('width'))}, 500, function() {
          console.log('pager', parseInt(items.css('left')), parseInt(items.css('width')));
          console.log('pager =>', $('li:not(.selector)', items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(container.css('width')),  parseInt(items.css('left')), self.elmt.data('pager-offset'));
          if (parseInt(items.css('left')) >= -1) {
            self.elmt.removeClass('back');
          }
          if (next.css('visibility') == 'hidden') {
            next.css({'visibility':'visible'});
          }
        });
      }
    });

    this.elmt.addClass('initialized')
  },
  remove: function() {
    console.log('Slider.remove', this.elmt);
    $('.next', this.elmt).css({'visibility':'hidden'});
    $('.next, .prev', this.elmt).unbind('click');
    $('ul', this.elmt).css('left', '0px');
    this.elmt.data('pager-offset', 0);
    this.elmt.data('nb-programs', 0);
    this.elmt.removeClass('initialized navigate back loaded empty');// social');
  },
  addLoader: function() {
    var loader = $(this.sample).addClass('loader').empty().css('width', this.params.img_width + 'px').show();
    loader.append('Chargement ...')
    UI.appendLoader(loader);
    console.log('Sliser.addLoader', loader);
    $('ul', this.elmt).append(loader);
  },
  removeLoader: function() {
    $('.loader', this.elmt).remove();
  },
  loadRemotePrograms: function(offset, callback, keep) {
    console.log('Slider.loadRemotePrograms', offset, callback, keep);
    //prevent multiple loadings
    if (this.elmt.hasClass('loading')) {
      console.warn('Slider.loadRemotePrograms', 'already loading');
      return;
    }
    this.elmt.addClass('loading');

    var self = this;

    if (this.elmt.data('pager-offset') == 0) {
      $('li:not(.selector)', this.elmt).remove();
    }

    var url = this.getUrl(0);
    API.query('GET',
              url, 
              this.params,
              function(programs){
                console.log('Slider.loadRemotePrograms', programs.length, programs, 'callback:' + callback);
                if (typeof keep == 'undefined' || keep != true) {
                  $('li:not(.selector, :first)', self.elmt).remove();
                }

                if (programs.length > 0 || typeof programs[0] != 'undefined') {
                  self.insertPrograms(programs);
                  self.ui();
                  self.elmt.data('nb-programs', programs.length);
                } else if ($('li', self.elmt).length == 0) {
                  self.elmt.addClass('empty');
                }
                if (typeof callback != 'undefined'){
                  callback(self.elmt);
                }
                self.elmt.removeClass('loading');
              });
  },
  getUrl: function(offset){
    var url = this.elmt.data('id') ? 'www/slider/pack/' + this.elmt.data('id') + '.json'  : this.elmt.data('url');
    return url .replace('session.uid', Skhf.session.uid)
               .replace('group.name', Skhf.session.access)
               + '?programs_only=1&with_best_offer=1&offset=' + offset;
  },
  insertPrograms: function(programs, callback){
    console.log('Slider.insertPrograms', programs, Skhf.session.datas);
    for (key in programs) {
      var program = programs[key];
      var popular_channel = program.popular_channel ? '<img alt="' + program.popular_channel.name + ' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';                        
      var pere  = program.episodeof ? program.episodeof : program;
      var seo_url = API.config.site_url + program.seo_url + (this.elmt.attr('id') == 'playlist' ? '?keepPlaylist' : '');
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

      //console.log('Slider.insertPrograms', 'added', li, this.sample);
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
      li.appendTo($('ul', this.elmt));
      
      //console.log('Slider.load', 'added', li, program);
    }

    //ui
    $('a[rel="tooltip"]', this.elmt).tooltip();
    $('li.to_animate', self.elmt).animate({'width':this.params.img_width}, 500).removeClass('to_animate');
    //UI.loadUserPrograms(Skhf.session.datas.queue, this.elmt);

    if (typeof callback != 'undefined'){
      callback(this.elmt);
    }

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
          var host = 'http://' + document.location.host;
          var url =  host + '/redirection/' + escape(o.url) + '?access=' + Skhf.session.access;
          btn.attr('data-redirect', 1).attr('href', url);
        }
      } else {
        btn.attr('href', btn.attr('href') + '?access=' + Skhf.session.access);
      }
    }
  },
  getTemplate: function(params) {
    var title = typeof params.title != 'undefined' ? '<h2>' + params.title + '</h2>' : '';
    var html = $('<div class="slider item-row"' + (typeof params.data_id != 'undefined' ? ' data-id="' + params.data_id + '"' : '') + '>' + title + '<div class="slider-container"><ul class="items"></ul></div></div>');

    console.log('Slider.getTemplate', params, html);
    return html;
  }
});
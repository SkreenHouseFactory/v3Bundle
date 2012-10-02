// -- BaseSlider
var BaseSlider = Class.extend({
  elmt: null,
  container: null,
  items: null,
  sample: null,
  loader: null,
  params: {img_width: 150,
           img_height: 200,
           item_margin: 7,
           pager_nb_results: 10,
           type: 'scroll'},
  //init
  init: function(params, callback, elmt) {
    //console.log('BaseSlider.init', params, callback);
    this.params    = $.extend(this.params, params);
    this.elmt      = typeof elmt != 'undefined' ? elmt : this.getTemplate(params);
    this.items     = $('ul', this.elmt);
    this.container = $('.slider-container', this.elmt);
    this.loader    = $('.loader', this.items).css('width', this.params.img_width + 'px');
    UI.appendLoader(this.loader);
    console.log('BaseSlider.init', this.loader, this.items);

    //scroll ?
    if (this.params.scroll != 'no') {
      this.elmt.append('<a class="next badge badge-inverse"><i class="icon-chevron-right icon-white"></i></a>');
      this.elmt.append('<a class="prev badge badge-inverse"><i class="icon-chevron-left icon-white"></i></a>');
    } else {
      this.elmt.addClass('no-scroll');
    }

    //li sample
    if (this.sample == null) {
      this.sample = $('<div>').append($('li.slider-sample').clone().removeClass('slider-sample')).html();
      //console.log('BaseSlider.init', 'this.sample', this.sample);
    }

    //programs
    if (typeof params.programs != 'undefined') {
      //console.log('BaseSlider.init', 'insertPrograms');
      if (params.programs.length > 0) {
        this.insertPrograms(params.programs, callback);
      } else {
        callback(this.elmt);
      }
    } else if (typeof params.url != 'undefined') {
      //console.log('BaseSlider.init', 'insertPrograms');
      this.elmt.data('url', params.url);
      this.loadRemotePrograms(0, callback);
    } else {
      //console.log('BaseSlider.init', 'loadRemotePrograms');
      this.loadRemotePrograms(0, callback);
    }

    return this;
  },
  render: function() {
    return this.elmt;
  },
  ui: function(callback) {
    console.log('BaseSlider.ui', this);
    var self = this;

    var next = $('.next', this.elmt);
    var prev = $('.prev', this.elmt);
    if (!this.elmt.hasClass('couchmode')) {
      //this.items.css('width', (parseInt(this.params.img_width) + parseInt(this.params.item_margin)*2  + 5) * this.items.children().length);
      //console.log('BaseSlider.ui', 'width', this.items.css('width'));
    }

    if (this.elmt.hasClass('initialized')) {
      next.css({'visibility':'visible'});
      console.log('BaseSlider.ui', 'already initialized');
      return;
    }

    if (this.items.children().filter(':not(.static)').length <= 5) {
      console.log('BaseSlider.ui', 'not initialized', 'count:' + this.items.children().filter(':not(.static)').length, this.items);
      return;
    }

    //triggers
    next.bind('click', function(){
      self.next($(this));
    }).css({'visibility':'visible'});

    prev.bind('click', function(){
      self.prev($(this));
    });

    //swipe
    if (UI.touch == true) {
      this.elmt.touchwipe({
           wipeLeft: function() {
            //alert('wipeLeft');
            self.next();
           },
           wipeRight: function() {
            //alert('wipeRight');
            self.prev();
           },
           wipeUp: function() {
            //alert('wipeUp:'+self.elmt.hasClass('slide-v'));
            if (self.elmt.hasClass('slide-v') && typeof UI.slideV != 'undefined') {
              UI.slideV(self.elmt, 'down');
            }
           },
           wipeDown: function() {
            //alert('wipeDown:'+self.elmt.hasClass('slide-v'));
            if (self.elmt.hasClass('slide-v') && typeof UI.slideV != 'undefined') {
              UI.slideV(self.elmt, 'up');
            }
           },
           min_move_x: 20,
           min_move_y: 20,
           //preventDefaultEvents: true
      });
    }

    this.elmt.addClass('navigate initialized')
  },
  next: function(trigger) {
    var self = this;
    console.log('next', this.container.css('left'), this.container.css('width'));
    if (parseInt(this.container.css('left')) < parseInt(this.container.css('width')) || this.container.css('left') == 'auto') {
      self.items.animate({'left': '+=-'+parseInt(this.container.css('width'))}, 500, function() {
        //console.log('pager', parseInt(self.items.css('left')),  parseInt(self.container.css('width')), self.items.css('width'), self.elmt.data('pager-offset'));
        console.log('pager', $('li:not(.static)', self.items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(self.container.css('width')),  parseInt(self.items.css('left')), self.elmt.data('pager-offset'));
        if ($('li:not(.static)', self.items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(self.container.css('width')) < -parseInt(self.items.css('left'))) {
          trigger.css({'visibility':'hidden'});
          //pager
          console.log('BaseSlider.ui', 'url', self.elmt.data('url'));
          if (self.elmt.data('url')) {
            var offset = self.params.pager_nb_results + parseInt(self.elmt.data('pager-offset'));
            self.elmt.data('pager-offset', offset);
            self.items.append(self.loader.addClass('loader-pager'));
            //console.log('pager-offset', 'set', offset, self.elmt, self.elmt.data('pager-offset'));
            self.loadRemotePrograms(self.getUrl(offset),
                                    function(nb_programs){
                                      //self.items.find('.loader-pager').remove();
                                      if (nb_programs < 3) {
                                        trigger.css('visibility','hidden');
                                      } else {
                                        trigger.css('visibility','visible');
                                      }
                                      if (nb_programs < self.params.pager_nb_results) {
                                        self.elmt.addClass('loaded'); //le slider ne pagine plus
                                      }
                                    },
                                    {},
                                    true);
          }
        }
        if (!self.elmt.hasClass('back')) {
          self.elmt.addClass('back');
        }
      });
    }
  },
  prev: function(trigger) {
    var self = this;
    var next = $('.next', this.elmt);
    console.log('prev', parseInt(this.container.css('left')), parseInt(this.container.css('width')));
    if (-parseInt(this.items.css('left')) < parseInt(this.items.css('width'))) {
      self.items.animate({'left': '+=' + parseInt(this.container.css('width'))}, 500, function() {
        console.log('pager', parseInt(self.items.css('left')), parseInt(self.items.css('width')));
        console.log('pager =>', $('li:not(.static)', self.items).length * (self.params.img_width+self.params.item_margin*2) - parseInt(self.container.css('width')),  parseInt(self.items.css('left')), self.elmt.data('pager-offset'));
        if (parseInt(self.items.css('left')) >= -5) {
          self.elmt.removeClass('back');
        }
        if (next.css('visibility') == 'hidden') {
          next.css({'visibility':'visible'});
        }
      });
    }
  },
  remove: function() {
    console.log('BaseSlider.remove', this.elmt);
    $('.next', this.elmt).css({'visibility':'hidden'});
    $('.next, .prev', this.elmt).unbind('click');
    $('ul', this.elmt).css('left', '0px').find('li:not(.static)').remove();
    this.elmt.data('pager-offset', 0);
    this.elmt.data('nb-programs', 0);
    this.elmt.removeClass('initialized navigate back loading loaded empty');// social');
  },
  loadRemotePrograms: function(offset, callback, args, keep) {
    //console.log('BaseSlider.loadRemotePrograms', offset, callback, keep);
    //prevent multiple loadings
    if (this.elmt.hasClass('loading')) {
      console.warn('BaseSlider.loadRemotePrograms', 'already loading');
      return;
    }

    var self = this;

    if (this.elmt.data('pager-offset') == 0) {
      $('li:not(.static)', this.elmt).remove();
    }

    var args = $.extend(args, this.params);
    var url = this.getUrl(typeof offset != 'undefined' ? offset : 0);
    API.query('GET',
              url, 
              args,
              function(programs){
                //console.log('BaseSlider.loadRemotePrograms', programs.length, programs, 'callback:' + callback);
                if (typeof keep == 'undefined' || keep != true) {
                  $('li:not(.static)', self.elmt).remove();
                }

                if (programs.length > 0 || typeof programs[0] != 'undefined') {
                  self.insertPrograms(programs);
                  self.elmt.data('nb-programs', programs.length);
                } else if ($('li', self.elmt).length == 0) {
                  self.elmt.addClass('empty');
                }
                if (typeof callback != 'undefined'){
                  callback(self.elmt);
                }
              });
  },
  getUrl: function(offset){
    var url = this.elmt.data('id') ? 'www/slider/pack/' + this.elmt.data('id') + '.json'  : this.elmt.data('url');
    return url .replace('session.uid', Skhf.session.uid)
               .replace('access.name', Skhf.session.access ? Skhf.session.access : 'undefined')
               + (url.indexOf('?') == -1 ? '?' : '&')
               + 'programs_only=1&with_best_offer=1&offset=' + offset;
  },
  insertPrograms: function(programs, callback){
    //console.log('BaseSlider.insertPrograms', programs, Skhf.session.datas);
    for (k in programs) {
      var program = programs[k];
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
                               .replace('%title%', program.title).replace('%title%', program.title).replace('%title%', program.title)
                               .replace('%seo_url%', seo_url).replace('%seo_url%', seo_url)
                               .replace('%id%', pere.id).replace('%id%', pere.id).replace('%id%', pere.id)
                               .replace('%onglet%', program.onglet.toLowerCase()).replace('%onglet%', program.onglet.toLowerCase())
                               .replace('%popular_channel%', popular_channel));
      li.css('background-image', 'url(' + program.picture + ')');
      $('.actions', li).data('id', program.id);
      li.attr('data-position', k);

      //notif
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
      li.appendTo($('ul.items', this.elmt));
      
      //console.log('BaseSlider.load', 'added', li, program, k);
    }

    //ui
    if (!this.elmt.hasClass('initialized')) {
      this.ui();
    }
    $('a[rel="tooltip"]', this.elmt).tooltip();
    this.elmt.removeClass('loading');
    if (this.elmt.data('animate') == 'width') {
      $('li.to_animate', this.elmt).animate({'width':this.params.img_width}, 500).removeClass('to_animate');
    }
    console.log('BaseSlider.load', 'insertPrograms', 'done');
    UI.loadUserPrograms(Skhf.session.datas.queue, this.elmt);

    if (typeof callback != 'undefined'){
      callback(this.elmt);
    }
  },
  addProgramBestOffer: function(li, program) {
    //console.log('BaseSlider.addBestOffer', li, program);
    var o = program.best_offer;
    if (typeof o != 'undefined' && o.dispo) {
      var btn = $('.actions .play', li);
      btn.html(o.dispo);
      if (o.player) {
        //console.log('BaseSlider.addBestOffer', 'add player', o.player);
        btn.attr('href', btn.attr('href') + '?onglet=' + Skhf.session.access);
        //btn.attr('data-player', o.player);
      } else if (o.url) {
        //console.log('BaseSlider.addBestOffer', 'add url', o.url);
        //si context = v3
        if (API.context == 'v3') {
          btn.attr('data-redirect', 1).attr('href', o.url);
        } else {
          var host = 'http://' + document.location.host;
          var url =  host + '/redirection/' + escape(o.url) + '?access=' + Skhf.session.access;
          btn.attr('data-redirect', 1).attr('href', url);
        }
      } else {
        //console.log('BaseSlider.addBestOffer', 'default', o, li);
        btn.attr('href', btn.attr('href') + '?access=' + Skhf.session.access);
      }

      //channel & diff
      if (typeof o.channel_name != 'undefined') {
        if ($('.channel img', li).length > 0) {
          $('.channel img', li).attr('src', o.channel_img).attr('title', o.channel_name);
        } else {
          $('.channel', li).prepend('<img src="' + o.channel_img + '" alt="' + o.channel_name + '" />');
        }
        if (o.broadcastdate) {
          $('.channel .diff', li).html(o.broadcastdate.replace(' à ', '<br/>')).removeClass('hide');
        } else if (o.deporte) {
          $('.channel .diff', li).html('sur mySkreen').removeClass('hide');
        }
        $('.channel', li).removeClass('hide');
      }
    }
  },
  getTemplate: function(params) {
    var title = typeof params.title != 'undefined' ? '<h2>' + params.title + '</h2>' : '';
    var html = $('<div class="slider tv-container"' + (typeof params.data_id != 'undefined' ? ' data-id="' + params.data_id + '"' : '') + '>' + title + '<div class="slider-container"><ul class="items" data-current-position="0"><li class="loader static">Chargement ...</li></ul></div></div>');

    console.log('BaseSlider.getTemplate', params, html);
    return html;
  }
});
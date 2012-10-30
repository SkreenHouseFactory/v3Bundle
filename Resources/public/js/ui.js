// -- UI
var UI;
UI = {
  user: '',
  playlist: null,
  badge_notification: '<span class="badge">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  init: function(callback) {
    var self = this;
    this.playlist = new BaseSlider({
                                    programs: []
                                   },
                                   function() {
                                   }, $('#playlist'));
    console.log('UI.init', 'this.playlist', this.playlist);
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  //toggle favorite
  togglePlaylistProgram: function(trigger){
    var value = trigger.parent().data('id');
    var remove = trigger.hasClass('btn-primary') || trigger.hasClass('btn-danger') ? true : false;
    if (Skhf.session.datas.email) {
      API.togglePreference('like', value, trigger, function(value){
        console.log('UI.togglePlaylistProgram', 'callback', value, trigger);
        if (remove && $('.friends', trigger.parent().parent()).length == 0) { //pas pour le slider social
          $('#playlist li[data-id="' + value + '"], #user-programs li[data-id="' + value + '"]').animate({'width':0}, 500, function(){
            $(this).remove();
          });
        }
      });
    } else {
      API.quickLaunchModal('signin', function(){
        Skhf.session.sync();
      });
    }
  },
  //user infos
  loadUser: function() {
    console.log('UI.loadUser', Skhf.session.datas.email, this.user);
    if (this.user) {
      if (this.user == Skhf.session.datas.email) {
        console.warn('UI.loadUser', 'already loaded');
        return;
      } else {
        //TODO : unload user !
      }
    }

    this.user = Skhf.session.datas.email;
    if (Skhf.session.datas.email) {
      $('.user span').html(Skhf.session.datas.email);
      $('.favoris span').html('(' + Skhf.session.datas.queue.length + ')');
      $('.user-on-visibility').css('visibility','visible');
      $('li.selector:not(.empty)').popover('disable').popover('hide');
      $('#top-baseline').hide();
      this.loadUserPrograms();
      this.loadNotifications(Skhf.session.datas.notifications);
    } else {
      $('.user span, .favoris span').empty();
      $('.notifications-count').empty();
      $('.notifications li:not(.empty)').remove();
      $('.notifications li.empty').show();
      $('.user-on-visibility').css('visibility','hidden');
      $('li.selector').popover('enable');
      this.unloadFilters();
      this.playlist.remove();
    }
    $('.user-off, .user-on').toggleClass('hide');
  },
  //toggle btn
  loadUserPrograms: function(ids, elmt) {
    var ids  = typeof ids  != 'undefined' ? ids  : Skhf.session.datas.queue;
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.loadUserPrograms', ids, elmt);
    for (key in ids) {
      //console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)', elmt).html('<i class="icon-ok-sign icon-white"></i> Dans vos favoris')
                                                                             .addClass('btn-primary');
    }
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.unloadUserPrograms', ids, elmt);
    for (key in ids) {
      //console.log('UI.unloadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav.btn-primary, .actions[data-id="' + ids[key] + '"] a.fav.btn-danger', elmt).html('<i class="icon-plus-sign"></i> Suivre / voir + tard').removeClass('btn-primary');
    }
  },
  //notify
  loadNotifications: function(notifications) {
    console.log('UI.loadNotifications', notifications);
    $('#top-bar .notifications-count').addClass('with-badge').append($(this.badge_notification).html(notifications.length));
    if (notifications.length == 0) {
        $('#top-bar .notifications-count .badge-important').removeClass('badge-important');
    } else {
      var list = $('#top-bar .notifications ul div');
      list.find('li.empty').hide();
      list.find('li:not(.empty)').remove();
      var nb_new = 0;
      for (k in notifications){
        if (notifications[k]['new'] == true) {
          nb_new++;
          console.log('new', notifications[k]['new'], nb_new);
        }
        list.append('<li style="clear:both;overflow:hidden"><a data-id="' + notifications[k].id + '" rel="tooltip" title="Supprimer la notification" class="close">&times;</a>' + (notifications[k]['new'] ? '<span class="pull-right badge badge-important">Nouveau</span>' : '') + '<a target="_top" href="' + notifications[k].link + '" class="link"><img src="' + notifications[k].channel_ico + '" class="channel pull-left" /><img src="' + notifications[k].ico + '" class="ico pull-left" /><span class="title">' + notifications[k].title + '</span><span class="subtitle">' + notifications[k].title_episode + '</span><span class="label label-' + (notifications[k].type == 'deprog' ? 'warning' : 'success') + '">' + notifications[k].subtitle + '</a></li><li class="divider"></li>');
      }
      //new
      if (nb_new > 0) {
        console.log('UI.loadNotifications', 'new', nb_new);
        $('#top-bar .notifications-count .badge').html(nb_new).addClass('badge-important');
      }
      $('#top-bar .notifications-count').data('count-new', nb_new);
      $('[rel="tooltip"]', list).tooltip({placement: 'bottom'});
      $('.close', list).click(function(e){
        e.preventDefault();
        Skhf.session.deleteNotification($(this).data('id'));
        
        //dom
        $(this).tooltip('destroy');
        $(this).parent().next().remove();
        $(this).parent().slideUp('slow').remove();
        
        //count
        var current = parseInt($('#top-bar .notifications-count .badge').html()) -1;
        $('#top-bar .notifications-count .badge').html(current);
        if (current == 0) {
          $('#top-bar .notifications li.empty').show();
        }

        return false;
      })
    }
  },
  //update friends
  loadSocialSelector: function(datas) {
    if (datas.programs.length > 0) {
      var program = datas.programs.pop();
      var li = $('li#friends', this.playlist.elmt);
      li.removeClass('empty');
      li.css('background-image', 'url('+program.picture+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity');
      li.find('span.badge').remove();
      if (Skhf.session.datas.friends != null) {
        li.find('.label span').html(Skhf.session.datas.friends.length);
      }
      li.find('a, h6').hide();
      li.popover('disable');
      //this.addFriends(li, datas.friend_uids.split(','));
    }
  },
  //update selector
  loadSelector: function(datas) {
    var self = this;
    console.log('UI.loadSelector', datas, Skhf.session.onglet);

    //if (Skhf.session.onglet) {
    //  $('#top-playlist h2 small:last').html('» ' + $('#top-filters .' + Skhf.session.onglet).html());
    //}

    this.unloadSelector();

    for (key in datas) {
      var group = datas[key];
      //console.log('UI.loadSelector', key, group);
      var li = $('li#' + key, this.playlist.elmt);
      li.removeClass('empty');
      li.css('background-image', 'url('+group.img+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.find('.label span').html(group.nb_programs);
      li.find('span.badge').remove();
      if (group.nb_notifs > 0){
        li.prepend(this.badge_notification.replace('%count%', 'nouveaux')); //group.nb_notifs));
      }
      li.find('a, h6').hide();
      li.popover('disable');

      //if (group.nb_programs > 0 && !$('#top-playlist').hasClass('in')) {
      //  console.log('UI.loadSelector', 'collapse', 'show');
      //  $('#top-playlist').collapse('show');
      //}
    }

    //show selector
    this.unloadPlaylist(Skhf.session.onglet, function() {
      self.playlist.elmt.addClass('loading');
      $('#top-playlist li.selector').animate({'width': self.playlist.params.img_width}, 500, function(){
        self.playlist.elmt.removeClass('loading');
      });
    });

    Skhf.session.initSocial();
    //this.playlist.data('queue-selector', JSON.stringify(datas));
  },
  unloadSelector: function() {
    var lis = $('li.selector', this.playlist.elmt);
    lis.addClass('empty').css('background-image', '');
    lis.find('.label').addClass('opacity').find('span').empty();
    lis.find('span.badge').remove();
    lis.find('a, h6').show();
    $('#top-playlist h2 small').empty();
    lis.popover('enable');
    $('#top-playlist li.selector').show()
  },
  loadPlaylist: function(access, onglet){
    var self = this;
    console.log('UI.loadPlaylist', access, onglet, Skhf.session);

    if (Skhf.session.datas.email) {
      //hide selector
      $('li.selector', this.playlist.elmt).animate({'width':0}, 500, function() {
        $(this).hide();
        self.playlist.elmt.addClass('loading');
      });

      //load playlist
      Skhf.session.access = access;

      if (typeof onglet != 'undefined') { //, with_player: 1, player: API.config.player
        var args = {onglet: onglet, with_best_offer: 1, time: new Date().getTime()};
        $('#top-playlist h2 small:last').html($('#top-filters li.' + access + ' a[data-filter="' + onglet + '"]').html());
      } else {
        var args = {with_best_offer: 1, time: new Date().getTime()};
        $('#top-playlist h2 small:last').empty();
      }

      this.playlist.loadRemotePrograms(0,
                                       function(slider){
                                          var nb_programs = slider.data('nb-programs');
                                          console.log('UI.loadPlaylist', 'callback', Skhf.session.access, 'cookie:' + API.cookie('playlist_collapsed'), 'isHome:' + API.isHome(), slider);
                                        
                                          if (Skhf.session.access) {
                                            var name = $('li#' + Skhf.session.access, slider.elmt).data('name');
                                            if (typeof name != 'undefined') {
                                              $('#top-playlist h2 small:first').html('» ' + name);
                                            }
                                          }
                                          $('li.selector', slider.elmt).hide();
                                          //if ((Skhf.session.access != 'tv' && nb_programs > 0 && !API.cookie('playlist_collapsed')) ||
                                          //    API.isHome() == true) {
                                          //  $('#top-playlist').collapse('show');
                                          //}
                                       },
                                       args);
    }
  },
  unloadPlaylist: function(onglet, callback) {
    var self = this;
    console.log('UI.unloadPlaylist', onglet, Skhf.session.onglet);

    if (typeof onglet != 'undefined' && onglet != Skhf.session.onglet) {
      Skhf.session.initPlaylist('/' + onglet);
    }
    $('#top-playlist h2 small').empty();
    $('li:not(.static)', this.playlist.elmt).animate({'width':0}, 500, function() {
      //$('li.static', self.playlist.elmt).show().animate({'width': self.playlist.item_width}, 500);
      self.playlist.remove();
      if (typeof callback != 'undefined') {
        callback();
      }
    });
  },
  markAsRed: function(id) {
    $('li[data-id="' + id + '"] .badge').remove();
    var remaining = parseInt($('.notifications .badge').html())-1;
    if (remaining == 0) {
      $('.notifications .badge').remove();
    } else {
      $('.notifications .badge').html(parseInt($('.notifications .badge').html())-1);
    }
  },
  loadPlayer: function(trigger) {
    var self = this;
    Player.load(trigger);
  },
  loadRedirect: function(url) {
    console.log('UI.loadRedirect', API.context, url);
    if (API.context == 'v2') {
      API.linkV2(url, true);
    } else {
      Player.redirect(url);
    }
    if ($('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('hide');
    }
    //window.onbeforeunload = API.quickLaunchModal('signin', function() {
    //  alert('leave');
    //  window.onbeforeunload = null;
    //});
  },
  // -- insert loader
  appendLoader: function(elmt, timer) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .bar', elmt).animate({'width': '100%'}, typeof timer != 'undefined' ? timer : 5000);
  },
  // -- remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress').remove();
  },
  // -- load filters
  loadFilters: function(filters, filter_selected) {
    console.log('UI.loadFilters', filters, filter_selected);
    $('#top-nav .subnav ul li').removeClass('active selected');
    $('#top-nav .subnav ul li.' + filters).addClass('active');
    $('#top-filters > ul').show();
    $('#top-filters > ul > li, #top-filters h6').hide();
    $('#top-filters > ul > li.' + filters+':not(.hide)').toggle();
    if (typeof filter_selected != 'undefined' && filter_selected) {
      $('#top-filters > ul > li.' + filters + '.active').removeClass('active');
      $('#top-filters > ul > li.' + filters + '-' + filter_selected).addClass('active');
    } else {
      $('#top-nav .subnav ul li.' + filters).addClass('selected');
      //$('#top-filters > ul > li.' + filters + ':first-child').addClass('active');
    }
    if (!$('#top-playlist').hasClass('in')) {
      API.postMessage(['header', 'remove_playlist']);
    }
  },
  // -- unload filters
  unloadFilters: function() {
    console.log('UI.unloadFilters');
    $('.subnav li.active').removeClass('active');
    $('#top-filters ul li').removeClass('active').hide();
    $('#top-baseline').removeClass('hide');
  },
  // -- add friends
  addFriends: function(li, friend_uids){
    //console.log('BaseSlider.addFriends', friend_uids, li);
    var div = $('<div class="friends"></div>');
    for (key in friend_uids) {
      if (typeof Skhf.session.datas.friends[friend_uids[key]]) {
        if (typeof Skhf.session.datas.friends[friend_uids[key]] != "undefined") {
          var friend = Skhf.session.datas.friends[friend_uids[key]];
          div.append('<a rel="tooltip" title="'+friend.name+' suit ce programme" href="#"><img src="'+friend.pic_square+'" alt="'+friend.name+'" /></a>');
        }
      }
    }
    div.prependTo(li);
  },
  // -- ad manager
  ad: function() {
    var cookie = API.cookie('ad');
    console.warn('UI.ad', 'cookie:' + cookie);
    //unknown : mark as todisplay
    if (cookie == null){
      API.cookie('ad', 'todisplay');
      API.postMessage(['javascript', 'if (!$(\'body\').hasClass(\'has_adulte\') && !$(\'body\').hasClass(\'withoutBeead\')) { $(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : to-display</p>\'); }']);
    //todisplay
    } else if (cookie == 'todisplay'){
      //console.log('UI.ad', 'display and ad cookie');
      var date = new Date();
      date.setTime(date.getTime() + (12 * 3600 * 1000));
      API.cookie('ad', 'hascookie',  date);
      API.postMessage(['javascript', 'if (!$(\'body\').hasClass(\'has_adulte\') && !$(\'body\').hasClass(\'withoutBeead\')) { $(\'body\').append(\'<script type="text/javascript">BeeadAds.init({pid:2751, home:"http://www.myskreen.com/"}).screenLayer();</script>\'); $(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : display</p>\'); }']);


      API.trackEvent('beead', 'displayed', document.location.pathname);
    //hold
    } else {
      API.postMessage(['javascript', 'if (!$(\'body\').hasClass(\'has_adulte\') && !$(\'body\').hasClass(\'withoutBeead\')) { $(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : has-cookie</p>\'); }']);
      API.trackEvent('beead', 'hold-cookie', document.location.pathname);
    }
  },
  // -- typeahead
  typeahead: function(searchbox){
    //console.log('UI.typeahead', searchbox);
    $(searchbox).typeahead({
      items: 5,
      source: function (typeahead, query) {
        if (typeof API.xhr['typeahead'] != 'undefined') {
          API.xhr['typeahead'].abort();
          console.log('UI.typeahead', 'abort previous call');
        }
        API.xhr['typeahead'] = API.query('GET', 
                         'search/autosuggest/' +query + '.json', 
                         {session_uid: Skhf.session.uid, img_width: 30, img_height: 30, advanced: 1, with_unvailable: 1}, 
                         function(data){
                            console.log('UI.typeahead', query, data);
                            //if (data.search) {
                            //  return typeahead.process(data.search.split(';'));
                            //}

                            if (data.search || data.queue || data.channels || data.theaters) {
                              var lis = new Array;
                              var titles = new Array;
                              typeahead.query = typeahead.$element.val()
                              typeahead.$menu.empty()
                        
                              if (!typeahead.query) {
                                return typeahead.shown ? typeahead.hide() : typeahead
                              }

                              for (key in data) {
                                switch (key) {
                                  case 'queue':
                                    var items = data[key][0].programs;
                                    titles[key] = 'Dans vos playlists';
                                  break;
                                  case 'channels':
                                    var items = data[key];
                                    titles[key] = 'Chaînes';
                                  break;
                                  case 'theaters':
                                    var items = data[key];
                                    titles[key] = 'Salles de cinéma';
                                  break;
                                  case 'search':
                                    var items = data[key].split(';');
                                  break;
                                }
                                items = items.slice(0, typeahead.options.items)
                                //console.log('UI.typeahead', 'data', key, items);
                                lis[key] = $(items).map(function (i, item) {
                                  i = $(typeahead.options.item).attr('data-value', JSON.stringify(item))
                                  switch (key) {
                                    case 'queue':
                                      i.addClass('playlist')
                                       .find('a')
                                       .html('<img src="' + item.picture + '" /> ' + typeahead.highlighter(item.title))
                                    break;
                                    case 'theaters':
                                      i.addClass('theater')
                                       .find('a')
                                       .html(typeahead.highlighter(item.name + ' (' + item.ville + ')'))
                                    break;
                                    case 'channels':
                                      i.addClass('channel')
                                       .find('a')
                                       .html('<img src="' + item.icon + '" /> ' + typeahead.highlighter(item.name))
                                    break;
                                    case 'search':
                                      i.addClass('search')
                                       .find('a')
                                       .html(typeahead.highlighter(item))
                                    break;
                                  }
                                  console.log('UI.typeahead', 'add item', key,  i);
                                  return i[0]
                                })
                              }

                              //data.first().addClass('active')
                              var sort = Array('search','queue','channels','theaters');
                              for (key in sort) {
                                if (lis[sort[key]]) {
                                  //console.log('UI.typeahead', key, data[key], typeahead.$menu);
                                  if (typeof titles[sort[key]] != 'undefined') {
                                    typeahead.$menu.append('<li class="nav-header">' + titles[sort[key]] + '</li>')
                                  }
                                  typeahead.$menu.append(lis[sort[key]])
                                }
                              }
                              //$('li:first-child:not(.nav-header)', typeahead.$menu).addClass('active');

                              $('#top-playlist').collapse('show');
                              typeahead.show();
                            } else {
                              return typeahead.shown ? typeahead.hide() : typeahead
                            }
                           });
      },
      onselect: function(obj) {
        console.log('UI.typeahead', 'onselect', obj, typeof obj, 'blur:' + $(searchbox));

        if (typeof obj != 'object') { //typeahead
          API.linkV2('/programmes/' + obj);
        } else if (typeof obj.seo_url != 'undefined') { //advanced
          $(searchbox).attr('value', '')
          API.linkV2(obj.seo_url);
        }
        
        $('#top-playlist').collapse('hide');
      }
    });
  },
  /*
  typeahead_v21: function(searchbox){
    console.log('UI.typeahead bootstrap v2.1', searchbox);
    $(searchbox).typeahead({
      items: 5,
      minLength: 2,
      source: function (query, process) {
        var self = this;
        console.log('UI.typeahead', 'source', query, this);
        if (typeof API.xhr['typeahead'] != 'undefined') {
          API.xhr['typeahead'].abort();
          console.log('UI.typeahead', 'abort previous call');
        }
        API.xhr['typeahead'] = API.query('GET', 
                         'search/autosuggest/' + query + '.json', 
                         {session_uid: Skhf.session.uid, img_width: 30, img_height: 30, advanced: 1, with_unvailable: 1}, 
                         function(data){
                            console.log('UI.typeahead', query, data);
                            //if (data.search) {
                            //  return typeahead.process(data.search.split(';'));
                            //}

                            if (data.search || data.queue || data.channels || data.theaters) {
                              var lis = new Array;
                              var titles = new Array;
                              self.$menu.empty()

                              for (key in data) {
                                switch (key) {
                                  case 'queue':
                                    var items = data[key][0].programs;
                                    titles[key] = 'Dans vos playlists';
                                  break;
                                  case 'channels':
                                    var items = data[key];
                                    titles[key] = 'Chaînes';
                                  break;
                                  case 'theaters':
                                    var items = data[key];
                                    titles[key] = 'Salles de cinéma';
                                  break;
                                  case 'search':
                                    var items = data[key].split(';');
                                  break;
                                }
                                items = items.slice(0, self.options.items)
                                //console.log('UI.typeahead', 'data', key, items);
                                lis[key] = $(items).map(function (i, item) {
                                  i = $(self.options.item).attr('data-value', JSON.stringify(item))
                                  switch (key) {
                                    case 'queue':
                                      i.addClass('playlist')
                                       .find('a')
                                       .html('<img src="' + item.picture + '" /> ' + self.highlighter(item.title))
                                    break;
                                    case 'theaters':
                                      i.addClass('theater')
                                       .find('a')
                                       .html(self.highlighter(item.name + ' (' + item.ville + ')'))
                                    break;
                                    case 'channels':
                                      i.addClass('channel')
                                       .find('a')
                                       .html('<img src="' + item.icon + '" /> ' + self.highlighter(item.name))
                                    break;
                                    case 'search':
                                      i.addClass('search')
                                       .find('a')
                                       .html(self.highlighter(item))
                                    break;
                                  }
                                  console.log('UI.typeahead', 'add item', key,  i);
                                  return i[0]
                                })
                              }

                              //data.first().addClass('active')
                              var sort = Array('search','queue','channels','theaters');
                              for (key in sort) {
                                if (lis[sort[key]]) {
                                  //console.log('UI.typeahead', key, data[key], self.$menu);
                                  if (typeof titles[sort[key]] != 'undefined') {
                                    self.$menu.append('<li class="nav-header">' + titles[sort[key]] + '</li>')
                                  }
                                  self.$menu.append(lis[sort[key]])
                                }
                              }
                              //$('li:first-child:not(.nav-header)', self.$menu).addClass('active');

                              $('#top-playlist').collapse('show');
                              self.show();
                            } else {
                              return self.shown ? self.hide() : self
                            }
                            
                            //self.render(self.$menu);
                            //self.listen();
                              var items = $(self.$menu).map(function (i, item) {
                                i = $(self.options.item).attr('data-value', item)
                                if (i.find('a')) {
                                  i.find('a').html(self.highlighter(item))
                                  return i[0]
                                }
                              })
                        
                              items.first().addClass('active')
                              self.$menu.html(items)
                            
                           });

      },
      select: function(obj) {

        console.log('UI.typeahead', 'onselect', obj, typeof obj, 'blur:' + this.$element);

        if (typeof obj != 'object') { //typeahead
          API.linkV2('/programmes/' + obj);
        } else if (typeof obj.seo_url != 'undefined') { //advanced
          this.$element.attr('value', '')
          API.linkV2(obj.seo_url);
        }

        $('#top-playlist').collapse('hide');
      }
    });
  }
  */
}
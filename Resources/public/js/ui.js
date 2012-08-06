
// -- UI
var UI;
UI = {
  user: '',
  playlist: null,
  badge_notification: '<span class="badge badge-important">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  //toggle favorite
  togglePlaylistProgram: function(trigger){
    var value = trigger.parent().data('id');
    var remove = trigger.hasClass('btn-primary') || trigger.hasClass('btn-danger') ? true : false;
    if (Session.datas.email) {
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
        Session.sync();
      });
    }
  },
  //user infos
  loadUser: function() {
    console.log('UI.loadUser', Session.datas.email, this.user);
    if (this.user) {
      if (this.user == Session.datas.email) {
        console.warn('UI.loadUser', 'already loaded');
        return;
      } else {
        //TODO : unload user !
      }
    }

    this.user = Session.datas.email;
    if (Session.datas.email) {
      $('.user span').html(Session.datas.email);
      $('.favoris span').html('(' + Session.datas.queue.length + ')');
      $('.user-on-visibility').css('visibility','visible');
      $('li.selector:not(.empty)').popover('disable').popover("hide");
      this.loadUserPrograms();
      this.notifyUser(Session.datas.notifications);
    } else {
      $('.user span, .favoris span').empty();
      $('.notifications span').remove();
      $('.user-on-visibility').css('visibility','hidden');
      $('li.selector').popover('enable');
      this.unloadFilters();
    }
    $('.user-off, .user-on').toggle();
  },
  //toggle btn
  loadUserPrograms: function(ids, elmt) {
    var ids  = typeof ids  != 'undefined' ? ids  : Session.datas.queue;
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.loadUserPrograms', ids, elmt);
    for (key in ids) {
      console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)', elmt).html('<i class="icon-ok-sign icon-white"></i> Dans vos favoris')
                                                                            .addClass('btn-primary');
    }
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.unloadUserPrograms', ids, elmt);
    for (key in ids) {
      console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.actions[data-id="' + ids[key] + '"] a.fav.btn-primary, .actions[data-id="' + ids[key] + '"] a.fav.btn-danger', elmt).html('<i class="icon-plus-sign"></i> Suivre / voir + tard')
                                                                      .removeClass('btn-primary');
    }
  },
  //notify
  notifyUser: function(notifications) {
    console.log('UI.notifyUser', notifications);
    for (key in notifications) {
      console.log('UI.notifyUser', 'programs', $('#top-bar .user'), key, notifications[key]['new']);
      if (key == 'programs') {
        if (notifications[key]['new'].length > 0) {
          $('#top-bar .notifications').addClass('with-badge').append($(this.badge_notification).html(notifications[key]['new'].length));
        }
      } else {
        if (notifications[key]['new'] > 0) {
          $('#top-bar .dropdown-menu li a.' + key).addClass('with-badge').append($(this.badge_notification).html(notifications[key]['new']));
        }
      }
    }
  },
  //update friends
  loadSocialSelector: function(datas) {
    if (datas.programs) {
      var program = datas.programs.pop();
      var li = $('li#friends', this.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+program.picture+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity');
      li.find('span.badge').remove();
      li.find('.label span').html(Session.datas.friends.length);
      li.find('a, h6').hide();
      li.popover('disable');
      //this.addFriends(li, datas.friend_uids.split(','));
    }
  },
  //update selector
  loadSelector: function(datas) {
    console.log('UI.loadSelector', datas, Session.onglet);
    this.unloadPlaylist();
    this.unloadSelector();
    $('#top-playlist li.selector').show();
    $('#top-playlist h2 small').empty();
    //if (Session.onglet) {
    //  $('#top-playlist h2 small:last').html('» ' + $('#top-filters .' + Session.onglet).html());
    //}

    for (key in datas) {
      var group = datas[key];
      //console.log('UI.loadSelector', key, group);
      var li = $('li#' + key, this.playlist);
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

      if (group.nb_programs > 0 && !$('#top-playlist').hasClass('in')) {
        console.log('UI.loadSelector', 'collapse', 'show');
        $('#top-playlist').collapse('show');
      }
    }

    Session.initSocial();
    //this.playlist.data('queue-selector', JSON.stringify(datas));
  },
  unloadSelector: function() {
    var lis = $('li.selector', this.playlist);
    lis.addClass('empty').css('background-image', '');
    lis.find('.label').addClass('opacity').find('span').empty();
    lis.find('span.badge').remove();
    lis.find('a, h6').show();
    lis.popover('enable');

  },
  loadPlaylist: function(access, onglet){

    var self = this;
    if (Session.datas.email) {
      Session.access = access;

      var url = this.playlist.data('pager-url').replace('session.uid', Session.uid)
                                               .replace('group.name', Session.access)
                                               .replace('app_dev.php/', '');
      if (typeof onglet != 'undefined') {
        var args = {onglet: onglet, with_best_offer: 1, with_player: 1, player: API.config.player, time: new Date().getTime()};
        $('#top-playlist h2 small:last').html($('#top-filters li.' + access + ' a[data-filter="' + onglet + '"]').html());
      } else {
        var args = {with_best_offer: 1, with_player: 1, player: API.config.player, time: new Date().getTime()};
        $('#top-playlist h2 small:last').empty();
      }

      console.log('UI.loadPlaylist', url, access, Session.onglet);
      Slider.load(this.playlist,
                  url,
                  function(slider){
                    //if (Session.access == 'friends') {
                    //  slider.addClass('social');
                    //}
                    var nb_programs = slider.data('nb-programs');
                    if (Session.access) {
                      var name = $('li#' + Session.access, self.playlist).data('name');
                      if (typeof name != 'undefined') {
                        $('#top-playlist h2 small:first').html('» ' + name);
                      }
                    }
                    $('li.selector', self.playlist).hide();
                    Slider.removeLoader(self.playlist);
                    console.log('UI.loadPlaylist', 'collapse', access, 'nb_programs:' + nb_programs, 'cookie:' + API.cookie('playlist_collapsed'), 'isHome:' + API.isHome());
                    if ((access != 'tv' && nb_programs > 0 && !API.cookie('playlist_collapsed')) ||
                        API.isHome() == true) {
                      $('#top-playlist').collapse('show');
                    }
                  }, null, args);
      //console.log('UI.loadPlaylist', 'animate');
      $('li.selector', this.playlist).animate({'width':0}, 500, function() {
        $(this).hide();
      });
      Slider.addLoader(this.playlist);
    }
  },
  unloadPlaylist: function(onglet) {
    var self = this;
    console.log('UI.unloadPlaylist', onglet, Session.onglet);

    if (typeof onglet != "undefined" && onglet != Session.onglet) {
      Session.initPlaylist('/' + onglet);
    }
    $('#top-playlist h2 small').empty();
    $('li:not(.selector, #item)', this.playlist).animate({'width':0}, 500, function() {
      $(this).hide();
      $('li.selector', this.playlist).show().animate({'width':Slider.item_width}, 500);
      Slider.remove(self.playlist);
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
  appendLoader: function(elmt) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .bar', elmt).animate({'width': '100%'}, 5000);
  },
  // -- remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress').remove();
  },
  // -- load filters
  loadFilters: function(filters, filter_selected) {
    console.log('UI.loadFilters', filters, filter_selected);
    $('#top-nav .subnav ul li').removeClass('active');
    $('#top-nav .subnav ul li.' + filters).addClass('active');
    $('#top-filters > ul').show();
    $('#top-filters > ul > li, #top-filters h6').hide();
    $('#top-filters > ul > li.' + filters+':not(.hide)').toggle();
    if (typeof filter_selected != 'undefined' && filter_selected != '') {
      $('#top-filters > ul > li.' + filters + '.active').removeClass('active');
      $('#top-filters > ul > li.' + filters + '-' + filter_selected).addClass('active');
    } else {
      $('#top-filters > ul > li.' + filters + ':first-child').addClass('active');
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
  },
  // -- add friends
  addFriends: function(li, friend_uids){
    //console.log('Slider.addFriends', friend_uids, li);
    var div = $('<div class="friends"></div>');
    for (key in friend_uids) {
      if (typeof Session.datas.friends[friend_uids[key]]) {
        if (typeof Session.datas.friends[friend_uids[key]] != "undefined") {
          var friend = Session.datas.friends[friend_uids[key]];
          div.append('<a rel="tooltip" title="'+friend.name+' suit ce programme" href="#"><img src="'+friend.pic_square+'" alt="'+friend.name+'" /></a>');
        }
      }
    }
    div.prependTo(li);
  },
  // -- typeahead
  typeahead: function(searchbox){
    console.log('UI.typeahead', searchbox);
    $(searchbox).typeahead({
      items: 5,
      source: function (typeahead, query) {
        if (typeof API.xhr['typeahead'] != 'undefined') {
          API.xhr['typeahead'].abort();
          console.log('UI.typeahead', 'abort previous call');
        }
        API.xhr['typeahead'] = API.query('GET', 
                         'search/autosuggest/' +query + '.json', 
                         {session_uid: Session.uid, img_width: 30, img_height: 30, advanced: 1, with_unvailable: 1}, 
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
  }
}
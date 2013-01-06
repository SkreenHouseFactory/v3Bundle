// -- UI
var UI;
UI = {
  user: '',
  playlist: null,
  sliders: [],
  badge_notification: '<span class="badge">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  init: function(callback) {
    var self = this;
    this.playlist = new BaseSlider({
                                    programs: []
                                   },
                                   function() {},
                                   $('#playlist'));
    console.log('UI.init', 'this.playlist', this.playlist);

    //autoload sliders
    $('.slider[data-autoload="1"]').each(function(){
      self.sliders[this.id] = new BaseSlider({}, function(){}, $(this));
      console.log('UI.init', 'autoload sliders', $(this));
    });
    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  //toggle favorite
  togglePlaylistProgram: function(trigger){
    var value = trigger.parent().data('id');
    var remove = trigger.hasClass('btn-primary') || trigger.hasClass('btn-danger') ? true : false;
    if (Skhf.session.datas.email) {
      API.togglePreference('like', value, function(value){
        console.log('UI.togglePlaylistProgram', 'callback', value, trigger);
        if (remove && $('.friends', trigger.parent().parent()).length == 0) { //pas pour le slider social
          $('#playlist li[data-id="' + value + '"], #user-programs li[data-id="' + value + '"]').animate({'width':0}, 500, function(){
            $(this).remove();
          });
        }
      });
    } else {
      this.auth();
    }
  },
  //auth
  auth: function(callback) {
    API.quickLaunchModal('signin', function() {
      Skhf.session.sync(function(){
        if (typeof callback != 'undefined') {
          callback();
        }
      });
    },{parcours: 'anonyme_favoris'});
  },
  //paywall
  paywall: function(id, callback) {
    console.log('UI.paywall', id);

    API.quickLaunchModal('signin', function() {
      if (typeof callback != 'undefined') {
        callback();
      }
    },{parcours: 'anonyme_favoris', occurrence_id: id});
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
      $('.user-off').addClass('hide');
      $('.user-on').removeClass('hide');
      $('.user span').html(Skhf.session.datas.email);
      if (Skhf.session.datas.fb_uid) {
        $('.share btn-group').html(Skhf.session.datas.email);
        $('.share .share-on').show();
        $('.share .share-off').hide();
        if (Skhf.session.datas.disallow_share) {
          $('.share [data-share="disallow"]').trigger('click');
        }
      } else {
        $('.share .share-on').hide();
        $('.share .share-off').show();
      }
      $('.favoris span').html('(' + Skhf.session.datas.queue.length + ')');
      $('.user-on-visibility').css('visibility','visible');
      $('li.selector:not(.empty)').popover('disable').popover('hide');
      $('#top-baseline').hide();
      this.loadUserPrograms();
      this.loadNotifications(Skhf.session.datas.notifications);
      if ($('#view-program').length) {
        this.loadProgramUsersDatas($('#view-program').data('id'));
      }
    } else {
      
      $('.user-off').removeClass('hide');
      $('.user-on').addClass('hide');
      $('.user span, .favoris span').empty();
      $('.notifications-count').empty();
      $('.notifications li:not(.empty)').remove();
      $('.notifications li.empty').show();
      $('.user-on-visibility').css('visibility','hidden');
      $('li.selector').popover('enable');
      this.unloadFilters();
      this.playlist.remove();
      //if ($('#view-program').length) {
      //  this.unloadProgramUsersDatas();
      //}
    }
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
        list.append('<li class="tv-component" style="clear:both;overflow:hidden"><a data-id="' + notifications[k].id + '" rel="tooltip" title="Supprimer la notification" class="close">&times;</a>' + (notifications[k]['new'] ? '<span class="pull-right badge badge-important">Nouveau</span>' : '') + '<a target="_top" href="' + notifications[k].link + '" class="link"><img src="' + notifications[k].channel_ico + '" class="channel pull-left" /><img src="' + notifications[k].ico + '" class="ico pull-left" /><span class="title">' + notifications[k].title + '</span><span class="subtitle">' + notifications[k].title_episode + '</span><span class="label label-' + (notifications[k].type == 'deprog' ? 'warning' : 'success') + '">' + notifications[k].subtitle + '</a></li><li class="divider"></li>');
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
        var current = parseInt($('#top-bar .notifications-count .badge').html()) - 1;
        $('#top-bar .notifications-count .badge').html(parseInt(current) > 0 ? current : 0);
        if (current == 0) {
          $('#top-bar .notifications li.empty').show();
        }

        return false;
      })
    }
  },
  //load user program's infos
  loadProgramUsersDatas: function(id) {
    var self = this;

    // friends
    var container_friends = $('#program-friends .user-on');
    this.appendLoader(container_friends);
    API.query('GET', 
              'program/' + id + '.json', 
              {
                //with_offers: 1,
                with_notifications: 1,
                with_friends: 1,
                session_uid: Skhf.session.uid
              }, 
              function(datas){
                console.log('UI.loadProgramUsersDatas', 'callback', datas);
                //bought ?
                if (typeof datas.purchased != 'undefined' &&
                    datas.purchased) {
                  for (k in datas.purchased) {
                    console.log('UI.loadProgramUsersDatas', 'purchased', '#offers [data-id="' + k + '"] td:last-child', $('#offers [data-id="' + k + '"] td:last-child'), k, API.formatTimestamp(datas.purchased[k]));
                    $('#offers [data-id="' + k + '"] td:last-child .btn').append('<span class="btn-block badge badge-warning">Loué le ' + API.formatTimestamp(datas.purchased[k]) + '</span>');
                  }
                }
                //friends
                if( typeof datas.friends != 'undefined' && datas.friends)
                {
                  container_friends.removeClass('hide'); //HACK : TODO appel après connexion
                  self.removeLoader(container_friends);
                  if (datas.friends.length > 0) {
                    self.addFriends(container_friends, datas.friends)
                  } else {
                    container_friends.append('<p class="alert">Aucun ami trouvé ! <a href="#same_playlists" class="btn pull-right">Ils ajoutent également à leurs playlists &raquo;</a></p>');
                  }
                }
                //notifs
                if( typeof datas.boutons_notifications != 'undefined' && 
                    datas.boutons_notifications &&
                    datas.boutons_notifications['new'].count > 0 ) {
                  for ( k in datas.boutons_notifications['new']) {
                    var notifs = datas.boutons_notifications['new'][k];
                    if(notifs.length > 0 && k != 'count' ) {
                      $('#trigger-' + k).append('<span class="badge badge-important">' + notifs.length + '</span>');                  
                      for(k in notifs){
                        $('#program-offers [data-id="' + notifs[k] + '"] td:first-child').html('<span class="badge badge-important">1</span>');
                      };
                    }
                  };
                }
    });
  },
  //update friends
  loadSocialSelector: function(datas) {
    if (datas.programs.length > 0) {
      console.log('UI.loadSocialSelector', datas);
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
    //  $('#top-playlist .breadcrumb li:last').html($('#top-filters .' + Skhf.session.onglet).html());
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
      $('#top-playlist li.selector').animate({'width': API.config.slider.width}, 500, function(){
      });
    });

    Skhf.session.initSocial();
    //this.playlist.data('queue-selector', JSON.stringify(datas));
  },
  unloadSelector: function() {
    var self = this;
    var lis = $('li.selector', this.playlist.elmt);
    lis.addClass('empty').css('background-image', '');
    lis.find('.label').addClass('opacity').find('span').empty();
    lis.find('span.badge').remove();
    lis.find('a, h6').show();
    $('#top-playlist .breadcrumb li:not(:first)').empty();
    lis.popover('enable');
    $('#top-playlist li.selector').show()
                                  .animate({'width': API.config.slider.width}, 500, function(){});
    
  },
  loadPlaylist: function(access, onglet){
    var self = this;
    console.log('UI.loadPlaylist', access, onglet, Skhf.session);

    if (Skhf.session.datas.email) {
      //hide selector
      $('li.selector', this.playlist.elmt).animate({'width':0}, 500, function() {
        $(this).hide();
        //self.playlist.elmt.addClass('loading');
      });

      //load playlist
      Skhf.session.access = access;

      if (typeof onglet != 'undefined') { //, with_player: 1, player: API.config.player
        var args = {onglet: onglet, with_best_offer: 1, time: new Date().getTime()};
        $('#top-playlist .breadcrumb li:last').html($('#top-filters li.' + access + ' a[data-filter="' + onglet + '"]').html());
      } else {
        var args = {with_best_offer: 1, time: new Date().getTime()};
        $('#top-playlist .breadcrumb li:last').empty();
      }

      this.playlist.loadRemotePrograms(0,
                                       function(slider){
                                          var nb_programs = slider.data('nb-programs');
                                          console.log('UI.loadPlaylist', 'callback', Skhf.session.access, 'cookie:' + API.cookie('playlist_collapsed'), 'isHome:' + API.isHome(), slider);
                                        
                                          if (Skhf.session.access) {
                                            var name = $('li#' + Skhf.session.access, slider.elmt).data('name');
                                            if (typeof name != 'undefined') {
                                              $('#top-playlist .breadcrumb li:nth-child(2)').html(name);
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

    //if (typeof onglet != 'undefined' && 
    //    onglet != Skhf.session.onglet) {
    //  Skhf.session.initPlaylist('/' + onglet);
    //}
    $('#top-playlist .breadcrumb li:not(:first)').empty();
    $('li:not(.static)', this.playlist.elmt).animate({'width':0}, 500, function() {
      //$('li.static', self.playlist.elmt).show().animate({'width': self.playlist.item_width}, 500);
      self.playlist.remove();
      if (typeof callback != 'undefined') {
        callback();
      }
    });
  },
  markAsRed: function(id) {
    $('.notifications ul li[data-id="' + id + '"] .badge').remove();
    var remaining = parseInt($('.notifications-count .badge-important').html())-1;
    if (remaining > 0) {
      $('.notifications-count .badge-important').html(remaining);
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
  addFriends: function(container, friend_uids){
    var self = this;

    console.log('UI.addFriends', friend_uids, Skhf.session.datas, container);
    if (typeof Skhf.session.datas.friends == 'undefined') {
      console.warn('UI.addFriends', 'no friends in session');
      return;
    }

    var div = $('<div class="friends"></div>');
    for (key in friend_uids) {
      //console.log('UI.addFriends', friend_uids[key], Skhf.session.datas.friends[friend_uids[key]]);
      if (typeof Skhf.session.datas.friends[friend_uids[key]] != 'undefined') {
        var friend = Skhf.session.datas.friends[friend_uids[key]];
        div.append('<a rel="tooltip" title="' + friend.name + ' suit ce programme" href="#"><img src="' + friend.pic_square + '" alt="' + friend.name + '" /></a>');
      }
    }
    $('a[rel="tooltip"]', div).tooltip();
    div.appendTo(container);
  },
  addFriendsPlaylists: function(){
    Skhf.session.loadFriendsPlaylists(function(friends_playlists){
      console.log('UI.addFriendsPlaylists', friends_playlists);
      for (k in friends_playlists) {
        var li = $('li[data-id="' + k + '"]');
        if (li.length > 0) {
          //console.log('UI.addFriendsPlaylists', 'add ' + friends_playlists[k].length + ' friends to program ' + k);
          UI.addFriends(li, friends_playlists[k]);
        }
      }
    });

  },
  // -- ad manager
  cheat: function() {
    API.trackEvent('ga', 'testing', document.location.pathname);
  },
  ad: function() {
    var cookie = API.cookie('ad');
    console.log('UI.ad', 'cookie:' + cookie);
    //unknown : mark as todisplay
    /*
    if (cookie == null || !cookie){
      API.cookie('ad', 'todisplay');
      API.postMessage(['javascript', 'if (!$(\'body\').hasClass(\'has_adulte\') && !$(\'body\').hasClass(\'withoutBeead\')) { $(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : to-display</p>\'); }']);
    //todisplay
    } else if (cookie == 'todisplay'){
      //console.log('UI.ad', 'display and ad cookie');
      var date = new Date();
      date.setTime(date.getTime() + (12 * 3600 * 1000));
      API.cookie('ad', 'hascookie',  date);
      BeeadAds.gateway();
      API.postMessage(['javascript', '$(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : display</p>\');']);


      API.trackEvent('beead', 'displayed', document.location.pathname);
    //hold
    } else {
      API.postMessage(['javascript', '$(\'#footer\').append(\'<p style="color:#EEE;clear:both;">ad : has-cookie</p>\');']);
      API.trackEvent('beead', 'hold-cookie', document.location.pathname);
    }
    */
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
          if (obj.seo_url.match(/^http:\/\//)) {
            top.location = obj.seo_url;
          } else {
            API.linkV2(obj.seo_url);
          }
        }
        
        $('#top-playlist').collapse('hide');
      }
    });
  },
  keynav: function(){
  },
  focus: function(){
  },
  error: function(){
  },
  refreshChannel: function(channel_id){
    
    var args = {
                onglet: $('#onglet button.active').data('onglet'),
                //access: $('#access button.active').data('access'),
                url: null
               };

    var option = $('.trigger-channel-date').find(':selected');
    var show   = option.data('show');
    switch (show) {
      case 'epg':
        $('#channel-epg, #channel-epg-title').show();
        $('#channel-replay, #channel-replay-title').hide();
      break;
      case 'replay':
        $('#channel-epg, #channel-epg-title').hide();
        $('#channel-replay, #channel-replay-title').show();
        console.log($('#channel-replay, #channel-replay-title'));
      break;
      default:
        $('#channel-epg, #channel-epg-title, #channel-replay, #channel-replay-title').show();
      break;
    }

    console.log('view channel', 'reset', args);

    if (!show || show == 'replay') {
      args.date = !show ? 'Replay' : option.val();
      var url = 'recommend/from_channel/' + channel_id + '.json?with_method=epg&' + $.param(args);
      UI.sliders['channel-replay'].reset(url);
    }

    if (!show || show == 'epg') {
      args.date = !show ? 'Epg' : option.val();
      var url = 'recommend/from_channel/' + channel_id + '.json?with_method=epg&' + $.param(args);
      UI.sliders['channel-epg'].reset(url);
    }
  }
}
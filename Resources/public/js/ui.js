// -- UI
var UI;
UI = {
  user: '',
  available_playlists: ['like','cinema'],
  os: null,
  playlist: null,
  callbackModal: null,
  sliders: [],
  max_notifications: 20,
  badge_notification: '<span class="badge">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
	callbackTogglePlaylist: null,
  init: function(callback) {
    var self = this;
    this.playlist = new BaseSlider({ programs: [] }, function() {}, $('#playlist'));
    console.log('UI.init', 'this.playlist', this.playlist);

    //ios
    if (navigator.userAgent.match(/iPhone|iPod|iPad/)) {
      $('html').addClass('ios');
      UI.os = 'ios';
    }
    //autoload sliders
    $('.slider[data-autoload="1"]').each(function(){
      self.sliders[this.id] = new BaseSlider({}, function(){}, $(this));
      //console.log('UI.init', 'autoload sliders', $(this));
    });
    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  //auth
  auth: function(callback, parcours) {
    //fbconnect ne passe pas par le callback !
    if (typeof callback != 'undefined') {
      UI.callbackModal = callback;
    }
    API.quickLaunchModal('signup', function() {
      Skhf.session.sync(function() {
        if (typeof callback != 'undefined') {
          console.log('UI.auth', 'Skhf.session.init callback');
          callback();
        }
      });
    },{parcours: parcours});
  },
  //user infos
  loadUser: function() {

    var update = false;
    if (this.user) {
      if (this.user == Skhf.session.datas.email) {
        var update = true;
        //console.warn('UI.loadUser', 'already loaded');
        //return;
      } else {
        //TODO : unload user !';
      }
    }
    console.log('UI.loadUser', Skhf.session.datas.email, this.user, 'update:', update);

    this.user = Skhf.session.datas.email;
    if (Skhf.session.datas.email) {
      if (!update) {
        //on
        $('.user-off:not(.hide)').addClass('hide');
        $('.user-on.hide').removeClass('hide');
        $('.user-on-visibility').css('visibility','visible');
        $('li.selector:not(.empty)').popover('disable').popover('hide');
				//share on
        if (Skhf.session.datas.disallow_share) {
          $('.share [data-share="disallow"]').trigger('click');
        }
        //datas
        this.loadPlaylistTriggers();
        this.loadNotifications(Skhf.session.datas.notifications);
      }
      //infos
      $('.user-email').html(Skhf.session.datas.email);
      $('.favoris span').html('(' + Skhf.session.datas.queue.length + ')');
      //fb
      if (Skhf.session.datas.fb_uid) {
        $('.share-on.hide').removeClass('hide');
      	$('.share-off:not(.hide)').addClass('hide');
        this.addFriendsPrograms();
      } else {
      $('.share-on:not(.hide)').addClass('hide');
      $('.share-off.hide').removeClass('hide');
      }
      //theaters
      if (Skhf.session.datas.cinema) {
        this.loadTheatersPlaylist();
      }
    } else {
      //off
      $('.user-off.hide').removeClass('hide');
      $('.user-on:not(.hide)').addClass('hide');
      $('.share-on:not(.hide)').addClass('hide');
      $('.share-off').removeClass('hide');
      $('.user-on-visibility').css('visibility','hidden');
      $('.notifications li.empty').show();
      $('li.selector').popover('enable');
      //remove datas
      $('.user-email, .favoris span').empty();
      $('.notifications-count').empty();
      $('.notifications li:not(.empty)').remove();
      this.playlist.remove();

      //theaters
      this.unloadTheatersPlaylist();
    }
  },
  //set popover infos
  installPopover: function(trigger) {
    
    if (trigger.hasClass('fav-cinema')) {
        var content = '<b>Ne ratez plus vos séances&nbsp;!</b>' + 
                      '<br/>En ajoutant ce cinéma à vos playlists vous saurez averti de sa programmation.';
    } else if (trigger.hasClass('fav-epg')) {
        var content = '<b>Faites-vous un programme TV sur mesure&nbsp;!</b>' + 
                      '<br/>En ajoutant cette chaîne à vos playlists elle apparaîtra dans votre programme TV.';
    } else if (trigger.hasClass('fav-channel')) {
        var content = '<b>Ne ratez plus vos chaînes préférées&nbsp;!</b>' + 
                      '<br/>En ajoutant cette chaîne à vos playlists vous saurez averti dès qu\'une nouvelle vidéo sera mise en ligne.';
    } else if (trigger.hasClass('fav-person')) {
        var content = '<b>Ne ratez plus vos acteurs préférés&nbsp;!</b>' + 
                      '<br/>En ajoutant cette personne à vos playlists vous saurez averti dès qu\'un de ses programmes sera disponible.';
    } else if (trigger.hasClass('fav-search')) {
        var content = '<b>Ne ratez plus les programmes qui vous intéressent&nbsp;!</b>' + 
                      '<br/>En ajoutant cette recherche à vos playlists vous saurez averti dès qu\'un programme correspondant sera disponible.';
    } else {
      if (trigger.parents('.actions:first').data('onglet') == 'emissions' || 
          trigger.parents('.actions:first').data('onglet') == 'series') {
        var content = '<b>Ne ratez plus vos programmes&nbsp;!</b>' +
                      '<br/>En ajoutant ce programme à vos playlists vous serez averti dès qu\'un épisode est disponible !';
      } else {
        var content = '<b>Ne ratez plus vos programmes&nbsp;!</b>' + 
                      '<br/>En ajoutant ce programme à vos playlists vous saurez quand il passe à la télé ou au cinéma et s\'il est disponible en Replay ou en VOD.';
      }
    }

    trigger.popover({placement: 'top',
                      title:	function() { return 'Ajout à vos playlists'},
                      content: content,
                      show: 500, 
                      hide: 100});
  },
  //toggle favorite : fav-parameter
	//if actions-remove[data-id="xx"] : element deleted in this.unloadPlaylistTrigger
  togglePlaylist: function(trigger){
    var self = this;
    if (trigger.hasClass('fav-cinema')) {
      var parameter = 'cinema';
      var name = 'ce cinéma';
    } else if (trigger.hasClass('fav-epg')) {
      var parameter = 'epg';
      var name = 'cette chaîne TV';
    } else if (trigger.hasClass('fav-channel')) {
      var parameter = 'channel';
      var name = 'cette chaîne';
    } else if (trigger.hasClass('fav-person')) {
      var parameter = 'person';
      var name = 'cette personne';
    } else if (trigger.hasClass('fav-search')) {
      var parameter = 'search';
      var name = 'cette recherche';
    } else {
      var parameter = 'like';
      var name = 'ce programme';
    }
    if (Skhf.session.datas.email) {
      console.log('UI.togglePlaylist', parameter, value, 'remove:' + remove, trigger);
      trigger.html('Chargement ...').removeClass('btn-danger');
      var value = trigger.data('id') ? trigger.data('id') : trigger.parents('.actions:first').data('id');
      var remove = trigger.hasClass('fav-on') ? true : false;
      var callback = function(value){
        console.log('UI.togglePlaylist', 'callback', value, trigger);
				// remove
        if (remove) {
					if (parameter == 'like' &&
            	$('.friends', trigger.parents('.actions:first')).length == 0) { //pas pour le slider social
	          $('#playlist li[data-id="' + value + '"], #user-programs li[data-id="' + value + '"]').animate({'width':0}, 500, function(){
	            $(this).remove();
	          });
	        }
				}
				if (UI.callbackTogglePlaylist) {
					UI.callbackTogglePlaylist(parameter, value, remove, trigger);
				}
      }
      if (remove) {
        API.removePreference(parameter, value, callback);
      } else {
        API.addPreference(parameter, value, callback);
      }
    } else {

      this.auth(function(){
        console.log('UI.togglePlaylist', 'UI.auth callback', Skhf.session.datas.email);
        $('.modal .modal-body').prepend('<p class="alert alert-success"><b>Vos playlists <i class="icon-question-sign" data-content="Enregistez votre compte et retrouvez vos playlists à tout moment. &lt;br/&gt;mySkreen est gratuit et le restera !" data-placement="right" data-trigger="hover" data-original-title="Replay, VOD et cinéma dans une même playlist"></i></b><br/>Ajoutez ' + name + ' pour être sûr de ne plus le rater !</p>');
        $('.modal .modal-body [data-content]').popover();
        if (Skhf.session.datas.email) {
          self.togglePlaylist(trigger);
        }
      }, 'playlist');
    }
  },
  //toggle btn
  loadPlaylistTriggers: function(parameter, ids, elmt) {

    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.loadPlaylistTriggers', parameter, ids, elmt);
    if (typeof parameter != 'undefined') {
      for (key in ids) {
        //console.log('UI.loadPlaylistTriggers', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav-' + parameter + ':not(.fav-on)');
        var trigger = $('.actions[data-id="' + ids[key] + '"] a.fav-' + parameter + ':not(.fav-on)', elmt);
        trigger.html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists').addClass('fav-on');
      }
      switch(parameter) {
        case 'cinema': //reload
          if ($('#trigger-theaters-playlist').length) { //fiche programme
            //console.log('UI.loadPlaylistTriggers', 'set UI.callbackModal');
            UI.callbackModal = function() { //à la fermeture de la popin
              $('#trigger-theaters-playlist').trigger('click');
            }
          }
        break;
      }

    } else {
      for(k in this.available_playlists) {
        switch (this.available_playlists[k]) {
          case 'like':
            var ids = Skhf.session.datas.queue;
          break;
          case 'cinema':
            var ids = Skhf.session.datas.cinema;
          break;
        }
        for (key in ids) {
          //console.log('UI.loadPlaylistTriggers', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.fav-on)');
          var trigger = $('.actions[data-id="' + ids[key] + '"] a.fav-' + this.available_playlists[k] + ':not(.fav-on)', elmt);
          trigger.html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists').addClass('fav-on');
        }
      }
    }
  },
  unloadPlaylistTriggers: function(parameter, ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    console.log('UI.unloadPlaylistTriggers', parameter, ids, elmt);
    if (typeof parameter != 'undefined') {
      for (key in ids) {
        console.log('UI.unloadPlaylistTriggers', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav-' + parameter + '.fav-on');
        var trigger = $('.actions[data-id="' + ids[key] + '"] a.fav-' + parameter + '.fav-on', elmt);
        trigger.html('<i class="icon-plus-sign icon-white"></i> Suivre').removeClass('fav-on btn-danger');

        switch(parameter) {
          case 'like':
            $('#top-playlist li[data-id="' + ids[key] + '"]', elmt).remove();
          break;
          case 'cinema': //reload
            if ($('#trigger-theaters-playlist').length) { //fiche programme
              console.log('UI.unloadPlaylistTriggers', 'set UI.callbackModal');
              UI.callbackModal = function() { //à la fermeture de la popin
                $('#trigger-theaters-playlist').trigger('click');
              }
            }
            $('.actions[data-id="' + ids[key] + '"] .fav-' + parameter, elmt).parents('.actions-remove:first').remove();
          break;
          default:
            $('.actions[data-id="' + ids[key] + '"] .fav-' + parameter, elmt).parents('.actions-remove:first').remove();
          break;
        }
      }
      
    } else {
      for(k in this.available_playlists) {
        switch (parameter) {
          case 'like':
            var ids = Skhf.session.datas.queue;
          break;
          case 'cinema':
            var ids = Skhf.session.datas.cinema;
          break;
        }
        for (key in ids) {
          //console.log('UI.unloadPlaylistTriggers', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav-' + this.available_playlists[k] + '.fav-on');
          var trigger = $('.actions[data-id="' + ids[key] + '"] a.fav-' + this.available_playlists[k] + '.fav-on', elmt);
          trigger.html('<i class="icon-plus-sign icon-white"></i> Suivre').removeClass('fav-on btn-danger');
        }
      }
    }
  },
  //notify
  loadNotifications: function(notifications) {
    //console.log('UI.loadNotifications', notifications);
    var nb = notifications.length == this.max_notifications ? notifications.length + '+' : notifications.length;
    $('.navbar .notifications-count').addClass('with-badge').append($(this.badge_notification).html(nb));
    if (notifications.length == 0) {
        $('.navbar .notifications-count .badge-important').removeClass('badge-important');
    } else {
      var list = $('.navbar .notifications ul div');
      list.find('li.empty').hide();
      list.find('li:not(.empty)').remove();
      var nb_new = 0;
      for (k in notifications){
        if (notifications[k]['new'] == true) {
          nb_new++;
          //console.log('new', notifications[k]['new'], nb_new);
        }
        list.append('<li class="tv-component"><a data-id="' + notifications[k].id + '" class="remove">' + 
										'<i class="icon-trash"></i></a>' + (notifications[k]['new'] ? '<span class="pull-right badge badge-important">Nouveau</span>' : '') + 
										'<a ' + (notifications[k].player || notifications[k].type == 'broadcast' ? 'data-play="' + notifications[k].player + '" data-ajax="' + notifications[k].program.seo_url + '" rel="#content"' : 'data-redirect="' + notifications[k].link + '"') + ' class="link">' + 
										'<img src="' + notifications[k].channel_ico + '" alt="' + notifications[k].channel_name + '" class="channel pull-left" />' +
										'<img src="' + notifications[k].ico + '" alt="notification" class="ico pull-left" />' +
										'<span class="title">' + notifications[k].title + '</span>' +
										'<span class="subtitle">' + notifications[k].title_episode + '</span>' +
										'<span class="label label-' + (notifications[k].type == 'deprog' ? 'warning' : 'success') + '">' + notifications[k].subtitle + '</span></a>' +
										'</li>' +
										'<li class="divider"></li>');
      }
			//TOFIX : should be working in script/core/ui.js
			$('li a[data-ajax]', list).bind('click', function(){
				console.log('UI.loadNotifications', 'bind click [data-ajax]', $(this));
				$($(this).attr('rel')).load(API.config.v3_url + $(this).data('ajax'));
				return false;
			});
			$('li a[data-play]', list).bind('click', function(){
				console.log('UI.loadNotifications', 'bind click [data-play]', $(this));
				API.play($(this).data('play'), $(this).data('play-args'));
				return false;
			});
			$('[data-redirect]').bind('click', function(){
		    console.log('script', 'player redirect', $(this));
		    UI.loadRedirect($(this).data('redirect'));
				return false;
			});

      //new
      if (nb_new > 0) {
        var nb = nb_new == this.max_notifications ? nb_new + '+' : nb_new;
        //console.log('UI.loadNotifications', 'new', nb);
        $('.navbar .notifications-count .badge').addClass('badge-important').html(nb);
      }
      $('.navbar .notifications-count').data('count-new', nb_new);
      $('[rel="tooltip"]', list).tooltip({placement: 'bottom'});
      $('.remove', list).click(function(e){
        e.preventDefault();
        Skhf.session.deleteNotification($(this).data('id'));
        
        //dom
        $(this).parent().next().remove();
        $(this).parent().slideUp('slow').remove();
        
        //count
        var current = parseInt($('.navbar .notifications-count .badge').html()) - 1;
        $('.navbar .notifications-count .badge').html(parseInt(current) > 0 ? current : 0);
        if (current == 0) {
          $('.navbar .notifications li.empty').show();
        }

        return false;
      })
    }
  },
  //update friends
  loadSocialSelector: function() {
    var self = this;
    
    if (Skhf.session.datas.fb_uid) {
      this.appendLoader($('li#friends'));
      Skhf.session.loadSocialSelector(function(datas){
        console.log('UI.loadSocialSelector', 'Session.loadSocialSelector callback', datas);
        self.removeLoader($('li#friends'));
        if (typeof datas.error == 'undefined' ||
            datas.programs.length > 0) { //Warning : Error sent by API even if results ?!
          if (datas.programs.length > 0) {
            var program = datas.programs.pop();
            var li = $('li#friends', this.playlist.elmt);
            li.removeClass('empty');
            li.css('background-image', 'url('+program.picture+')').css('background-repeat', 'no-repeat');
            li.find('.label').removeClass('opacity');
            li.find('span.badge, .alert').remove();
            li.find('a, h6').hide();
            li.popover('disable');
            Skhf.session.getSocialDatas(function(friends) {
              li.find('.label span').html(friends.length);
            });
          }
        } else {
          $('li#friends').append('<p class="alert">Oups, erreur !</p>');
        }
      });
    }
  },
	//playlist theaters
  loadTheatersPlaylist: function(){
    if (Skhf.session.datas.cinema && 
        $('#cinema.slider').length) {
      console.log('UI.loadTheatersPlaylist', Skhf.session.datas.cinema);
      $('.theaters-off:not(.hide)').addClass('hide');
      $('.theaters-on.hide').removeClass('hide');

      API.query('GET', 'channel.json', {
          type: 'cinema',
          ids: Skhf.session.datas.cinema
        },
        function(datas){
          console.log('UI.loadTheatersPlaylist', 'callback', datas, this.sliders);
          $('#theaters-names').empty();
          for (k in datas) {
            $('#theaters-names').append('<a href="#theaters-playlist" data-id="' + datas[k].id + '" class="label label-info">' + datas[k].name + '</a>');
          }
          UI.sliders['cinema'] = new BaseSlider({
						'url': 'schedule/cine.json?programs_only=1&theater_ids=' + Skhf.session.datas.cinema }, 
						function(){}, 
						$('#cinema.slider')
					);
      });
    }
  },
  unloadTheatersPlaylist: function(){
    $('.theaters-on:not(.hide)').addClass('hide');
    $('.theaters-off.hide').removeClass('hide');
	},
  //update selector
  loadSelector: function(datas) {
    var self = this;
    console.log('UI.loadSelector', datas, Skhf.session.onglet);

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
        li.prepend($(this.badge_notification.replace('%count%', 'nouveaux')).addClass('badge-important')); //group.nb_notifs));
      }
      li.find('a, h6').hide();
      li.popover('disable');
    }

    //show selector
    this.unloadPlaylist(Skhf.session.onglet, function() {
      $('#top-playlist li.selector').animate({'width': API.config.slider.width}, 500, function(){
    		$('#top-playlist li.selector').show();
				if (self.playlist.elmt.hasClass('empty')) {
					self.playlist.elmt.removeClass('empty');
				}
      });
    });

    this.loadSocialSelector();
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
    
  },
  loadPlaylist: function(access, onglet){
    var self = this;
    console.log('UI.loadPlaylist', access, onglet, Skhf.session);

    if (Skhf.session.datas.email) {
      //hide selector
      $('li.selector', this.playlist.elmt).animate({'width':0}, 500, function() {
        $(this).hide();
      });

      //load playlist
      Skhf.session.access = access;
      if (typeof onglet != 'undefined') { //, with_player: 1, player: API.config.player
        var args = {onglet: onglet, with_best_offer: 1, time: new Date().getTime()};
      } else {
        var args = {with_best_offer: 1, time: new Date().getTime()};
      }
      if (access) {
        Skhf.session.getFriendsUids(function(friends_uids){
          $.extend(self.playlist.params.args, {friends_uids: friends_uids}); //, api_method: 'POST'
        })
      }
      this.playlist.loadRemotePrograms(
				0,
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
				args
			);
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
  //paywall
  paywall: function(id, callback) {
    var self = this;
    console.log('UI.paywall', id);
    API.quickLaunchModal('signin', function() {
      if (!Skhf.session.datas.email) {
        self.paywall(id, callback);
      }
    },{parcours: 'anonyme_favoris', occurrence_id: id});
  },
  // -- launch player
  play: function(id, args) {
    console.log('UI.play', id, args);
    $('.popover:visible').popover('hide');
    //if (Player.getType() == 'ios') {
    //  Player.playOccurrence(id);
    //} else {
    if (typeof args.current_player != 'undefined' && args.current_player) {
      Player.playOccurrence(id, function(){}, args);
    } else {
      var args = $.extend({type: 'occurrence', id: id, session_uid: Skhf.session.uid, hide_sliders: 1}, args);
      Couchmode.init(args);
    }
  },
  loadPlayer: function(trigger) {
    var self = this;
    Player.load(trigger);
  },
  loadRedirect: function(url) {
    console.log('UI.loadRedirect', url);
		$('body').removeClass('view-homes view-homes_vod');
    Player.redirect(url, $('#redirect'), $('#content'));
		$('#redirect').prepend('<div class="container container-redirect collapse in">' +
													 '<p class="alert alert-info"><span class="close pull-right" data-toggle="collapse" data-target=".container-redirect">&times;</span>Vous visitez un site partenaire de mySkreen.com. <a data-redirect="unload">Revenir à mySkreen.com</a></p>' +
													 '</div>' +
													 '<a class="close-redirect" data-redirect="unload">&times Fermer</a>');
    //window.onbeforeunload = API.quickLaunchModal('signin', function() {
    //  alert('leave');
    //  window.onbeforeunload = null;
    //});
  },
  unloadRedirect: function(url) {
		$('#content').show();
    $('#redirect').empty();
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
  // -- add friends
  addFriends: function(container, friend_uids){
    //console.log('UI.addFriends', container.data('id'), friend_uids);
    
    Skhf.session.getSocialDatas(function(friends, friends_programs) {
      //console.log('UI.addFriends', 'callback Session.getSocialDatas', friends);
      var div = $('<div class="friends"></div>');
      for (k in friend_uids) {
        //console.log('UI.addFriends', friend_uids[k], friends[friend_uids[k]]);
        if (typeof friends[friend_uids[k]] != 'undefined') {
          var friend = friends[friend_uids[k]];
          div.append('<a rel="tooltip" data-placement="bottom" title="' + friend.name + '<br/>suit ce programme" href="#"><img src="' + friend.pic_square + '" alt="' + friend.name + '" /></a>');
        }
      }
      $('a[rel="tooltip"]', div).tooltip();
      div.appendTo(container);
    });
  },
  addFriendsPrograms: function(){
    //return; //desactivated
    Skhf.session.getSocialDatas(function(friends, friends_programs){
      //console.log('UI.addFriendsPrograms', 'callback', friends_programs);
      for (k in friends_programs) {
        var li = $('#top-playlist li[data-id="' + k + '"]');
        if (li.length > 0) {
          //console.log('UI.addFriendsPrograms', 'add ' + friends_programs[k].length + ' friends to program ' + k);
          UI.addFriends(li, friends_programs[k]);
        }
      }
    });

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
                         {
                          session_uid: Skhf.session.uid, 
                          img_width: 30, 
                          img_height: 30, 
                          advanced: 1, 
                          with_unvailable: 1
                         }, 
                         function(data){
                            console.log('UI.typeahead', query, data);
                            //if (data.search) {
                            //  return typeahead.process(data.search.split(';'));
                            //}

                            if (data.programs || data.persons || data.queue || data.channels || data.theaters) {
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
                                  case 'programs':
                                    var items = data[key];
                                    titles[key] = 'Programmes';
                                  break;
                                  case 'persons':
                                    var items = data[key];
                                    titles[key] = 'Personnes';
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
                                    case 'programs':
                                      i.addClass('program')
                                       .find('a')
                                       .html(typeahead.highlighter(item.name))
                                    break;
                                    case 'persons':
                                      i.addClass('person')
                                       .find('a')
                                       .html(typeahead.highlighter(item.name))
                                    break;
                                  }
                                  console.log('UI.typeahead', 'add item', key,  i);
                                  return i[0]
                                })
                              }

                              //data.first().addClass('active')
                              var sort = Array('programs','persons','queue','channels','theaters');
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
                              typeahead.show();
                            } else {
                              return typeahead.shown ? typeahead.hide() : typeahead
                            }
                           });
      },
      onselect: function(obj) {
        console.log('UI.typeahead', 'onselect', obj, typeof obj, 'blur:' + $(searchbox), API.config.v3_url + '/programmes/' + obj);

        if (typeof obj != 'object') { //typeahead
          top.location = API.config.v3_url + '/programmes/' + obj;
        } else if (typeof obj.seo_url != 'undefined') { //advanced
          $(searchbox).attr('value', '')
          if (obj.seo_url.match(/^http:\/\//)) {
            top.location = obj.seo_url;
          } else {
            top.location = API.config.v3_url + obj.seo_url;
          }
        }
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
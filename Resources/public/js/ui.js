// -- UI
var UI;
UI = {
  user: '',
  player: null,
  playlist: null,
  badge_notification: '<span class="badge badge-important">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  //toggle favorite
  toggleFavorite: function(trigger){
    var value = trigger.data('id');
    if (Session.datas.email) {
      API.togglePreference('like', value, trigger, function(){
        $('#playlist li[data-id="'+trigger.data('id')+'"]').animate({width:0}).remove();
      });
    } else {
      API.quickLaunchModal('signin', function(){
        Session.sync();
      });
    }
  },
  //typeahead
  typeahead: function(searchbox){
    console.log('UI.typeahead', searchbox);
    $(searchbox).typeahead({
      items: 10,
      source: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
      /*source: function (typeahead, query) {
        console.log('UI.typeahead', 'query:'+query);
        return API.query('GET', API.base + 'search/autsuggest/' +query, null, function(data){
          //return typeahead.process(data);
         });
      }*/
    });
  },
  //user infos
  loadUser: function() {
    console.log('UI.loadUser', Session.datas.email, this.user);
    if (this.user) {
      if (this.user == Session.datas.email) {
        return;
      } else {
        //TODO : unload user !
      }
    }

    this.user = Session.datas.email;
    if (Session.datas.email) {
      $('.user span').html(Session.datas.email);
    } else {
      $('.user span').remove();
    }
    $('.user-off, .user-on').toggle();

    this.notifyUser(Session.datas.notifications);
  },
  //notify
  notifyUser: function(notifications) {
    console.log('UI.notifyUser', notifications);
    for (key in notifications) {
      console.log('UI.notifyUser', 'programs', $('#top-bar .user'), key, notifications[key].new);
      if (key == 'programs') {
        if (notifications[key].new.length > 0) {
          $('#top-bar .user').addClass('with-badge').append($(this.badge_notification).html(notifications[key].new.length));
        }
      } else {
        if (notifications[key].new > 0) {
          $('#top-bar .dropdown-menu li a.' + key).addClass('with-badge').append($(this.badge_notification).html(notifications[key].new));
        }
      }
    }
  },
  //update friends
  loadFriends: function(datas) {
    if (datas.programs) {
      var program = datas.programs.pop();
      var friends = datas.friends;

      //console.log('UI.loadSelector', key, group);
      var li = $('li#friends', this.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+program.picture+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity');
      li.find('span.badge').remove();
      li.find('.label span').html(friends.length);
      li.find('a, h6').hide();
    }
  },
  //update selector
  loadSelector: function(datas) {
    this.unloadPlaylist();
    this.unloadSelector();
    $('#top-playlist h2 small:first').html(Session.onglet != null ? '» ' + $('#nav-toggle .badge-' + Session.onglet + ' a').html() : '');
    for (key in datas) {
      var group = datas[key];
      //console.log('UI.loadSelector', key, group);
      var li = $('li#' + key, this.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+group.img+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.find('.label span').html(group.nb_programs);
      li.find('span.badge').remove();
      if (key != 'all' && 
          group.nb_notifs > 0){
        li.prepend(this.badge_notification.replace('%count%', 'nouveaux')); //group.nb_notifs));
      }
      li.find('a, h6').hide();
    }
    //this.playlist.data('queue-selector', JSON.stringify(datas));
  },
  unloadSelector: function() {
    var lis = $('li.selector', this.playlist);
    lis.addClass('empty').css('background-image', '');
    lis.find('.label').addClass('opacity').find('span').empty();
    lis.find('span.badge').remove();
    lis.find('a, h6').show();
  },
  unloadPlaylist: function(onglet) {
    console.log('UI.unloadPlaylist', onglet, Session.onglet);
    if (typeof onglet != "undefined" && onglet != Session.onglet) {
      Session.initPlaylist('/' + onglet);
    }
    $('#top-playlist h2 small').empty();
    $('li:not(.selector, #item)', this.playlist).animate({width:0}, 500, function() {
      $(this).hide();
      $('li.selector', this.playlist).show().animate({width:Slider.item_width}, 500);
      Slider.remove(this.playlist);
    });
  },
  loadPlayer: function() {
  },
  loadRedirect: function(url) {
    var player = $('#top-redirect');
    if (typeof url != "undefined") {
      player.append('<iframe src="' + url + '"></iframe>')
    }
    
    player.show().css('height', ($(window).height() - 100) + 'px');
    $('#top-playlist, #top-nav').collapse('hide');
  },
  //insert loader
  appendLoader: function(elmt) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .bar', elmt).animate({width: '100%'}, 5000);
  },
  //remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress').remove();
  },
  loadFilters: function(filters) {
    console.log('UI.loadFilters', filters);
    $('#top-nav .subnav ul li').removeClass('active');
    $('#top-nav .subnav ul li.' + filters).addClass('active');
    $('#top-filters > ul > li').hide();
    $('#top-filters > ul > li.' + filters).toggle();
  }
}
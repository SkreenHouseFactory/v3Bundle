// -- UI
var UI;
UI = {
  player: null,
  badge_notification: '<span class="badge badge-info">%count%</span>',
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
    if (Session.datas.email) {
      $('#signin').hide();
      $('#signed-in span').html(Session.datas.email);
      $('#signed-in').fadeIn();
      $('#top-playlist h2').css({visibility: 'visible'});
      $('#top-baseline').hide();
    } else {
      $('#signed-in span').empty();
      $('#signed-in').hide();
      $('#signin').fadeIn();
      $('#top-playlist h2').css({visibility: 'hidden'});
      $('#top-baseline').show();
    }
  },
  //update friends
  loadFriends: function(datas) {
    if (datas.programs) {
      var program = datas.programs.pop();
      var friends = datas.friends;

      //console.log('UI.loadSelector', key, group);
      var li = $('li#friends', Session.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+program.picture+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity');
      li.find('span.badge').remove();
      li.find('.label span').html(friends.length);
      li.find('a').hide();
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
      var li = $('li#' + key, Session.playlist);
      li.removeClass('empty');
      li.css('background-image', 'url('+group.img+')').css('background-repeat', 'no-repeat');
      li.find('.label').removeClass('opacity').addClass('label-inverse');
      li.find('.label span').html(group.nb_programs);
      li.find('span.badge').remove();
      if (key != 'all' && 
          group.nb_notifs > 0){
        li.prepend(this.badge_notification.replace('%count%', group.nb_notifs));
      }
      li.find('a, h6').hide();
    }
    //Session.playlist.data('queue-selector', JSON.stringify(datas));
  },
  unloadSelector: function() {
    var lis = $('li.selector', Session.playlist);
    lis.addClass('empty').css('background', 'none');
    lis.find('.label').addClass('opacity').removeClass('label-inverse').find('span').empty();
    lis.find('span.badge').remove();
    lis.prepend($(this.badge_notification.replace('%count%', '0')).removeClass('badge-info'));
    lis.find('a, h6').show();
  },
  unloadPlaylist: function() {
    $('li:not(.selector, #item)', Session.playlist).animate({width:0}, 500, function() {
      $(this).hide();
      $('li.selector', Session.playlist).show().animate({width:Slider.item_width}, 500);
      Slider.remove(Session.playlist);
    });
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
  } 
}
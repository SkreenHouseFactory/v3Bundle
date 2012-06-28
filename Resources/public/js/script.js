$(document).ready(function(){

  //v2
  if (top.location.href != document.location.href) {
    API.syncV2();
  }

  // -- session
  Session.init(function(sessionData){
    console.log('context', API.context);
  });

  // -- ui user
  $('#signin a').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["signin"]);
    } else {
      API.quickLaunchModal('signin');
    }
  });
  $('#signed-in a').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["signout"]);
    }
    Session.signout();
  });

  // -- ui nav
  $('.subnav .nav li').hover(function(e){
      e.preventDefault();

      $('.subnav .nav li').removeClass('active');
      $(this).addClass('active');

      $('#nav-toggle').slideDown();
      $('#nav-toggle > ul > li').hide();
      $($('a', this).data('target')).show();
    },function(){
  });
  $('#top-playlist').hover(function(e){
      $('#nav-toggle').slideUp();
    },function(){
  });
  $('#nav-toggle > li > a').click(function(){
    $('#nav-toggle > li').removeClass('active');
    $(this).parent().addClass('active');
  });

  // -- ui form
  $('#top-bar form.navbar-search a').click(function(){
    $(this).parent().submit();
    return false;
  });
  $('#top-bar form.navbar-search').submit(function(){
    var q = $('.search-query', this).val();
    console.log('search', '/programmes/' + q);
    if (q) {
      API.linkV2('/programmes/' + q);
    }
    return false;
  });

  // -- ui typeahead
  UI.typeahead('.search-query');

  // -- ui playlist
  $('li.selector:not(.empty)', Session.playlist).live('click', function(){
    Session.loadPlaylist(this.id);
  });
  $('#top-playlist h2').live('click', function(){
    UI.unloadPlaylist(this.id);
  });
  $('li.selector.empty a').popover();

  // -- ui link/url
  $('a[data="url"]').live('click', function(e){
    e.preventDefault();
    console.log('ui link/url', 'a[data="url"]');
    API.linkV2($(this).data('url'));
  });
  $('a.link-v2').live('click', function(e){
    console.log('ui link/url', 'linkV2');
    e.preventDefault();
    API.linkV2($(this).attr('href'));
  });

  // -- ui player
  $('a[data="player"]').live('click', function(e){
    e.preventDefault();
    UI.loadPlayer($(this).data('player'));
  });


  // -- ui actions : favorite & play
  $('.slider li:not(.selector)').live('click', function(){
    API.linkV2($('.actions .play', this).attr('href'));
    return false;
  });
  $('.actions .fav').live('click', function(e){
    e.preventDefault();
    UI.toggleFavorite($(this));
    return false;
  });
  $('.actions .play').live('click', function(e){
    e.preventDefault();
    API.linkV2($(this).attr('href'));
    return false;
  });

  // -- ui popover favorites
  //if (!Session.datas.email) {
    $('.actions .fav:not(.btn-primary)').live('mouseover', function() {
      $(this).popover({placement: 'top',
                       title:	function() { return 'Ajouter à vos favoris'},
                       content: 'Pour voir ce programme plus tard, pour être averti dès qu\'un épisode est disponible en Replay, etc.'})
             .popover('show');
    });
  //}

  // -- ui player
  $('a.player').click(function(e){
    e.preventDefault();
    Player.load($(this));
    return false;
  });
  
});
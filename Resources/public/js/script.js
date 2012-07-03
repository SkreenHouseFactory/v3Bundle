$(document).ready(function(){

  //v2
  if (top.location.href != document.location.href) {
    API.syncV2();
  }

  // -- session
  $('.user-on').hide();
  Session.init(function(sessionData){
    console.log('context', API.context);
  });

  // -- ui user
  $('a.signin').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["signin"]);
    } else {
      API.quickLaunchModal('signin', function() {
        Session.sync();
      });
    }
  });
  $('a.signout').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["signout"]);
    }
    Session.signout();
  });
  $('.user-on .dropdown-toggle').click(function(){
    if (!$('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('show');
      API.postMessage(["header","add_playlist"]);
    }
  });

  // -- ui nav
  $('.subnav .nav li').click(function(){
    $('.subnav .nav li.active').removeClass('active');
    UI.loadFilters(this.className);
    $(this).addClass('active');
  });
  $('#top-filters > ul > li.grid').click(function(){
    var onglet = $('a', this).removeClass('dropdown-toggle').attr('class');
    API.javascriptV2("mskapp.currentView.showByType('" + onglet + "');$('#sliders .item." + onglet + "').show();$('#sliders .item:not(." + onglet + ")').hide();");
    Session.onglet = onglet;
    Session.loadPlaylist('tv');
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
  $('a.javascript-v2').live('click', function(e){
    console.log('ui link/url', 'javascriptV2');
    e.preventDefault();
    API.javascriptV2($(this).attr('href').replace('javascript://',''));
  });

  // -- ui player
  $('a[data="player"]').live('click', function(e){
    e.preventDefault();
    UI.loadPlayer($(this).data('player'));
  });
  if ($('#top-redirect iframe').length > 0) {
    console.log('UI.loadRedirect()', $('#top-redirect iframe').length);
    UI.loadRedirect();
  }

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
                       content: '<hr/><b>Ne ratez plus vos programmes !</b><br/>En ajoutant ce programme à vos playlists vous saurez quand il passe à la télé ou au cinéma et s\'il est disponible en Replay ou en VOD. Vous serez averti dès qu\'un épisode est disponible.'})
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
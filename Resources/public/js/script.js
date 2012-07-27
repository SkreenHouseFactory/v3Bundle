$(document).ready(function(){

  //init
  API.init();

  //v2
  if (top.location != self.document.location) {
    API.syncV2(function(){
      //callback sync
    });
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
    return false;
  });
  $('a.signout').click(function(){
    Session.signout();
    return false;
  });
  $('a.account').click(function(){
    if (API.context == 'v2') {
      API.postMessage(["account"]);
    }
    return false;
  });
  $('.user-on .dropdown-toggle').click(function(){
    if (!$('#top-playlist').hasClass('in')) {
      $('#top-playlist').collapse('show');
    }
  });

  // -- ui nav
  /** link-force
    $('.subnav .nav li').click(function(){
    if ($('#top-filters #top-baseline').css('display') == 'block') {
      $('#top-filters #top-baseline, #top-filters .nav-pills').toggle();
    }
    $('.subnav .nav li.active').removeClass('active');
    UI.loadFilters(this.className);
    $(this).addClass('active');
    API.postMessage(['header','collapse']);
  });*/
  $('#top-filters > ul > li').click(function(){
    $('#top-filters > ul > li').removeClass('active');
    $(this).addClass('active');
    if ($(this).hasClass('tv-grid')) {
      var onglet = $('a', this).data('filter');
      console.log('script', 'li.tv-grid', onglet);
      if (onglet == 'all') {
        API.javascriptV2("$('#facetType').val('all');mskapp.currentView.filterByType('#facetType');$('#sliders .item').show();");
      } else {
        API.javascriptV2("$('#facetType').val('" + onglet + "');mskapp.currentView.filterByType('#facetType');$('#sliders .item." + onglet + "').show();$('#sliders .item:not(." + onglet + ")').hide();");
      }
      //Session.onglet = onglet;
      UI.loadPlaylist('tv', onglet);
    }
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
  $('.navbar-search').submit(function(){
    console.log('script', 'searchbox blur', $('.search-query', $(this)));
    $('.search-query', $(this)).blur();
  });

  // -- ui playlist
  //height header      
  $('#top-playlist').on('show', function () {
    console.log('script', '#top-playlist on show');
    API.postMessage(['header', 'add_playlist'])
  });
  $('#top-playlist').on('hide', function () {
    console.log('script', '#top-playlist on hide');
    API.postMessage(['header', 'remove_playlist'])
  });
  $('li.selector', Session.playlist).live('click', function(){
    console.log('script', 'li.selector', 'click');
    if ($(this).hasClass('empty')) {
      if ($('a', $(this)).data('modal')) {
        API.launchModal($('a', $(this)).data('modal'));
      } else {
        $('a', $(this)).click();
      }
    } else {
      UI.loadPlaylist(this.id);
    }
    return false;
  });
  $('#top-playlist h2').live('click', function(){
    UI.unloadPlaylist(this.id);
  });

  // -- ui link/url
  $('a[data="url"]').live('click', function(e){
    e.preventDefault();
    console.log('ui link/url', 'a[data="url"]');
    API.linkV2($(this).data('url'));
    return false;
  });
  $('a.link-v2').live('click', function(e){
    console.log('ui link/url', 'linkV2');
    e.preventDefault();
    API.linkV2($(this).attr('href'), $(this).hasClass('link-force'));
    return false;
  });
  $('a.javascript-v2').live('click', function(e){
    console.log('ui link/url', 'javascriptV2');
    e.preventDefault();
    API.javascriptV2($(this).attr('href').replace('javascript://',''));
    return false;
  });
  $('a[data-modal]').live('click', function(){
    console.log('script', 'a[data-modal]', 'click');
    API.quickLaunchModal($(this).data('modal'));
    return;
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

    if ($(this).data('redirect')) {
      console.log('script', 'player redirect', $(this));
      UI.loadRedirect($(this).attr('href'));

    } else if ($(this).data('player')) {
      console.log('script', 'player embed', $(this));
      UI.loadPlayer($(this));

    } else {
      API.linkV2($(this).attr('href'));
    }
    return false;
  });
  $('.actions .fav.btn-primary, .actions .fav.btn-danger').live('hover', function(e) {
    //console.log('script', '.fav:hover', event.type);
    if (event.type == "mouseover") {
      if ($(this).hasClass('btn-primary')) {
        $(this).removeClass('btn-primary').addClass('btn-danger').html('<i class="icon-remove-sign icon-white"></i> Retirer');
      }
    } else if (event.type == "mouseout") {
      if ($(this).hasClass('btn-danger')) {
        $(this).removeClass('btn-danger').addClass('btn-primary').html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists');
      }
    }
  });

  // -- ui popover favorites
  $('.actions .fav:not(.btn-primary, .btn-danger)').live('mouseover', function() {
    if ($(this).parent().data('onglet') == 'emissions' || $(this).parent().data('onglet') == 'series') {
      var content = '<b>Ne ratez plus vos programmes !</b><br/>En ajoutant ce programme à vos playlists vous serez averti dès qu\'un épisode est disponible !';
    } else {
      var content = '<b>Ne ratez plus vos programmes !</b><br/>En ajoutant ce programme à vos playlists vous saurez quand il passe à la télé ou au cinéma et s\'il est disponible en Replay ou en VOD.';
    }
    
    $(this).popover({placement: 'top',
                      title:	function() { return 'Ajout à vos playlists'},
                      content: content})
            .popover('show');
  });

  // -- ui player autoplay
  $('a[data-player-autoplay="1"]').each(function(){
    console.log('script', 'player autoplay', $(this));
    UI.loadPlayer($(this));
    return false;
  });
  
  // -- ui redirect autoload
  if ($('#redirect iframe').length > 0) {
    console.log('UI.loadRedirect()', $('#redirect iframe').length);
    UI.loadRedirect();
  }
  
  // -- nav-alpha-client
  $('.pagination-client-alpha li').click(function(){
    console.log('script', 'nav-alpha-client', '[data-alpha="' + $('a', this).html() + '"]', $('[data-alpha="' + $('a', this).html() + '"]'));
    if ($('a', this).html().length > 1) {
      $('[data-alpha]').show();
    } else {
      $('[data-alpha]').hide();
      $('[data-alpha="' + $('a', this).html() + '"]').show();
    }
    $('.pagination-client-alpha li').removeClass('active');
    $(this).addClass('active');
  });

  // -- popover
  $('*[data-content]').popover();

});
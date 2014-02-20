if (!document.getElementsByClassName) {
  document.getElementsByClassName=function(cn) {
    var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
    while(a=allT[i++]) {
        a.className==cn ? allCN[allCN.length]=a : null;
    }
    return allCN
  }
}

//////////// CALLBACKS ////////////////
// -- session sync
callbackSignin = function() {
  if (Skhf.session.user){
    // passer de la présentation "se connecter" à "partager"
    //console.log('scripts/embed.js', 'callbackSignin');
    $('.connect').addClass('hide');
    $('.share').removeClass('hide');
    
    // Ajout aux playlists le programme embed
    if($('[data-program-id]').length && !Skhf.session.isInPlaylist('like', $('[data-program-id]').data('program-id'))){
      API.addPreference('like',$('[data-program-id]').data('program-id'));
      //console.log('scripts/embed.js', 'ajout playlist', 'ok');
    }
  }
}

window.onload = function(){
  //console.log('scripts/embed.js');

  // check video embed pour éviter l'autoclick mobile sur les autres embed (type moviepush)
  var pathname = window.location.pathname;
  //console.log('scripts/embed.js', 'Pathname', pathname);
  var checkVideoEmbed = pathname.search("/video/");

  if(checkVideoEmbed == -1){

    TimeOut = setTimeout(function(){
      var trigger_appear = $('#trigger').hasClass('appear');
      // console.log('scripts/embed.js', 'trigger_appear', trigger_appear);
      if (trigger_appear) {
        $('#trigger.appear').css('display', 'block');
      }
    },3000);
  }

  var trigger = document.getElementById('trigger');
  if (trigger) {
    var covers = document.getElementsByClassName('player-cover');
    var params = JSON.parse(trigger.getAttribute('data-play-embed'));
    //console.log('covers', covers, 'params', params);
    trigger.onclick = function(){
      //console.log('scripts/embed.js', 'trigger onclick', trigger);
      //hide cover
      for (i=0; i < covers.length; i++) {
        covers[i].style.display = 'none';
      }
      var player_elmt = document.getElementById('player');
      player_elmt.style.display = 'block';
      //load player
      var player;
      player = new Skhf.BasePlayer('player', params);
    }

    //console.log('scripts/embed.js', 'check moviepush', checkMoviepush);
    //autoplay
    var d = new Date();
    //console.log('autolay', window.document.referrer.indexOf('lesinconnus.fr'), d.getTime(), Date.parse('2013-12-20T07:00:00'))
    if (window.document.referrer.indexOf('lesinconnus.fr') == -1 &&
        d.getTime() < Date.parse('2013-12-20T07:00:00')) {
      trigger.click();
    } else

    //autoclick mobile
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android/gi) &&
        checkVideoEmbed != -1) {
      //console.log(['scripts/embed.js', 'iPhone|iPod|iPad|Android', 'default click']);
      trigger.click();
    }
    // hack autoplay "Les 3 frères, le retour" sur Allociné
    if(document.location.href=='http://embed.myskreen.com/video/33505825/?width=614&height=374&skKey=40dd9b8ee77b001f6ee1314ca9ad86dc'){
      trigger.click();
    }
  }
}
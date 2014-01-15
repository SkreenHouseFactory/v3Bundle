if (!document.getElementsByClassName) {
  document.getElementsByClassName=function(cn) {
    var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
    while(a=allT[i++]) {
        a.className==cn ? allCN[allCN.length]=a : null;
    }
    return allCN
  }
}

window.onload = function(){
  //console.log('scripts/embed.js');

  //////////// CALLBACKS ////////////////
  // -- session sync
  Skhf.session.callbackSignin = function() {
    if(Skhf.session.user){
      console.log('scripts/embed.js', 'callbackSignin');
      $('.connect').addClass('hide');
      $('.share').removeClass('hide');
    }
  }


  var trigger = document.getElementById('trigger');
  if (trigger) {
    var covers = document.getElementsByClassName('player-cover');
    var params = JSON.parse(trigger.getAttribute('data-play-embed'));
    //console.log('covers', covers, 'params', params);
    trigger.onclick = function(){
      //hide cover
      for (i=0;i<covers.length;i++) {
        covers[i].style.display = 'none';
      }
      //load player
      var player;
      player = new Skhf.BasePlayer('player', params);
    }

    //autoplay
    var d = new Date();
    //console.log('autolay', window.document.referrer.indexOf('lesinconnus.fr'), d.getTime(), Date.parse('2013-12-20T07:00:00'))
    if (window.document.referrer.indexOf('lesinconnus.fr') == -1 &&
        d.getTime() < Date.parse('2013-12-20T07:00:00')) {
      trigger.click();
    } else

    //autoclick mobile
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android/gi)) {
      //console.log(['scripts/embed.js', 'iPhone|iPod|iPad|Android', 'default click']);
      trigger.click();
    }
  }
}
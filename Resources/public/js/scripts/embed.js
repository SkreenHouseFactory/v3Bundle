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
    if(Skhf.session.user){
      // passer de la présentation "se connecter" à "partager"
      console.log('scripts/embed.js', 'callbackSignin');
      $('.connect').addClass('hide');
      $('.share').removeClass('hide');


      // check si le user FB connecté a liké
      checklikeFB = function(pageIdFB, fbUID){
        console.log('checklikeFB', 'SELECT uid FROM page_fan WHERE uid='+fbUID+' AND page_id='+pageIdFB);
        console.log('checklikeFB', Skhf.session.datas.fb_access_token);
        FB.api({
          method:     'fql.query', 
          access_token: Skhf.session.datas.fb_access_token,
          query:  'SELECT uid FROM page_fan WHERE uid='+fbUID+' AND page_id='+pageIdFB
        }, function(resp) {
            console.log('checklikeFB', 'response', resp);
            if (resp.length) {
              clearTimeout(TimeOut);
              $('#trigger').addClass('btn btn-success btn-lg').html("Voir la vidéo");
            } else {
              TimeOut = setTimeout(function(){
                checklikeFB(pageIdFB, fbUID)
              },3000)
            }
          }
        );
      }

      // une fois connecté
      if(Skhf.session.datas.fb_uid){
        $.get('http://graph.facebook.com/fql?q=select%20url%2C%20id%2C%20type%2C%20site%20from%20object_url%20where%20url%20%3D%20%22'+escape($('.fb-like').data("href"))+'%22', function(fbdata){
          //console.log('scripts/embed.js', 'get by FQL page_id', fbdata);
          var pageIdFB = fbdata.data[0].id;
          var fbUID = Skhf.session.datas.fb_uid;
          console.log('scripts/embed.js', 'fb_uid verif', fbUID);
          checklikeFB(pageIdFB,fbUID)
          console.log('scripts/embed.js', 'get by FQL page_id', pageIdFB);
        });
      }
    }
  }

window.onload = function(){
  //console.log('scripts/embed.js');
  


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
      var player_elmt = document.getElementById('player');
      player_elmt.style.display = 'block';
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
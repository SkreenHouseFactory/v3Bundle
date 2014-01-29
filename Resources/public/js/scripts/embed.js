if (!document.getElementsByClassName) {
  document.getElementsByClassName=function(cn) {
    var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
    while(a=allT[i++]) {
        a.className==cn ? allCN[allCN.length]=a : null;
    }
    return allCN
  }
}

TimeOut = setTimeout(function(){
  var trigger_appear = document.getElementsByClassName('appear');
  if (trigger_appear.length) {
    for (i=0; i<trigger_appear.length; i++) {
      trigger_appear.style.display = 'block';
    }
  }
},3000);

//////////// CALLBACKS ////////////////
  // -- session sync
  callbackSignin = function() {
    if(Skhf.session.user){
      // passer de la présentation "se connecter" à "partager"
      console.log('scripts/embed.js', 'callbackSignin');
      $('.connect').addClass('hide');
      $('.share').removeClass('hide');
      
      // Ajout aux playlists le programme embed
      if($('[data-program-id]').length && !Skhf.session.isInPlaylist('like', $('[data-program-id]').data('program-id'))){
        API.addPreference('like',$('[data-program-id]').data('program-id'));
        console.log('scripts/embed.js', 'ajout playlist', 'ok');
      }

      // check si le user FB connecté a liké
      /*checklikeFB = function(pageIdFB, fbUID){
        console.log('checklikeFB', 'SELECT uid FROM page_fan WHERE uid='+fbUID+' AND page_id='+pageIdFB);
        console.log('checklikeFB', Skhf.session.datas.fb_access_token);
        FB.api({ method: 'pages.isFan', page_id: pageIdFB, uid: fbUID, access_token: Skhf.session.datas.fb_access_token }, function(resp) {
          if (resp == true) {
            console.log('checklikeFB', 'user_id likes the Application.');
          } else if(resp.error_code) {
            console.log('checklikeFB', resp.error_msg);
          } else {
            console.log('checklikeFB', "user_id doesn't like the Application.");
          }
        });
        /*FB.api({ method: 'fql.query', query: 'SELECT uid FROM page_fan WHERE uid= ' + fbUID + ' AND page_id=' + pageIdFB },
          function(result) {
            console.log('checklikeFB', 'FQL result', result);
            if (result.length){
              console.log('checklikeFB', 'FQL success');
            }
        });*/
        /*FB.api(
          'me/likes',
          {access_token: Skhf.session.datas.fb_access_token},
          function(response){
            console.log('checklikeFB', 'response', response);
            for (var i=0; i<response.data.length; i++){
              if (response.data[i].id==pageIdFB){
                clearTimeout(TimeOut);
                $('#trigger').addClass('btn btn-success btn-lg').html("Voir la vidéo");
                return true;
              }
            }
            TimeOut = setTimeout(function(){
                checklikeFB(pageIdFB, fbUID)
              },3000)
            /*if (response.data.length === 1) {
              clearTimeout(TimeOut);
              $('#trigger').addClass('btn btn-success btn-lg').html("Voir la vidéo");
            } else {
              TimeOut = setTimeout(function(){
                checklikeFB(pageIdFB, fbUID)
              },3000)
            }
          }
        );*/
      }

      // une fois connecté
      /*if(Skhf.session.datas.fb_uid){
        $.get('http://graph.facebook.com/fql?q=select%20url%2C%20id%2C%20type%2C%20site%20from%20object_url%20where%20url%20%3D%20%22'+escape($('.fb-like').data("href"))+'%22', function(fbdata){
          //console.log('scripts/embed.js', 'get by FQL page_id', fbdata);
          var pageIdFB = fbdata.data[0].id;
          var fbUID = Skhf.session.datas.fb_uid;
          console.log('scripts/embed.js', 'fb_uid verif', fbUID);
          checklikeFB(pageIdFB,fbUID)
          console.log('scripts/embed.js', 'get by FQL page_id', pageIdFB);
        });
      }*/
    }

window.onload = function(){
  //console.log('scripts/embed.js');

  // check video embed pour éviter l'autoclick mobile sur les autres embed (type moviepush)
  var pathname = window.location.pathname;
  //console.log('scripts/embed.js', 'Pathname', pathname);
  var checkVideoEmbed = pathname.search("/video/");

  var trigger = document.getElementById('trigger');
  if (trigger) {
    var covers = document.getElementsByClassName('player-cover');
    var params = JSON.parse(trigger.getAttribute('data-play-embed'));
    console.log('covers', covers, 'params', params);
    trigger.onclick = function(){
      //console.log('scripts/embed.js', 'trigger onclick', trigger);
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
  }

  // GESTION FB LIKE via FAKE BUTTON
  /*if(checkMoviepush != -1){
    var fbFakelike = document.getElementById('fb-fakelike');
    var fbLike = document.getElementsByClassName('fb-like');
    //console.log('scripts/embed.js', 'FB Fake like', 'fbLike', fbLike);
    var fbHref = fbLike[0].getAttribute('data-href');
    //console.log('scripts/embed.js', 'FB Fake like', 'fbHref', fbHref);
    fbFakelike.onclick = function(){
      FB.api(
      '/'+Skhf.session.datas.fb_uid+'/og.likes',
      "POST",
      {
          "object": fbHref
      },
      function (response) {
        console.log('scripts/embed.js', 'FB Fake like', response);
        if (response && !response.error) {
          console.log('scripts/embed.js', 'FB Fake like', 'Like Successful');
        }
      });
    }
  }*/
  
  
}
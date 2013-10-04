var addEvent =  window.attachEvent||window.addEventListener;


if (!document.getElementsByClassName) {
    document.getElementsByClassName=function(cn) {
        var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
        while(a=allT[i++]) {
            a.className==cn ? allCN[allCN.length]=a : null;
        }
        return allCN
    }
}

addEvent('load', function(){
  //console.log('scripts/embed.js');
  var trigger = document.getElementById('trigger');
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

  if (navigator.userAgent.match(/iPhone|iPod|iPad|Android/gi)) {
    //console.log(['scripts/embed.js', 'iPhone|iPod|iPad|Android', 'default click']);
    trigger.click();
  }
})
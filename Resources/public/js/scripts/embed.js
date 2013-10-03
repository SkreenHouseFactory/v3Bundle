if (!document.getElementsByClassName) {
    document.getElementsByClassName=function(cn) {
        var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
        while(a=allT[i++]) {
            a.className==cn ? allCN[allCN.length]=a : null;
        }
        return allCN
    }
}

window.addEventListener('load', function(){
  //console.log('scripts/embed.js');
  var trigger = document.getElementById('trigger');
  var covers = document.getElementsByClassName('player-cover');
  console.log('covers', covers);
  trigger.onclick = function(){
    //hide cover
    for (i=0;i<covers.length;i++) {
      covers[i].style.display = 'none';
    }
    //load player
    var player;
    player = new Skhf.BasePlayer('player', {playId: 31516622});
  }

  if (navigator.userAgent.match(/iPhone|iPod|iPad|Android/gi)) {
    //console.log(['scripts/embed.js', 'iPhone|iPod|iPad|Android', 'default click']);
    trigger.click();
  }
})
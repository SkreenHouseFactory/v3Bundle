var Dialog = Class.extend({

  method: null,
  titre: null,
  content: null,

  init: function(method,params,timeout){
    if (typeof(this[method]) != 'undefined') {
      this[method]();
      for (k in params) {
        this.title = this.title.replace(k,params[k]);
        this.content = this.content.replace(k,params[k]);
      }
      UI.loadAlertUser(this.title,this.content,timeout);
    } else {
      console.log('scripts/dialog.js', 'Dialog.init', 'This method does not exist.');
    }
  },

  noItemInPlaylist: function(){
    this.title = 'Pas de playlist, pas de notifications&nbsp;?';
    this.content = '<br/><a class="btn btn-primary" href="' + API.config.v3_root + '/start/">Créer mes listes</a><br/>';
  },

  fewItemsInPlaylist: function(){
    this.title = 'Vous avez %nbfavori% dans vos listes.';
    this.content = '<br/><a class="btn btn-primary" href="' + API.config.v3_root + '/start/">Continuer mes listes</a><br/>';
  },

  firstItemInPlaylist: function(){
    this.title = '%title%';
    this.content = '%content%<br/>Bravo, c\'est le 1<sup>er</sup> favori dans vos listes&nbsp;!<br/>';
  },

  firstItemsInPlaylist: function(){
    this.title = '%title%';
    this.content = '%content%<br/>Bravo, vous avez %nbfavori% dans vos listes&nbsp;!<br/>';
  },  

  paymentPopinEnd: function(){
    this.title = 'Gérer vos films';
    this.content = 'Cliquez sur "Vos vidéos à la demande" pour voir ou revoir vos VOD&nbsp;!';
  },

  relatedDirectorToFollow: function(){
    this.title = 'Voulez-vous également ajouter à vos listes&nbsp;?';
    this.content = '<ul><li> - <a data-placement="left" data-id="%id%" class="fav fav-person underline">le réalisateur "%name%"</a></li>%more%</ul>';
  },

  relatedToFollow: function(){
    this.title = 'Voulez-vous également ajouter à vos listes&nbsp;?';
    this.content = '<ul>%more%</ul>';
  }
  
});
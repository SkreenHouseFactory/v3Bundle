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
      this.display(this.title,this.content,timeout);
    } else {
      console.log('scripts/dialog.js', 'Dialog.init', 'This method does not exist.');
    }
  },

  display: function(titre, content, delay_timeout){
    if (typeof delay_timeout == 'undefined') delay_timeout = 6000;
    container  = $('#alert-user');
    if (!container.hasClass('initialized')) {
      $('.glyphicon', container).on('click', function(){
       container.slideUp({duration: 600});
      });
      container.addClass('initialized');
    }
    $('.alert-user-title', container).html(titre);
    $('.alert-user-content', container).html(content);
    container.slideDown({duration: 600});
    if (!isNaN(delay_timeout)) {
     setTimeout( function(){
       container.slideUp({duration: 600});
     }, delay_timeout);
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
    this.content = '<br/>Bravo, %content%c\'est le 1<sup>er</sup> favori dans vos listes&nbsp;!<br/>';
  },

  firstItemsInPlaylist: function(){
    this.title = '%title%';
    this.content = '<br/>Bravo, %content%vous avez %nbfavori% dans vos listes&nbsp;!<br/>';
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
  },

  notConnectedOnProgram: function(){
    this.title = 'Vous souhaitez être averti des diffusions de ce programme&nbsp;?';
    this.content = '<br/><a class="btn btn-primary" data-trigger-click=".bande_listes a.fav-like">Ajouter <i>%name%</i> à vos listes&nbsp;!</a>';
  },
  onDenyFacebookShare: function(){
    this.title = 'Partage Facebook';
    this.content = '<br/>Vous pouvez désactiver le partage Facebook automatique en allant dans vos préférences';
  }
  
});
var Dialog = Class.extend({

  method: null,
  titre: null,
  content: null,

  init: function(method,params,timeout){
    if ($('html').hasClass('touch')) {
      // Pas de Dialog sur les touch devices
      return;
    }
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
    this.content = '<br/><a class="btn btn-primary" href="' + API.config.v3_root + '/start/">Créer ma chaîne</a><br/>';
  },

  fewItemsInPlaylist: function(){
    this.title = 'Vous avez %nbfavori% dans votre chaîne.';
    this.content = '<br/><a class="btn btn-primary" href="' + API.config.v3_root + '/start/">Continuer ma chaîne</a><br/>';
  },

  firstItemInPlaylist: function(){
    this.title = '%title%';
    this.content = '<br/>Bravo, %content%c\'est le 1<sup>er</sup> favori dans votre chaîne&nbsp;!<br/>';
  },

  firstItemsInPlaylist: function(){
    this.title = '%title%';
    this.content = '<br/>Bravo, %content%vous avez %nbfavori% dans votre chaîne&nbsp;!<br/>';
  },  

  paymentPopinEnd: function(){
    this.title = 'Gérer vos films';
    this.content = 'Cliquez sur "Vos vidéos à la demande" pour voir ou revoir vos VOD&nbsp;!';
  },

  relatedDirectorToFollow: function(){
    this.title = 'Voulez-vous également ajouter à votre chaîne&nbsp;?';
    this.content = '<ul><li> - <a data-name="%dataname%" data-placement="left" data-id="%id%" class="fav fav-person underline">le réalisateur "%name%"</a></li>%more%</ul>';
  },

  relatedToFollow: function(){
    this.title = 'Voulez-vous également ajouter à votre chaîne&nbsp;?';
    this.content = '<ul>%more%</ul>';
  },

  notConnectedOnProgram: function(){
    this.title = 'Vous souhaitez être averti des diffusions de ce programme&nbsp;?';
    this.content = '<br/><a class="btn btn-primary" data-trigger-click=".bande_listes a.fav-like">Ajouter <i>%name%</i> à votre chaîne&nbsp;!</a>';
  },
  onDenyFacebookShare: function(){
    this.title = 'Partage Facebook';
    this.content = '<br/>Vous pouvez désactiver le partage Facebook automatique en allant dans vos préférences';
  },
  startLists: function() {
    this.title = 'Patientez ...';
    this.content = '<br/>Paramétrage de votre chaîne en cours';
  }
  
});
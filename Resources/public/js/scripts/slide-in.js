// Fonction JS pour obtenir à partir de n'importe quelle date, le numéro de la semaine dans l'année
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

var SlideIn = Class.extend({

  elmt: null,
  speed_in: 1000,
  speed_out: 250,

  init: function(elmt){
    this.elmt = elmt;
    this.decalage = Math.abs(parseInt(this.elmt.css('right')));
    var today = new Date();
    var weekno = today.getWeek();
    // On change le message de la slide-in toutes les semaines, en tournant sur 3 messages différents
    var test_contenu = parseInt(weekno)%3;
    switch(test_contenu) {
      case 0:
        $('#slide-in-text p+p').html('Toutes les chaînes en REPLAY et en DIRECT sur 1 seul site.');
        break;
      case 1:
        $('#slide-in-text p+p').html('TROUVEZ ou DÉCOUVREZ des programmes que vous aimez.<br/>On vous dit où et comment les regarder.');
        break;
      case 2:
        $('#slide-in-text p+p').html('TV, REPLAY, VOD, CINE, WEB&nbsp;: tous vos programmes sur 1 seule site');
        break;
      default:
        $('#slide-in-text p+p').html('Toutes les chaînes en REPLAY et en DIRECT sur 1 seul site.');
    }
  },

  apparition: function(){
    this.elmt.animate({
      right:"+="+this.decalage,
    }, this.speed_in);
    this.elmt.css('cursor', 'default');
    this.elmt.addClass('open');
    $('#slide-in>div>a').removeClass('open-icon').addClass('close-icon');
    if(!(this.elmt.hasClass('scrolled'))){
      this.elmt.addClass('scrolled');
    }
  },

  disparition: function(){
    this.elmt.animate({
      right:"-="+this.decalage,
    }, this.speed_out);
    this.elmt.css('cursor', 'pointer');
    this.elmt.removeClass('open');
    $('#slide-in>div>a').removeClass('close-icon').addClass('open-icon');;
  },

  isOpened: function(){
    if(this.elmt.hasClass('open')){
      return true;
    } else {
      return false;
    }
  },

  hasScrolled: function(){
    if(this.elmt.hasClass('scrolled')){
      return true;
    } else {
      return false;
    }
  }

});

$( document ).ready(function(){

  var slide_in = new SlideIn($('#slide-in'));

  /*$(window).scroll(function(){
    if(!slide_in.isOpened() && !slide_in.hasScrolled()){
      slide_in.apparition();
    }
  });*/

  $('#slide-in-closer').on('click', function(){
    slide_in.disparition();
  });


  //CHecker quantité de scroll
  
  var old_scroll_top = 0;

  $(document).scroll(function() {
    var current_scroll_top = $(document).scrollTop();
    var scroll_delta = current_scroll_top - old_scroll_top;

    //console.log('scripts/slide-in.js', 'scroll_delta', scroll_delta);

    if((scroll_delta > 100) && !slide_in.isOpened() && !slide_in.hasScrolled()){
      slide_in.apparition();
    }

    if((scroll_delta > 700) && !slide_in.isOpened() && !slide_in.hasScrolled()){
      slide_in.apparition();
    }

    old_scroll_top = current_scroll_top;
  });

});
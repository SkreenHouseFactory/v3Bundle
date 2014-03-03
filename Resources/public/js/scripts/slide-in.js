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
        $('#slide-in-text p+p').html('TV, REPLAY, VOD, CINE, WEB&nbsp;: tous vos programmes sur 1 seul site');
        break;
      default:
        $('#slide-in-text p+p').html('Toutes les chaînes en REPLAY et en DIRECT sur 1 seul site.');
    }
    if(API.cookie('slide-in')){
      this.elmt.addClass('forced');
    }
  },

  apparition: function(){
    this.elmt.animate({
      right:"+="+this.decalage,
    }, this.speed_in);
    this.elmt.css('cursor', 'default');
    this.elmt.addClass('open');
    $('#slide-in #slide-in-text>div>a').removeClass('open-icon').addClass('close-icon');
  },

  disparition: function(){
    this.elmt.animate({
      right:"-="+this.decalage,
    }, this.speed_out);
    this.elmt.css('cursor', 'pointer');
    this.elmt.removeClass('open');
    $('#slide-in #slide-in-text>div>a').removeClass('close-icon').addClass('open-icon');
  },

  isOpened: function(){
    if(this.elmt.hasClass('open')){
      return true;
    } else {
      return false;
    }
  },

  hasBeenForced: function(){
    if(this.elmt.hasClass('forced')){
      return true;
    } else {
      return false;
    }
  }

});

$(document).ready(function(){

  var slide_in = new SlideIn($('#slide-in'));

  $('#slide-in-text a').on('click', function(){
    if($('#slide-in-text a').hasClass('close-icon')){
      slide_in.disparition();
      if(!(slide_in.elmt.hasClass('forced'))){
        slide_in.elmt.addClass('forced');
      }
    } else if($('#slide-in-text a').hasClass('open-icon')){
      slide_in.apparition();
      if(!(slide_in.elmt.hasClass('forced'))){
        slide_in.elmt.addClass('forced');
      }
    }
    if(!API.cookie('slide-in')){
      var date_cookie = new Date();
      date_cookie.setTime(date_cookie.getTime() + (120 * 60 * 1000));
      API.cookie('slide-in', 1, date_cookie);
    }
  });

  //CHecker quantité de scroll
  
  $(document).scroll(function(){
    // console.log($(document).scrollTop());
    if ((($(document).scrollTop() > 300) && ($(document).scrollTop() < 1200))
          && !(slide_in.isOpened()) 
          && !(slide_in.hasBeenForced())){
      slide_in.apparition();
    }

    if ((($(document).scrollTop() < 300) || ($(document).scrollTop() > 1200))
          && slide_in.isOpened() 
          && !(slide_in.hasBeenForced())){
      slide_in.disparition();
    }

  });

});
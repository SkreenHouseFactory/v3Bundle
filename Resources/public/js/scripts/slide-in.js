var SlideIn = Class.extend({

  elmt: null,

  init: function(elmt){
    this.elmt = elmt;
    console.log('scripts/slide-in.js', 'SlideIn.init', 'this', this.elmt);
    this.decalage = Math.abs(parseInt(this.elmt.css('right')));
    console.log('scripts/slide-in.js', 'SlideIn.init', 'decalage', this.decalage);
  },

  apparition: function(){
    this.elmt.animate({
      right:"+="+this.decalage,
    }, 1000);
    this.elmt.css('cursor', 'default');
    this.elmt.addClass('open');
    //$('#closer a img').attr('src', 'img/close_new.png');
    if(!(this.elmt.hasClass('scrolled'))){
      this.elmt.addClass('scrolled');
    }
  },

  disparition: function(){
    this.elmt.animate({
      right:"-="+this.decalage,
    }, 250);
    this.elmt.css('cursor', 'pointer');
    this.elmt.removeClass('open');
    //$('#closer a img').attr('src', 'img/open_new.png');
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

  /*var slide_in = new SlideIn($('#slide-in'));

  $(window).scroll(function(){
    if(!slide_in.isOpened() && !slide_in.hasScrolled()){
      slide_in.apparition();
    }
  });

  $('#slide-in-closer').on('click', function(){
    slide_in.disparition();
  });*/

});
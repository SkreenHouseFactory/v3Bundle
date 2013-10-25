
var PlayerScroll;
PlayerScroll = {
  initPlayerScroll: function() {
    var lastScrollTop = 0;
    var nav = $('.navbar.navbar-fixed-top');
    var playwrap = $('.playwrap');
    var playwrap_offset = 80;  //$('.playwrap').offset();
    var playwrapsub = $('.playwrapsub');
    if( !$('html').hasClass('touch') && ($('body').hasClass('view-program_pere') || $('body').hasClass('view-program_fils') || $('body').hasClass('view-program_fils_saison') || $('body').hasClass('view-ajax'))  ){
      $(window).scroll(function(event){
        if(!$('body').hasClass('playlist-in') && !$('body').hasClass('playlist-w-in') ){
          if ( !$('#program-episodes').hasClass('in') ){
           var st = $(this).scrollTop();
           var panel_synopsis= $('.panel-synopsis').offset();
           var limit = parseInt(panel_synopsis.top) + parseInt($('.panel-synopsis').css('height')) - 365;
           var limit2 = limit - 80 ;
           if (st > lastScrollTop){
             if ($(this).scrollTop() > playwrap_offset) {

               if($(this).scrollTop() >= limit ){
                 playwrap.removeClass("player-fixed-top");
                 playwrap.css('position','absolute');
                 playwrap.css('top',limit2);
                 playwrap.css('z-index','15');

               }
               else{
                 playwrap.css('position','');
                 nav.removeClass('ms-navbarfixed');
                 playwrap.removeClass("player-fixed-top-1");
                 playwrap.addClass("player-fixed-top");
               }
               playwrapsub.removeClass('hide');
               $('#player').addClass('fly-shadows');
               $('#affiche').addClass('fly-shadows')
               nav.slideUp( 100 );
             } 
             else {
               nav.removeClass('ms-navbarfixed');
               playwrap.removeClass("player-fixed-top-1");
               playwrap.removeClass("player-fixed-top");
               playwrap.css('top', '');
               playwrap.css('position','');
               playwrapsub.addClass('hide');
               $('#player').removeClass('fly-shadows');
               $('#affiche').removeClass('fly-shadows');
             }
             if( $('.playwrap').css('position') == "fixed" && parseInt($('.playwrap').css('top')) == 80  ){
              $('.playwrap').animate({top:"-=80"},100);
            }

          }else if(st< lastScrollTop) {

           if( $(this).scrollTop() > playwrap_offset && $(this).scrollTop() <= limit ){
             playwrap.addClass("player-fixed-top");

             playwrap.css('position','fixed');
             playwrap.css('top',0);
           }


           else if($(this).scrollTop() <= 5){
            playwrapsub.addClass('hide');
            playwrap.removeClass("player-fixed-top");
            playwrap.removeClass("player-fixed-top-1");
            playwrap.css('top', '');
            playwrap.css('position','');
            $('#player').removeClass('fly-shadows');
            $('#affiche').removeClass('fly-shadows'); 
            nav.slideDown( 100 );

            $('.playwrap').animate({top:"+=80"},100);

            nav.css('display','block');

          }

          nav.addClass('ms-navbarfixed');


            // upscroll code

          }
          lastScrollTop = st;
          lastScrollTop_2 = st - 5;
        }
        else{ 

               nav.removeClass('ms-navbarfixed');
               nav.slideDown( 100 );
               playwrap.removeClass("player-fixed-top-1");
               playwrap.removeClass("player-fixed-top");
               playwrap.css('top', '');
               playwrap.css('position','');
               playwrapsub.addClass('hide');
               $('#player').removeClass('fly-shadows');
               $('#affiche').removeClass('fly-shadows');
        }
      }
      else{
       if( $(this).scrollTop() <= 5){
         $('body').removeClass('playlist-w-in'); // gestion du scoll lorsque la playlist est in
       }
     }
   });
  }
 }
} 
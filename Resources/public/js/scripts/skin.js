$(document).ready(function(){
  Skin.initHomeSuper();
});
var Skin;
Skin = {
   initHomeSuper: function(){
     if( $('body').hasClass('home-mixte')) {
       $('#item-5200318 .carousel-caption').hide();
       $('body')
         .css('background-repeat','no-repeat')
         .css('background-position','center top')
         .css('background-image','url("http://mskstatic.com/medias/ftp/habillages/supercondriaques/super.jpg")');
       $('.absolute').addClass('hide');
       $('#view-home').prepend('<a class="background-clickable"></a>');
       $('#view-home .container .hometop').prepend('<a href="https://www.facebook.com/supercondriaque?fref=ts" target="_blank" class="fb-link"></a>');
       $('#view-home .container .hometop').prepend('<a href="https://twitter.com/Supercondriaque" class="twitter-link" target="_blank" ></a>');
       $('#view-home .container').css('z-index','2');
       $('.background-clickable').attr("href","http://www.myskreen.com//film/comedies/5200318-supercondriaque/");
     }
   }
}
// var Skin_apps;
// Skin_apps = {
//   initHome: function() {
//     if( $('body').hasClass('home-mixte') && 
//         $('#item-200000064').length) {
//       $('body')
//         .css('background-repeat','no-repeat')
//         .css('background-position','center top')
//         .css('background-color','#4385B9')
//         .css('background-image','url("http://mskstatic.com/medias/ftp/habillages/apps/habillage-apps.jpg")');
//       $('.absolute').addClass('hide');
//       $('body.home-mixte #view-home').prepend('<a class="background-clickable"></a>');
//       $('body.home-mixte .background-clickable').attr("href","http://www.myskreen.com/apps/");
//     }
//   }
// }

// 
// var Skin_bfmtv;
// Skin_bfmtv = {
//   initHome: function() {
// 
//      if( $('body').hasClass('home')) {
//       $('#view-home').css('background-image','url("http://mskstatic.com/medias/ftp/habillages/bfm/background.jpg")');
//       $('#view-home').css('background-repeat','no-repeat');         
//       $('#view-home').css('background-position','center top');   
//       $('.absolute').addClass('hide');
//       $('#view-home').prepend('<a class="background-clickable"></a>');
//       $('#view-home .background-clickable').attr("href","http://www.myskreen.com/bfm-tv/");
//     }
//   }
// }




// var Skin_malavita;
// Skin_malavita = {
//   initHome: function() {
//     if( $('body').hasClass('home-cinema')) {
//       $('#view-home').css('background-image','url("http://mskstatic.com/medias/ftp/home-cinema/malavita/background.jpg")');
//       $('#view-home').css('background-repeat','no-repeat');         
//       $('#view-home').css('background-position','center top');   
//       $('.absolute').addClass('hide');
//       $('#view-home').prepend('<a class="background-clickable"></a>');
//       $('#view-home .background-clickable').attr("href","http://www.myskreen.com/malavita/");
//       $( ".carousel-caption > p > a:contains('Malavita'), .carousel-caption > p:contains('111mn')").hide();  
//     }
//      if( $('body').hasClass('home')) {
//       $('#view-home').css('background-image','url("http://mskstatic.com/medias/ftp/home-cinema/malavita/background.jpg")');
//       $('#view-home').css('background-repeat','no-repeat');         
//       $('#view-home').css('background-position','center top');   
//       $('.absolute').addClass('hide');
//       $('#view-home').prepend('<a class="background-clickable"></a>');
//       $('#view-home .background-clickable').attr("href","http://www.myskreen.com/malavita/");
//       $( ".carousel-caption > p > a:contains('Malavita'), .carousel-caption > p:contains('111mn')").hide();    
//     }
//   }
// }



// Exemple de skin pour la home VOD
// var Skin_cut;
// Skin_cut = {
//   initHome: function() {  
//     if( $('body').hasClass('home-video-a-la-demande')) {
//       $('#view-home').css('background-image','url("http://mskstatic.com/medias/ftp/home-cinema/cut/background.jpg")');
//       $('#view-home').css('background-repeat','no-repeat');         
//       $('#view-home').css('background-position','center top');   
//       $('.absolute').addClass('hide');
//       $('#view-home').prepend('<a class="background-clickable"></a>');
//       $('#view-home .background-clickable').attr("href","http://www.myskreen.com/cut/");
//       $( ".carousel-caption > p > a:contains('Cut'), .carousel-caption > p:contains('36min')").hide();  
//     }

//     }
// }


// 
// var Skin;
// Skin = {
//   initHome: function() {
//     console.log('initSkinHome');    
//     if( ($('body').hasClass('home') || $('body').hasClass('home-cinema')) && $('body').hasClass('skin')) {
//       $('.absolute').addClass('hide');
//       $('#view-home').prepend('<a class="background"></a>');
//       $('#view-home .background').attr("href","http://www.myskreen.com/les-conquerants/");
//       $('#carousel-a-la-une .carousel-inner .item a , #carousel-selection-cinema .carousel-inner .item a').each(function(){
//         var background_image = $(this).css('background-image');
//         background_image = background_image.replace('/1500/', '/970/');
//         console.log(background_image);
//         $('.carousel-caption a:contains("Les conquérants")').parent().parent().addClass('hide');
//         $(this).css('background-image',background_image);
//       });
//     }
//   }
// }


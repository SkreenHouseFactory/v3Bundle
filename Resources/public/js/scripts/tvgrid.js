
// -- GridView
var GridView;
GridView = {
  elmt: null,
  channels: null,
  hour: null,
  timestamp: null,
  timestamp_start: null,
  channel_img_width: 55,
  timeout: null,
  init: function(elmt) {
    console.log('GridView.init', elmt);
    var self = this;
    this.elmt = elmt;
    this.channels = $('#channels', elmt);
    this.timestamp = this.elmt.data('timestamp');
    this.timestamp_start = this.elmt.data('timestamp');
    this.load();
  },  
  idle: function(initialized) {
  
    var self = this;
    var div = this.elmt;
    //update cache
    var cache = $('.schedule-cache', div);
    var time = parseInt(new Date()/1000);
    var mn = Math.round((time - parseInt(div.data('timestamp')))/60);
    console.log('GridView.idle', 'mn', mn);
    if (!$('.time-bar').hasClass('hide')){
      GridView.updateTimeBar();
    }
    if (mn > 60) {
      cache.css('width', '100%');
    } else {
      if (mn > 180) {
        console.log('forward', mn);
        //todo refresh
        window.refresh();
      } else {
        cache.animate({width: mn * 5 }, 3000, function(){
          console.log('GridView.idle', 'animate cache', mn + 'mn');
          //update is live
          $('ul', div).each(function(){
            var live = $(this).find('li.is-live:first');
            //console.log('GridView.idle', 'animate .is-live ' + $(this).attr('id'), parseInt(live.data('end')), '<=', time);
            //move live class + label
            
          });
      
        });
        //hide actions
        $('#channels .actions').addClass('hide');
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function(){
        self.idle(true);
      }, 60000);
    }
    
  },
  updateTimeBar: function(){
   var newPixel1 = parseInt($('.time-bar').css('left')) + 5.2;
   $('.time-bar').css('left',newPixel1);
   $('.arrow').css('left',newPixel1 - 6);
   if(parseInt($('.time-bar').css('left')) >= 990){
      $('.time-bar').addClass('hide');
   }  
  },
  setTimeBar: function(){
    //mise en place de la Bar de temps.
      //checking Ajax Request
      if( $.active != 0 ){
        $(document).ajaxStop(function(){
          $('#channels .actions .fav-on').parent().removeClass('hide');
          if( $('.now').hasClass('active') ){
            var now = new Date();
            var time2Pixel =Math.round( (87 + now.getMinutes() * 5) / 10) * 10;
            $('.time-bar').css('left',time2Pixel);
            $('.arrow').css('left',time2Pixel - 6);
            $('.time-bar,.arrow').removeClass('hide');
          }
          else{
            $('.time-bar,.arrow').addClass('hide');
          }
    
          //hide .actions button
          $('#channels li ul li').on('mouseover',function(){
            if( !$('.actions',this).children().hasClass('fav-on') ){
              $('.actions',this).removeClass('hide');
            }
          });
          $('#channels li ul li').on('mouseout',function(){
            if( !$('.actions',this).children().hasClass('fav-on') ){
              $('.actions',this).addClass('hide');
            }
          });
        });
      }
      else{
        $('#channels .actions .fav-on').parent().removeClass('hide');
        if( $('.now').hasClass('active') ){
          var now = new Date();
          var time2Pixel =Math.round( (89 + now.getMinutes() * 5) / 10) * 10;
          $('.time-bar').css('left',time2Pixel);
          $('.arrow').css('left',time2Pixel - 6);
          $('.time-bar,.arrow').removeClass('hide');
          
        }
        else{
          $('.time-bar,.arrow').addClass('hide');
        }

        $('#channels li ul li').on('mouseover',function(){
          if( !$('.actions',this).children().hasClass('fav-on') ){
            $('.actions',this).removeClass('hide');
          }
        });
        $('#channels li ul li').on('mouseout',function(){
          if( !$('.actions',this).children().hasClass('fav-on') ){
            $('.actions',this).addClass('hide');
          }
        });
      }
  },
  load: function(timestamp, callback) {
    console.log('GridView.load', 'timestamp', timestamp);
    var self = this;
    //popover
    $('[rel="popover"]', this.elmt).popover();
    //sortable
    this.channels.sortable({ containment: 'parent', cursor: 'move', stop: function( event, ui ) {
      self.setChannelsList();
    }});
    //connected ?
    if (Skhf.session.datas.email) {
      console.log('GridView.load', 'user epg', Skhf.session.datas.email);
      //reload schedule
      this.loadSchedule(function(){
        self.idle();
      });
    } else {
      this.idle();
      this.channels.fadeIn();
    }
    GridView.setTimeBar();
    
  },
  loadSchedule : function(callback) {
    console.log('GridView.loadSchedule', 'timestamp', this.timestamp, new Date(this.timestamp*1000).toString());
      $('#grid h2 time').attr('timestamp',this.timestamp);
    var self = this;
    var channel_ids = this.getChannelsIds();
    //loader
    this.channels.html('<li></li>').show();
    UI.appendLoader($('li', this.channels));
    //today
    var date = new Date();
    //schedule
    var url = this.elmt.data('reload-ajax') + '?schedule-only=1&date=' + this.timestamp + 
              '&channels_ids=' + channel_ids + '&session_uid=' + Skhf.session.uid + (Skhf.session.datas.email ? '&time=' + new Date().getTime() : '');
    this.channels.load(url, function(){
        //popover
        $('[rel="popover"]', self.elmt).popover();

        //add in-playlists class
        if (Skhf.session.datas.email) {

          var queue = Skhf.session.datas.queue.split(',');

          //toggle playlist triggers
          UI.loadPlaylistTriggers('like', queue, self.elmt);
          
          for (k in queue) {
            //console.log('GridView.loadSchedule', '.playlist', 'try', queue[k])
            if ($('ul li[data-program-id="' + queue[k] + '"]', self.elmt).length) {
              //console.log('GridView.loadSchedule', '.playlist', 'add', queue[k])
              $('ul li[data-program-id="' + queue[k] + '"]', self.elmt).addClass('in-playlists');
            }
          }
        }
        if (typeof callback != 'undefined') {
          callback();
        }
        
        $('#channels li ul li').on('mouseover',function(){
          if( !$('.actions',this).children().hasClass('fav-on') ){
            $('.actions',this).removeClass('hide');
          }
        });
        $('#channels li ul li').on('mouseout',function(){
          if( !$('.actions',this).children().hasClass('fav-on') ){
            $('.actions',this).addClass('hide');
          }
        });
        $('.glyphicon.glyphicon-question-sign').on('mouseover',function(){
        $(this).parent().tooltip('show');
        });
        $('.glyphicon.glyphicon-question-sign').on('mouseout',function(){
        $(this).parent().tooltip('show');
        });

    }); 
    
  },
  setTime: function(timestamp, resetDate) {
    console.log('GridView.setTime', timestamp);
    this.elmt.data('timestamp', timestamp);
    this.timestamp = timestamp;
    
    if($(".time-change").hasClass('active')){
      $(".time-change").removeClass('active');
    }
    if (typeof resetDate != 'undefined' && resetDate) {
      GridView.timestamp_start = timestamp;
    }
    var date = new Date(timestamp*1000);
    this.hour = date.getHours();
    switch(date.getDay()) {
       case 0: var day = 'Dimanche'; break;
       case 1: var day = 'Lundi'; break;
       case 2: var day = 'Mardi'; break;
       case 3: var day = 'Mercredi'; break;
       case 4: var day = 'Jeudi'; break;
       case 5: var day = 'Vendredi'; break;
       case 6: var day = 'Samedi'; break;
    }
   
    //var time = date.toLocaleTimeString().replace('00:00', '00');
    var CurrentDate = new Date();
    var datestring = date.toLocaleDateString()
      .replace('/1/', ' Janvier ')
      .replace('/2/', ' Février ')
      .replace('/3/', ' Mars ')
      .replace('/4/', ' Avril ')
      .replace('/5/', ' Mai ')
      .replace('/6/', ' Juin ')
      .replace('/7/', ' Juillet ')
      .replace('/8/', ' Août ')
      .replace('/9/', ' Septembre ')
      .replace('/10/', ' Octobre ')
      .replace('/11/', ' Novembre ')
      .replace('/12/', ' Décembre ');
      
    if( date.getDate() == CurrentDate.getDate() && date.getHours()==CurrentDate.getHours()){
      $('.now.time-change').addClass('active');
    }
    
    if( date.getDate() == CurrentDate.getDate() && date.getHours()>=20 ){
      $('.tonight.time-change').addClass('active');
    }
    if( date.getDate() == CurrentDate.getDate()-1 && date.getHours()>=20 ){
      $('.yesterdaynight.time-change').addClass('active');
    }
    
    $('h2 time').html(day + ' ' + datestring + ' ');// + ' - ' + time);
    
    //timeline
    $('.timeline li:nth-child(2)').html(date.getHours()%24 + 'h00');
    $('.timeline li:nth-child(3)').html((date.getHours() + 1)%24 + 'h00');
    $('.timeline li:last-child').html((date.getHours() + 2)%24 + 'h00');
    // modification select current-hour
    $('#opt-hour').data('current-hour',date.getHours()%24);
    $('#opt-hour').val(date.getHours()%24);
    
    $('.time-bar').addClass('hide');
    $('.time-bar-icon').addClass('hide');
    GridView.setTimeBar();
    
   },
  filter: function(onglet) {
    console.log('GridView.filter', onglet);
    if (onglet == 'in-playlists' && 
        !Skhf.session.datas.email) {
      UI.auth(function(){
        if (Skhf.session.datas.email) {
          GridView.filter(onglet);
        }
      });
      return;
    }
   
    $('> li', this.channels).show();
   
    if (onglet) {
      
      $('> li > ul > li.diff:not(.' + onglet + ')', this.channels).animate({opacity: 0.1});
      $('> li', this.channels).each(function(){
      
        if ($('ul > li.diff.' + onglet, $(this)).length) {
          $('ul > li.diff.' + onglet, $(this)).animate({opacity: 1});
        } else {
          $(this).hide();
          
        }
        
       
      });
       
    } else {
      $('> li > ul > li.diff', this.channels).animate({opacity: 1});
    }
    console.log('channels :visible ',$('> li:visible', this.channels).length);
    if(!$('> li:visible', this.channels).length){
      $('#channels').prepend('<li class=\'noprogram\'> Aucun programme trouvé </li>');
    }
    else{
      $('#channels .noprogram').remove();
    }
    //affiche la barre de temps 
    GridView.setTimeBar();
  
  },
  getChannelsIds: function(){
    
    console.log('GridView.getChannelsIds', this.channels.sortable('toArray', {attribute: 'data-id'}).join(','));
    return this.channels.sortable('toArray', {attribute: 'data-id'}).join(',');
  },
  setChannelsList: function(callback){
    var self = this;
    var refresh = function() {
      console.log('GridView.setChannelsList', 'refresh', callback);
      $('.modal .modal-message').html('<p>Créez votre compte en 1 clic pour personnaliser votre programme TV.</p>');
      if (Skhf.session.datas.email) {
        if (typeof callback != 'undefined') {
          callback();
        }
        API.addPreference('epg', self.getChannelsIds());
      } else {
        if (!$('.modal:visible').length) {
          self.channels.sortable('cancel');
        }
      }
    }
    if (!Skhf.session.datas.email) {
      UI.auth(refresh)
    } else {
      refresh();
    }
  }
}







// -- tvgrid

$(document).ready(function(){

  if ($('#view-tvgrid').length) {
     //affiche la barre de temps 
    //////////// CALLBACKS ////////////////
    // -- session sync
    Skhf.session.callbackInit = function() {
      GridView.init($('#grid'));
      GridView.setTimeBar();
    }
    Skhf.session.callbackSignout = function() {
      GridView.loadSchedule();
      GridView.setTimeBar();
    }
    Skhf.session.callbackSignin = function() {
      if (Skhf.session.datas.epg) {
        console.log('scripts/tvgrid.js', 'callbackSignin', 'epg', Skhf.session.datas.epg);
        GridView.loadSchedule();
        GridView.setTimeBar();
      }
    }
    // -- UI callback : reload grid after adding channel
    UI.callbackTogglePlaylist = function(parameter, value, remove, trigger) {
      if (parameter == 'epg' && !remove) {
        Grid.loadSchedule();
      }
      if (parameter == 'like') {
        if (remove) {
          trigger.removeClass('btn-primary');
        } else {
          trigger.addClass('btn-primary');
        }
      }
    }
    //////////// SCRIPTS ////////////////
    //chargement Ajax
    if($('body').hasClass('view-ajax')){
      GridView.init($('#grid'));
    }
    //timeslider
    var date = new Date(parseInt($('#grid').data('timestamp'))*1000);
    GridView.hour = date.getHours();
   /* $('#timeslider').slider({
      step: 1,
      max: 23,
      min: 0,
      value: GridView.hour,
      change: function(event, ui) {
        var diff = GridView.hour - ui.value;
        if (diff != 0) {
          console.log('scripts/tvgrid.js', 'timeslider', 'change', GridView.hour, '+', diff, GridView.hour - diff);
          GridView.setTime(GridView.timestamp_start - diff*3600);
          GridView.loadSchedule();
        }
      },
      slide: function(event, ui) {
        //console.log('scripts/tvgrid.js', 'timeslider', 'stop', ui.value);
        $('.ui-slider-handle').html(ui.value + 'h00');
      },
      create: function( event, ui ) {
        $('.ui-slider-handle').addClass('btn')
                              .html(GridView.hour + 'h00');
      }
    }); */
   
     //
   
     
     $('#opt-hour').on('change',function(){
       var current = $(this).data('current-hour');
       var nhour = $(this).val();
       var diff =  current - nhour;
        GridView.setTime( $('#grid').data('timestamp') - diff*3600);
        GridView.loadSchedule();
     });
     $('.btn-precedent').on('click', function(){
      
       GridView.setTime( $('#grid').data('timestamp') - 3600);
       GridView.loadSchedule();
     
     });
     $('.btn-suivant').on('click', function(){
       GridView.setTime( $('#grid').data('timestamp') + 3600);
       GridView.loadSchedule();
     
     });
    //datepicker
    var datepicker = $('#datepicker');
    datepicker.hide();
    datepicker.hover(function(){},function(){
      datepicker.hide();
    });
    $('.calendar').click(function(){
      if(!datepicker.is(':visible')) {
        datepicker.show();
      } else {
        datepicker.hide();
      }
    });
    $.datepicker.setDefaults($.datepicker.regional['fr']);
    datepicker.datepicker({
       showAnim: 'drop',
       maxDate: '+11d',
       onSelect: function(dateText, inst) {
        var date = (inst.selectedMonth + 1) + '/' + inst.selectedDay + '/' +  inst.selectedYear;
        var timestamp = (Date.parse(date) / 1000) + GridView.hour * 3600;
                console.log('script/tvGridView.js', 'datepicker.onSelect', dateText, timestamp, GridView.hour, inst);
        GridView.setTime(timestamp, true);
        GridView.loadSchedule(function(){
          datepicker.fadeOut('slow');
        });
       }
    });
    //dropdown update
    
    $('.btn-filters > a').on('click', function(){
      console.log('filter', $(this).data('filter'));
      $('#filter').val($(this).data('filter')).change();
    });
    
    $('#filter').on('change',function(){
      console.log('script/tvGridView.js', $(this).val());
      //grid
      GridView.filter($(this).val());
      //sliders
      if ($(this).val()) {
        $('.items li').hide();
        $('.items li.'  + $(this).val()).show();
      } else {
        $('.items li').show();
      }
      //menu update
      if ($(this).parents('.dropdown:first').length) {
        $(this).parents('.dropdown:first').find('a.dropdown-toggle span').text($(this).text());
      }
      $(this).parents('.open:first').removeClass('open');
      return false;
    });

    //remove channel
    $(document).on('click', '#channels li a', function() {
      return false;
    })
    $(document).on('click', '#channels a .icon-trash', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).parents('li:first').remove();
      GridView.setChannelsList();
      return false;
    })
  }
});


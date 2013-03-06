// -- tvgrid
$(document).ready(function(){
	if ($('#view-tvgrid').length) {

		//session
		Skhf.session.callbackInit = function() {
		  Grid.init($('#grid'));
		}
		Skhf.session.callbackSignout = function() {
		  Grid.loadSchedule();
		}
		Skhf.session.callbackSignin = function() {
		  Grid.loadSchedule();
		}

		//datepicker
		var datepicker = $('#datepicker');
    $('li.calendar a').click(function(){
      if(!datepicker.is(':visible')) {
        datepicker.show();
      } else {
        datepicker.hide();
			}
    });
    datepicker.hide();
    datepicker.datepicker({
    	 showAnim: 'drop',
       maxDate: '+11d',
       onSelect: function(dateText, inst) {
				var timestamp = Date.parse(dateText) / 1000;
        console.log(dateText, timestamp, inst);
				Grid.setTime(timestamp);
				Grid.loadSchedule(function(){
	        datepicker.fadeOut('slow');
				});
       }
    });
   	datepicker.datepicker('option', $.datepicker.regional['fr'] );
    datepicker.hover(function(){},function(){
      datepicker.hide();
    });

		//dropdown update
		$('a[data-filter]').click(function(){
			console.log('script/tvgrid.js', $(this).data('filter'));
			//grid
			Grid.filter($(this).data('filter'));
			//sliders
			if ($(this).data('filter')) {
				$('.items li').hide();
				$('.items li.'  + $(this).data('filter')).show();
			} else {
				$('.items li').show();
			}
			//menu update
			if ($(this).parents('li.dropdown:first').length) {
				$(this).parents('li.dropdown:first').find('a.dropdown-toggle span').text($(this).text());
			}
			return false;
		});

		//remove channel
		$('#channels li a').live('click', function() {
			return false;
		})
		$('#channels a .icon-trash').live('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).parents('li:first').remove();
			Grid.setChannelsList();
			return false;
		})

		//timeline
		$('#grid').scrollspy({
        min: -100,
        max: 300,
        onEnter: function(element, position) {
					Grid.elmt.find('.timeline').addClass('fixed');
					console.log('script tvgrid', 'scrollspy', 'enter', position);
        },
        onLeave: function(element, position) {
					Grid.elmt.find('.timeline').removeClass('fixed');
					console.log('script tvgrid', 'scrollspy', 'leave', position);
        }
    });
	}
});

// -- Grid
var Grid;
Grid = {
	elmt: null,
	channels: null,
	timestamp: null,
	channel_img_width: 55,
	timeout: null,
	init: function(elmt) {
		console.log('Grid.init', elmt);
		var self = this;
		this.elmt = elmt;
		this.channels = $('#channels', elmt);
		this.timestamp = this.elmt.data('timestamp');

		this.load();
	},
	idle: function(initialized) {
		/*
		var self = this;
		var div = this.elmt;
		//update cache
		var cache = $('.schedule-cache', div);
		var time = parseInt(new Date()/1000);
		var mn = Math.round((time - parseInt(div.data('timestamp')))/60);
		console.log('Grid.idle', 'mn', mn);
		if (mn > 60) {
			cache.css('width', '100%');
		} else {
			if (mn > 180) {
				console.log('forward', mn);
				//todo refresh
				window.refresh();
			} else {
				cache.animate({width: mn * 5 }, 3000, function(){
					console.log('Grid.idle', 'animate cache', mn + 'mn');

					//update is live
					$('ul', div).each(function(){
						var live = $(this).find('li.is-live:first');
						//console.log('Grid.idle', 'animate .is-live ' + $(this).attr('id'), parseInt(live.data('end')), '<=', time);
						//move live class + label
						if (parseInt(live.data('end')) <= time) {
							$('.label-warning', live).appendTo($('a ruby rt', live.next()));
							live.removeClass('is-live').next().addClass('is-live');
							if (live.hasClass('has-live')) {
								live.removeClass('has-live').next().addClass('has-live');
							}
						}
					})
			
				});
			}
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function(){
				self.idle(true);
			}, 60000);
		}
		*/
	},
	load: function(timestamp, callback) {
		console.log('Grid.load', 'timestamp', timestamp);
		var self = this;
		//popover
		$('[rel="popover"]', this.elmt).popover();
		//sortable
	  this.channels.sortable({ containment: 'parent', cursor: 'move', stop: function( event, ui ) {
			self.setChannelsList();
	  }});
		//connected ?
		if (Skhf.session.datas.email) {
			console.log('Grid.load', 'user epg', Skhf.session.datas.email);
			//reload schedule
			this.loadSchedule(function(){
				self.idle();
			});
		} else {
			this.idle();
		}
	},
	loadSchedule : function(callback) {
		console.log('Grid.loadSchedule', 'timestamp', this.timestamp);
		var self = this;
		var channel_ids = this.getChannelsIds();
		//loader
		this.channels.empty();
		UI.appendLoader(this.channels);
		//schedule
		var url = this.elmt.data('ad-ajax') + '?schedule-only=1&date=' + this.timestamp + 
																							'&channels_ids=' + channel_ids + '&session_uid=' + Skhf.session.uid;
		this.channels.load(url, function(){
				//popover
				$('[rel="popover"]', self.elmt).popover();
				//add playlist class
				if (Skhf.session.datas.email) {
					for (k in Skhf.session.datas.queue) {
						//console.log('Grid.loadSchedule', '.playlist', 'try', Skhf.session.datas.queue[k])
						if ($('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]', self.elmt).length) {
							//console.log('Grid.loadSchedule', '.playlist', 'add', Skhf.session.datas.queue[k])
							$('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]', self.elmt).addClass('is-playlist');
						}
					}
				}
				if (typeof callback != 'undefined') {
					callback();
				}
		});
	},
	setTime: function(timestamp) {
		console.log('Grid.setTime', timestamp);
		this.elmt.data('timestamp', timestamp);
		this.timestamp = timestamp;
		var date = new Date(timestamp*1000);
		switch(date.getUTCDay()) {
			 case 0: var day = 'Dimanche'; break;
			 case 1: var day = 'Lundi'; break;
			 case 2: var day = 'Mardi'; break;
			 case 3: var day = 'Mercredi'; break;
			 case 4: var day = 'Jeudi'; break;
			 case 5: var day = 'Vendredi'; break;
			 case 6: var day = 'Samedi'; break;
		}
		var time = date.toLocaleTimeString().replace('00:00', '00');
		var date = date.toLocaleDateString().replace('/1/', ' Janvier ')
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
		$('h1 time').html(day + ' ' + date + ' - ' + time);
	},
	filter: function(onglet) {
		console.log('Grid.filter', onglet);
		if (onglet == 'in-playlists' && 
				!Skhf.session.datas.email) {
			UI.auth(function(){
				if (Skhf.session.datas.email) {
					Grid.filter(onglet);
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
	},
	getChannelsIds: function(){
		console.log('Grid.getChannelsIds', this.channels.sortable('toArray', {attribute: 'data-id'}).join(','));
    return this.channels.sortable('toArray', {attribute: 'data-id'}).join(',');
	},
	setChannelsList: function(callback){
    var self = this;
		var refresh = function() {
			console.log('Grid.setChannelsList', 'refresh', callback);
      $('.modal .modal-body').prepend('<p class="alert alert-success">Créez votre compte en 1 clic pour personnaliser votre programme TV.</p>');
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
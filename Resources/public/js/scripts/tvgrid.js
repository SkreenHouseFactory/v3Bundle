// -- tvgrid
$(document).ready(function(){
	if ($('#view-tvgrid').length) {

		//need session
		Skhf.session.callbackInit = function() {
		  Grid.init($('#grid'));
		}

	  $('#grid').disableSelection();

		//dropdown update
		$('.dropdown-update ul li a').click(function(){
			//console.log('script', 'tvgrid', 'dropdown-update', $(this).text(), $(this).parents('a.dropdown-toggle:first'));
			$(this).parents('li.dropdown:first').find('a.dropdown-toggle span').text($(this).text());
			Grid.filter($(this).data('filter'));
			return false;
		});

		//remove popover
		$('.popover .close').live('click', function() {
			console.log('script', 'tvgrid', 'popovers destroy', $('.popover'));
			$('.popover').remove();
			return false;
		})

		//nav next/prev
		$('.left a, .right a, .now a', this.elmt).click(function(){
			if ($(this).parent().hasClass('right')) {
				Grid.schedule.jqxScrollView('forward'); 
			} else if ($(this).parent().hasClass('left')) {
				Grid.schedule.jqxScrollView('back'); 
			} else {
				Grid.schedule.jqxScrollView('changePage', 49); ; 
			}
			return false;
		})

		//remove channel
		$('#channels li a').live('click', function() {
			return false;
		})
		$('#channels a .icon-trash').live('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var trigger = $(this);
			Grid.setChannelsList(function(){
				trigger.parent().remove();
			});
			return false;
		})

		//sortable
	  $('#channels').sortable({ containment: 'parent', cursor: 'move', stop: function( event, ui ) {
			Grid.setChannelsList();
	  }});

		//timeline
		$('#grid').scrollspy({
        min: -100,
        max: 300,
        onEnter: function(element, position) {
					Grid.getSchedule().find('.timeline').addClass('fixed');
					console.log('script tvgrid', 'scrollspy', 'enter', position);
        },
        onLeave: function(element, position) {
					Grid.getSchedule().find('.timeline').removeClass('fixed');
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
	schedule: null,
	currentPage: 50,
	timestamp: 50,
	height: 900,
	width: 900,
	channel_img_width: 45,
	timeout: null,
	init: function(elmt) {
		console.log('Grid.init', elmt);
		var self = this;
		this.elmt = elmt;
		this.channels = $('#channels', elmt);
		this.schedule = $('#schedule', elmt);
		this.timestamp = $('.schedule[data-timestamp]', elmt).data('timestamp');

		this.load();
	},
	reset: function() {
		var self = this;
		this.schedule.fadeOut('slow');
		$('.schedule[data-timestamp]', this.schedule).empty().data('timestamp', '');
		this.load(function(){
			self.schedule.fadeIn('slow');
		});
	},
	refresh: function() {
		var self = this;
		//load channels
		this.getChannelsList();
		//load schedule
		$('.schedule[data-timestamp]', this.schedule).each(function() {
			$(this).empty();
			UI.appendLoader($(this));
			Grid.loadSchedule($(this), $(this).data('timestamp'));
		});
	},
	idle: function(initialized) {
		var self = this;
		var div = this.getSchedule();
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
				this.schedule.jqxScrollView('forward');
				var div = this.getSchedule();
				$('ul', div).each(function(){
					var live = $(this).find('li:first');
					//add live class
					live.addClass('is-live');
					//add live label
					if ($('#channels li[data-id="' + parseInt(live.parent().attr('id')) + '"]').data('live')) {
						$('a ruby rt', live).append('<span class="lable label-warning">Live</span>');
						live.addClass('has-live');
					}
				})
				//$('.schedule.live', self.schedule).removeClass('live');
				//div.addClass('live');
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
	},
	load: function(timestamp, callback) {
		var self = this;
		startDiv = this.getSchedule();
		//timeline
		$('.timeline', startDiv).addClass('fixed');
		timestamp = typeof timestamp != 'undefined' ? timestamp : parseInt(startDiv.data('timestamp'));
		//popover
		$('[rel="popover"]', startDiv).popover();
		//connected ?
		if (Skhf.session.datas.email) {
			console.log('Grid.load', 'email', Skhf.session.datas.email, timestamp);
			//reload schedule
			startDiv.empty();
			UI.appendLoader(startDiv);
			this.loadSchedule(startDiv, timestamp, function(){
				self.idle();
			});
			//load channels
			this.getChannelsList();
		} else {
			this.idle();
		}

		//load before / after
		this.loadSchedule(startDiv.prev(), timestamp - 3*3600);
		this.loadSchedule(startDiv.next(), timestamp + 3*3600);
		this.loadSchedule(startDiv.prev().prev(), timestamp - 2*3*3600);
		this.loadSchedule(startDiv.next().next(), timestamp + 2*3*3600);

		this.scrollView();
	},
	loadSchedule : function(elmt, timestamp, callback) {
		var self = this;
		//loader
		UI.appendLoader(elmt);
		//timestamp
		if (!elmt.data('timestamp')) {
			elmt.data('timestamp', timestamp);
		}
		//schedule
		//'&session_uid=' + Skhf.session.uid
		elmt.load(this.schedule.data('ajax') + '?schedule-only=1&date=' + timestamp + '&channels_ids=' + this.getChannelsIds(), function(){
				//popover
				$('[rel="popover"]', elmt).popover();
				//add playlist class
				if (Skhf.session.datas.email) {
					for (k in Skhf.session.datas.queue) {
						//console.log('Grid.loadSchedule', '.playlist', 'try', Skhf.session.datas.queue[k])
						if ($('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]', elmt).length) {
							//console.log('Grid.loadSchedule', '.playlist', 'add', Skhf.session.datas.queue[k])
							$('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]', elmt).addClass('is-playlist');
						}
					}
				}
				if (typeof callback != 'undefined') {
					callback();
				}
		});
	},
	getSchedule: function(page) {
		var page = typeof page != 'undefined' ? page : this.currentPage;
		//console.log('Grid.getSchedule', '[data-page="' + page + '"]')
		return $('.schedule[data-page="' + page + '"]', this.schedule);
	},
	setTime: function(timestamp) {
		console.log('Grid.setTime', timestamp);
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
		if (onglet == 'in-playlists' && 
				!Skhf.session.datas.email) {
			UI.auth(function(){
				if (Skhf.session.datas.email) {
					Grid.filter(onglet);
				}
			});
			return;
		}
		if (onglet) {
			$('li:not(.' + onglet + ')', this.schedule).animate({opacity: 0.1});
			$('li.' + onglet, this.schedule).animate({opacity: 1});
		} else {
			$('li', this.schedule).animate({opacity: 1});
		}
	},
	getChannelsIds: function(){
    return this.channels.sortable('toArray', {attribute: 'data-id'}).join(',')
	},
	getChannelsList: function(){
    var self = this;
		console.log('Grid.getChannelsList');
		API.query('GET', this.schedule.data('api'), {
			session_uid: Skhf.session.uid,
			type: 'broadcast',
			channel_img_width : this.channel_img_width,
		}, function(data){
			console.log('Grid.getChannelsList', 'callback', data);
			self.channels.empty();
			for (k in data.channels) {
				var c = data.channels[k];
				self.channels.append('<li data-id="' + c.id + '"><a href="' + c.seo_url + '">' +
														 '<i class="icon-trash"></i><img src="' + c.img + '"  alt="' + c.name + '" /></a></li>');
			}
		})
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
				Grid.refresh();
			} else {
				//TODO : on hide modal ?
				self.channels.sortable('cancel');
			}
		}
		if (!Skhf.session.datas.email) {
			UI.auth(refresh)
		} else {
			refresh();
		}
	},
	scrollView: function() {
		console.log('Grid.scrollView', this.schedule);
    var self = this;
    this.schedule.jqxScrollView({ width: this.width, 
																  height: this.height, 
																  currentPage: this.currentPage-1});

	  this.schedule.bind('pageChanged', function (event) {
			$('.popover').remove();
			self.currentPage = event.args.currentPage+1;
			var div = self.getSchedule();
			self.setTime(div.data('timestamp'));
			$('.schedule.current', self.schedule).removeClass('current');
			div.addClass('current');
			console.log('Grid.scrollView', 'pageChanged', self.currentPage, self.timestamp);
			//preload : before / after
			if (self.currentPage < 50) {
				var prev = div.prev().prev();
				if (isNaN(prev.data('timestamp'))) {
					var new_timestamp = self.timestamp - ((50-parseInt(prev.data('page'))) * 3*3600);
					//console.log('Grid.scrollView', 'pageChanged prev', prev.data('page'), new_timestamp);
					Grid.loadSchedule(prev, new_timestamp);
				}
			} else {
				var next = div.next().next();
				if (isNaN(next.data('timestamp'))) {
					var new_timestamp = self.timestamp + ((parseInt(next.data('page')) - 50) * 3*3600);
					//console.log('Grid.scrollView', 'pageChanged next', next.data('page'), new_timestamp);
					Grid.loadSchedule(next, new_timestamp);
				}
			}
		});
	}
}
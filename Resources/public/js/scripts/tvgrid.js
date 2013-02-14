// -- tvgrid
$(document).ready(function(){
	if ($('#view-tvgrid').length) {

	  Grid.init($('#grid'));

		//dropdown update
		$('.dropdown-update ul li a').click(function(){
			$(this).parents('a:first').text($(this).text());
			Grid.filter($(this).data('filter'));
			return false;
		});

		//sortable
	  $( "#channels" ).sortable({ containment: 'parent', cursor: 'move', stop: function( event, ui ) {
			var ids = $(this).sortable('toArray', {attribute: 'data-id'}).join(',');
			console.log('ids', ids);
			var reset = function() {
				if (Skhf.session.datas.email) {
					API.addPreference('epg', ids);
					Grid.reset();
				}
			}
			if (!Skhf.session.datas.email) {
				UI.auth(reset)
			} else {
				reset();
			}
	  }});
	  $( "#channels" ).disableSelection();

	}
});

// -- Grid
var Grid;
Grid = {
	elmt: null,
	channels: null,
	schedule: null,
	currentPage: 50,
	height: 700,
	width: 900,
	timeout: null,
	init: function(elmt) {
		console.log('Grid.init', elmt);
		var self = this;
		this.elmt = elmt;
		this.channels = $('#channels', elmt);
		this.schedule = $('#schedule', elmt);

		this.scrollView();
		this.load();
					
		//nav
		$('.arrow', this.elmt).click(function(){
			if ($(this).hasClass('right')) {
				self.schedule.jqxScrollView('forward'); 
			} else {
				self.schedule.jqxScrollView('back'); 
			}
		})
	},
	reset: function() {
		var self = this;
		this.schedule.fadeOut('slow');
		$('.schedule[data-timestamp]', this.schedule).empty().data('timestamp', '');
		this.load(function(){
			self.schedule.fadeIn('slow');
		});
	},
	idle: function() {
		var self = this;
		var div = this.getCurrentSchedule();
		//update cache
		var cache = $('.schedule-cache', div);
		var time = parseInt(new Date()/1000);
		var mn = Math.round((time - parseInt(div.data('timestamp')))/60);
		if (mn > 180) {
			console.log('forward', mn);
			this.schedule.jqxscrollView('forward'); 
		} else {
			cache.animate({width: mn * 5 }, 3000, function(){
				console.log('Grid.idle', 'animate cache', mn + 'mn');

				//update is live
				$('ul', div).each(function(){
					var live = $(this).find('li.is-live:first');
					console.log('Grid.idle', 'animate .is-live ' + $(this).attr('id'), parseInt(live.data('end')), '<=', time);
					if (parseInt(live.data('end')) <= time) {
						live.removeClass('is-live').next().addClass('is-live');
					}
				})
			
			});
		}
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function(){
			self.idle();
		}, 60000);
	},
	load: function(timestamp, callback) {
		var self = this;
		startDiv = this.getCurrentSchedule();
		timestamp = typeof timestamp != 'undefined' ? timestamp : parseInt(startDiv.data('timestamp'));
		//popover
		$('[rel="popover"]', startDiv).popover();
		//cache
		self.idle();
		//connected ?
		if (!Skhf.session.datas.email) {
			console.log('Grid.load', 'email', Skhf.session.datas.email);
			self.loadSchedule(startDiv, timestamp);
		}
		//load before / after
		self.loadSchedule(startDiv.prev(), timestamp - 3*3600);
		self.loadSchedule(startDiv.next(), timestamp + 3*3600);

		//if (typeof callback != 'undefined') {
		//	callback();
		//}
	},
	loadSchedule : function(elmt, timestamp) {
		var self = this;
		startDiv = this.getCurrentSchedule();
		elmt.load('/app_dev.php/programme-tv/', {
				'schedule-only': 1,
				timestamp: timestamp, 
				session_uid: Skhf.session.uid
			}, function(){
				//popover
				$('[rel="popover"]', elmt).popover();
				//idle
				if (startDiv.data('timestamp') == timestamp) {
					self.idle();
				} else {
					$(this).data('timestamp', timestamp);
				}
				//add playlist class
				if (Skhf.session.datas.email) {
					for (k in Skhf.session.datas.queue) {
						if ($('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]').length) {
							$('ul li[data-program-id="' + Skhf.session.datas.queue[k] + '"]').addClass('is-playlist');
						}
					}
				}
		});
	},
	getCurrentSchedule: function() {
		console.log('Grid.getCurrentSchedule', '[data-page="' + this.currentPage + '"]')
		return $('.schedule[data-page="' + this.currentPage + '"]', this.elmt);
	},
	setTime: function(timestamp) {
		var date = new Date(timestamp*1000);
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
		$('h1 time').html(date + ' - ' + time);
	},
	filter: function(onglet) {
		if (onglet) {
			$('li:not(.' + onglet + ')', this.schedule).animate({opacity: 0.1});
			$('li.' + onglet, this.schedule).animate({opacity: 1});
		} else {
			$('li', this.schedule).animate({opacity: 1});
		}
	},
	scrollView: function() {
		console.log('Grid.scrollView', this.schedule);
    var self = this;
    this.schedule.jqxScrollView({ width: this.width, 
																  height: this.height, 
																  currentPage: this.currentPage-1});

	  this.schedule.bind('pageChanged', function (event) {
			$('.popover').popover('hide');
			self.currentPage = event.args.currentPage+1;
			var div = self.getCurrentSchedule();
			console.log('Grid.scrollView', 'pageChanged', self.currentPage);
			//before
			if (self.currentPage < 50) {
				var prev = div.prev().prev();
				if (!prev.html()) {
					var timestamp = parseInt(div.data('timestamp')) - ((50-parseInt(prev.data('page'))) * 3*3600);
					console.log('Grid.scrollView', 'pageChanged prev', prev.data('page'), timestamp);
					Grid.loadSchedule(prev, timestamp);
				}
				self.setTime(prev.data('timestamp'));
			} else {
				var next = div.next().next();
				if (!next.html()) {
					var timestamp = parseInt(div.data('timestamp')) + ((parseInt(next.data('page')) - 50) * 3*3600);
					console.log('Grid.scrollView', 'pageChanged next', next.data('page'), timestamp);
					Grid.loadSchedule(next, timestamp);
				}
				self.setTime(next.data('timestamp'));
			}
		});
	}
}
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
		var self = this;
		this.elmt = elmt;
		this.channels = $('#channels', elmt);
		this.schedule = $('#schedule', elmt);

		this.scrollView();
		this.load();
					
		//nav
		$('.carousel-control', this.elmt).click(function(){
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
		var mn = Math.round((+new Date()/1000 - parseInt(div.data('timestamp')))/60);
		console.log('cache', cache, mn, +new Date()/1000, '-', parseInt(div.data('timestamp')));
		if (mn > 180) {
			this.schedule.jqxScrollView('forward'); 
		} else {
			cache.animate({width: mn * 5 }, 3000);
		}
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function(){
			self.idle();
		}, 60000);
		//update is live
		//$('ul')
	},
	load: function(callback) {
		var self = this;
		startDiv = this.getCurrentSchedule();
		console.log('startDiv', startDiv);
		//cache
		this.timeout = setTimeout(function(){
			self.idle();
		}, 1000);
		//load before / after
		self.loadSchedule(startDiv.prev(), parseInt(startDiv.data('timestamp')) - 3600);
		self.loadSchedule(startDiv.next(), parseInt(startDiv.data('timestamp')) + 3600);

		if (typeof callback != 'undefined') {
			callback();
		}
	},
	loadSchedule : function(elmt, timestamp) {
		elmt.load('/app_dev.php/__grid/?schedule-only=1&timestamp=' + timestamp, {}, function(){
			$(this).data('timestamp', timestamp);
		});
	},
	getCurrentSchedule: function() {
		console.log('Grid.getCurrentSchedule', '[data-page="' + this.currentPage + '"]')
		return $('.schedule[data-page="' + this.currentPage + '"]', this.elmt);
	},
	scrollView: function() {
    var self = this;
		console.log('Grid.scrollView', this.schedule);
    this.schedule.jqxScrollView({ width: this.width, 
												 height: this.height, 
												 currentPage: this.currentPage-1});
	  this.schedule.bind('pageChanged', function (event) {
			$('.popover').popover('hide');
			self.currentPage = event.args.currentPage;
			var div = self.getCurrentSchedule();
			console.log(self.currentPage, $('.schedule', this.scrollView).length, div, div.prev());
			$('h1 time').html(div.data('timestamp'));
			//before
			if (self.currentPage < 50) {
				var prev = div.prev();
				if (!prev.html()) {
					var timestamp = parseInt(div.data('timestamp')) - ((50-parseInt(prev.data('page'))) * 3600);
					console.log(self.currentPage, 'load prev', prev.data('page'), timestamp);
					Grid.loadSchedule(prev, timestamp);
				}
			} else {
				var next = div.next();
				if (!next.html()) {
					var timestamp = parseInt(div.data('timestamp')) + ((parseInt(next.data('page')) - 50) * 3600);
					console.log(self.currentPage, 'load next', timestamp);
					Grid.loadSchedule(next, timestamp);
				}
			}
			$('[rel="popover"]', self.elmt).popover();
		});
	}
}

$(function () {
  Grid.init($('#grid'));

	//connecte
	//if Skhf.session.email
	//reload grid

	//sortable
  $( "#channels" ).sortable({ containment: 'parent', cursor: 'move', stop: function( event, ui ) {
		var ids = $(this).sortable('toArray', {attribute: 'data-id'}).join(',');
		console.log('ids', ids);
		//if !Skhf.session.email
		//UI.auth
		//API.setPreference('epg', ids);
		Grid.reset();
  }});
  $( "#channels" ).disableSelection();

});
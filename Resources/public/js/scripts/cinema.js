// -- theaters
$(document).ready(function(){
	$(document).on('click', '#theaters-names a', function(){
		var triggers = $('#theaters-names a');	
		if (triggers.filter(':not(.label-info)').length == 0) {
			triggers.removeClass('label-info');
			$(this).addClass('label-info');
		} else {
			$(this).toggleClass('label-info');
		}
		var ids = new Array();
		triggers.each(function(){
			if ($(this).hasClass('label-info')) {
				console.log('add theater id', $(this).data('id'));
				ids.push($(this).data('id'));
			}
		});
		if (ids.length > 0) {
			var url = 'schedule/cine.json?programs_only=1&theater_ids=' + ids.join(',');
			console.log('script', 'update url slider cinema', url);
			UI.sliders['cinema'].reset(url);
		} else {
			$(this).toggleClass('label-info');
		}
	});
	$(document).on('click', '#trigger-theaters-playlist', function(){
		console.log('script', 'trigger-theaters-playlist');
		var theaters = Skhf.session.datas.cinema;
		//if (theaters && theaters.split(',').length) {
			var container = $('.modal #theaters-list').length ? $('.modal #theaters-list') : $('#theaters-list');
			container.empty();
			UI.appendLoader(container, 2000);
			API.query(
				'GET',
				API.config.v3_url + container.data('api-url') + '?playlist=1&theater_ids=' + theaters,
				{dataType: 'text html'},
				function(datas){
					console.log('script', '#theaters-playlist', 'callback');
					UI.removeLoader(container);
					container.html(datas);
					UI.loadPlaylistTriggers('cinema', Skhf.session.datas.cinema.split(','), container);
			});
		//}
		return false;
	});
	$(document).on('click', '#trigger-theaters-geoloc', function(){
		console.log('script', 'trigger-theaters-geoloc');
		var container = $('.modal #theaters-list').length ? $('.modal #theaters-list') : $('#theaters-list');
		container.empty();
		UI.appendLoader(container, 2000);
		//geoloc
		API.geolocation(function(position){
			container.load(container.data('api-url') + '?latlng=' + position);
		}, function(msg, code){
			container.preprend('<p class="alert alert-error">' + msg + '</p>');
		});
		return false;
	});
});
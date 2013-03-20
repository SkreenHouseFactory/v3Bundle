// -- BaseSlider
var BaseSlider = Class.extend({
	elmt: null,
	container: null,
	items: null,
	sample: null,
	loader: null,
	params: {
		width: 150,
		height: 200,
		item_margin: 7,
		pager_nb_results: 7,
		type: 'scroll', 
		args: {}
	},
	//init
	init: function(params, callback, elmt) {
		//console.log('BaseSlider.init', params, elmt);
		this.params		= $.extend(this.params, params, typeof API.config.slider != 'undefined' ? API.config.slider : {});
		this.elmt			= typeof elmt != 'undefined' ? elmt : this.getTemplate(params);
		this.items		 = $('ul', this.elmt);
		this.container = $('.slider-container', this.elmt);
		this.loader		= $('.loader', this.items).css('width', this.params.width + 'px');

		// TODO : extend BAseSlider to make it works
		//if (this.elmt.data('nb-results') > 0) {
		//	this.params.pager_nb_results = this.elmt.data('nb-results');
		//	console.log('BaseSlider.init', 'pager_nb_results', this.params.pager_nb_results, this.elmt.data('nb-results'));
		//}
		//console.log('BaseSlider.init', this.loader, this.items);

		//scroll ?
		if (this.params.scroll == 'no') {
			this.elmt.addClass('no-scroll');
		}

		//li sample
		if (this.sample == null) {
			this.sample = $('<div>').append($('li.slider-sample:first').clone().removeClass('slider-sample')).html();
			//console.log('BaseSlider.init', 'this.sample', this.sample);
		}

		//paginate ?
		if (typeof params.url != 'undefined') {
			//console.log('BaseSlider.init', 'insertPrograms');
			this.elmt.data('paginate-url', params.url);
		}

		//programs
		if ($('li:not(.static)', this.items).length > 0) {
			//console.log('BaseSlider.init', 'Programs found in DOM');
			this.ui();
		} else if (typeof params.programs != 'undefined') {
			console.log('BaseSlider.init', 'insertPrograms');
			UI.appendLoader(this.loader);
			if (params.programs.length > 0) {
				this.insertPrograms(params.programs, callback);
			} else {
				callback(this.elmt);
			}
		} else if ( Skhf.session != null) { //ajax seulement
			//console.log('BaseSlider.init', 'loadRemotePrograms', this.elmt);
			UI.appendLoader(this.loader);
			this.elmt.removeClass('loading');
			this.loadRemotePrograms(0, callback);
		}

		return this;
	},
	render: function() {
		return this.elmt;
	},
	ui: function(callback) {
		//console.log('BaseSlider.ui', this);
		var self = this;

		var next = $('.right', this.elmt);
		var prev = $('.left', this.elmt);
		this.elmt.removeClass('loading');

		//if (!this.elmt.hasClass('couchmode')) {
			//this.items.css('width', (parseInt(this.params.width) + parseInt(this.params.item_margin)*2	+ 5) * this.items.children().length);
			//console.log('BaseSlider.ui', 'width', this.items.css('width'));
		//}

		if (this.elmt.hasClass('initialized')) {
			next.css({'visibility':'visible'});
			//console.log('BaseSlider.ui', 'already initialized');
			return;
		}

		if (this.items.children().filter(':not(.static)').length <= 5) {
			//console.log('BaseSlider.ui', 'not initialized', 'count:' + this.items.children().filter(':not(.static)').length, this.items);
			return;
		}

		//triggers
		next.bind('click', function(){
			self.next($(this));
		}).css({'visibility':'visible'});

		prev.bind('click', function(){
			self.prev($(this));
		});

		//swipe
		if (typeof UI != 'undefined' && 
				UI.touch == true) {
			this.elmt.touchwipe({
					 wipeLeft: function() {
						//alert('wipeLeft');
						self.next();
					 },
					 wipeRight: function() {
						//alert('wipeRight');
						self.prev();
					 },
					 wipeUp: function() {
						//alert('wipeUp:'+self.elmt.hasClass('slide-v'));
						if (self.elmt.hasClass('slide-v') && typeof UI.slideV != 'undefined') {
							UI.slideV(self.elmt, 'down');
						}
					 },
					 wipeDown: function() {
						//alert('wipeDown:'+self.elmt.hasClass('slide-v'));
						if (self.elmt.hasClass('slide-v') && typeof UI.slideV != 'undefined') {
							UI.slideV(self.elmt, 'up');
						}
					 },
					 min_move_x: 20,
					 min_move_y: 20,
					 //preventDefaultEvents: true
			});
		}

		this.elmt.addClass('navigate initialized')
	},
	next: function(trigger) {
		var self = this;
		console.log('next', this.container.css('left'), this.container.css('width'));
		if (parseInt(this.container.css('left')) < parseInt(this.container.css('width')) || this.container.css('left') == 'auto') {
			self.items.animate({'left': '+=-'+parseInt(this.container.css('width'))}, 500, function() {
				console.log('pager', parseInt(self.items.css('left')),	parseInt(self.container.css('width')), self.items.css('width'), self.elmt.data('pager-offset'));
				//console.log('pager', $('li:not(.static)', self.items).length * (self.params.width+self.params.item_margin*2) - parseInt(self.container.css('width')),	parseInt(self.items.css('left')), self.elmt.data('pager-offset'));
				if ($('li:not(.static)', self.items).length * (self.params.width+self.params.item_margin*2) - parseInt(self.container.css('width')) < -parseInt(self.items.css('left'))) {
					trigger.css({'visibility':'hidden'});
					//pager
					console.log('BaseSlider.ui', 'paginate', self.elmt.data('paginate-url'));
					if (self.elmt.data('paginate-url')) {
						var offset = self.params.pager_nb_results + parseInt(self.elmt.data('pager-offset'));
						self.elmt.data('pager-offset', offset);
						self.items.append(self.loader.addClass('loader-pager'));
						console.log('pager-offset', 'set', offset, self.elmt, self.params.pager_nb_results, self.elmt.data('pager-offset'));
						self.loadRemotePrograms(offset,
																		function(nb_programs){
																			//self.items.find('.loader-pager').remove();
																			if (nb_programs < 3) {
																				trigger.css('visibility','hidden');
																			} else {
																				trigger.css('visibility','visible');
																			}
																			
																			self.elmt.removeClass('loading');
																			if (nb_programs < self.params.pager_nb_results) {
																				self.elmt.addClass('loaded'); //le slider ne pagine plus
																			}
																		},
																		{},
																		true);
					}
				}
				if (!self.elmt.hasClass('back')) {
					self.elmt.addClass('back');
				}
			});
		}
	},
	prev: function(trigger) {
		var self = this;
		var next = $('.right', this.elmt);
		console.log('prev', parseInt(this.container.css('left')), parseInt(this.container.css('width')));
		if (-parseInt(this.items.css('left')) < parseInt(this.items.css('width'))) {
			self.items.animate({'left': '+=' + parseInt(this.container.css('width'))}, 500, function() {
				console.log('pager', parseInt(self.items.css('left')), parseInt(self.items.css('width')));
				console.log('pager =>', $('li:not(.static)', self.items).length * (self.params.width+self.params.item_margin*2) - parseInt(self.container.css('width')),	parseInt(self.items.css('left')), self.elmt.data('pager-offset'));
				if (parseInt(self.items.css('left')) >= -5) {
					self.elmt.removeClass('back');
				}
				if (next.css('visibility') == 'hidden') {
					next.css({'visibility':'visible'});
				}
			});
		}
	},
	reset: function(url) {
		this.remove();
		this.elmt.data('url', url);
		this.init({url: url}, function(){}, this.elmt);
	},
	remove: function() {
		console.log('BaseSlider.remove', this.elmt);
		$('.right', this.elmt).css({'visibility':'hidden'});
		$('.right, .left', this.elmt).unbind('click');
		$('ul', this.elmt).css('left', '0px').find('li:not(.static)').remove();
		this.elmt.data('pager-offset', 0);
		this.elmt.data('nb-programs', 0);
		this.elmt.removeClass('initialized navigate back loading loaded empty');// social');
	},
	loadRemotePrograms: function(offset, callback, args, keep) {
		//console.log('BaseSlider.loadRemotePrograms', offset, callback, keep, this.elmt);
		//prevent multiple loadings
		if (this.elmt.hasClass('loading')) {
			console.warn('BaseSlider.loadRemotePrograms', 'already loading');
			return;
		}

		if (!this.elmt.hasClass('loading')) {
			this.elmt.addClass('loading');
		}

		var self = this;

		if (this.elmt.data('pager-offset') == 0) {
			$('li:not(.static)', this.elmt).remove();
		}

		var args = $.extend(args, {img_width: API.config.slider.width, 
															 img_height: API.config.slider.height, 
															 url: ''}, this.params.args); //overwrite url params
		var url = this.getUrl(typeof offset != 'undefined' ? offset : 0);
		if (url == null) {
			console.warn('BaseSlider.loadotePrograms', 'url', url);
			return;
		}
		API.query('GET', //typeof args.api_method != 'undefined' ? 'POST' : 'GET',
							url, 
							args,
							function(programs){
								//console.log('BaseSlider.loadRemotePrograms', programs.length, programs, 'callback:' + callback);
								if (typeof keep == 'undefined' || keep != true) {
									$('li:not(.static)', self.elmt).remove();
								}

								if (programs.length > 0 || typeof programs[0] != 'undefined') {
									self.insertPrograms(programs);
									self.elmt.data('nb-programs', programs.length);
								} else if (typeof programs.length ==	'undefined' || $('li:not(.static)', self.elmt).length == 0) {
									self.elmt.removeClass('loading');
									self.elmt.addClass('loaded');
									if ($('li:not(.static)', self.elmt).length == 0) {
										self.elmt.addClass('empty');
									}
								}
								if (typeof callback != 'undefined'){
									callback(self.elmt);
								}
							});
	},
	getUrl: function(offset){
		var url = !isNaN(this.elmt.data('id')) ? 'www/slider/pack/' + this.elmt.data('id') + '.json'	: this.elmt.data('paginate-url');
		if (typeof url == 'undefined') {
			console.error('Slider.getUrl', url);
			return;
		}
		var with_best_offer = typeof this.elmt.data('best-offer') != 'undefined' && this.elmt.data('best-offer') ? '&with_best_offer=1' : '';
		return url .replace('session.uid', Skhf.session.uid)
							 .replace('access.name', Skhf.session.access ? Skhf.session.access : 'undefined')
							 + (url.indexOf('?') == -1 ? '?' : '&')
							 + (this.params.pager_nb_results ? 'nb_results=' + this.params.pager_nb_results + '&' : '')
							 + 'programs_only=1' + with_best_offer + '&offset=' + offset+ '&channel_img_width=50';
	},
	insertPrograms: function(programs, callback){
		console.log('BaseSlider.insertPrograms', programs);
		if (this.elmt.hasClass('empty') && programs.length > 0) {
			this.elmt.removeClass('empty');
		}
		for (k in programs) {
			var program = programs[k];
			var popular_channel = program.popular_channel ? '<img alt="' + program.popular_channel.name + ' en streaming" class="channel" src="'+program.popular_channel.img+'" />' : '';												
			var pere	= program.episodeof ? program.episodeof : program;
			var sample = this.sample.replace('%title%', program.title).replace('%title%', program.title)
															.replace('%id%', pere.id).replace('%id%', pere.id)
															.replace('%popular_channel%', popular_channel)
															.replace('%onglet%', typeof program.onglet != 'undefined' ? program.onglet.toLowerCase() : '');
			var li = $(sample);
			li.css('background-image', 'url(' + program.picture + ')')
				.attr('data-position', k)
				.attr('data-player-program', JSON.stringify(program))
				.attr('href', program.seo_url);
			if (program.deporte) {
				li.addClass('deporte');
			}
			this.addProgramBestOffer(li, program);

			//notif : FIX
			//if (Skhf.session.datas.notifications &&
			//		$.inArray('' + pere.id, Skhf.session.datas.notifications.programs['new']) != -1) { //'' + pere.id
			//	li.prepend(UI.badge_notification.replace('%count%', 'nouveau'));
			//}

			/* add friends : desactived
			Skhf.session.getSocialDatas(function (friends, friends_programs) {
				if (typeof friends_programs[program.id] != 'undefined') {
					UI.addFriends(li, friends_programs[program.id]);
				}
			});
			*/
			li.addClass('to-animate').css('display', 'inline-block'); //attention : .show() > list-item
			//console.log('BaseSlider.load', 'add', li, $('ul.items', this.elmt));
			$('ul.items', this.elmt).append(li);

			//console.log('BaseSlider.load', 'added', program);
		}

		//if (this.elmt.data('animate') == 'width') {
			$('li.to-animate', this.elmt).animate({'width':this.params.width}, 500).removeClass('to-animate');
		//}
		console.log('BaseSlider.insertPrograms', 'done', this.elmt);
		//ui
		if (!this.elmt.hasClass('initialized')) {
			this.ui();
		}
		$('a[rel="tooltip"]', this.elmt).tooltip();
		UI.loadPlaylistTriggers('like', Skhf.session.datas.queue, this.elmt);

		if (typeof callback != 'undefined'){
			callback(this.elmt);
		}
	},
	addProgramBestOffer: function(li, p) {
		//console.log('BaseSlider.addProgramBestOffer', li, p);
		//popular_channel
		if (typeof p.popular_channel == 'object') {
			$('.channel', li).prepend('<img src="' + p.popular_channel.img + '" alt="' + p.popular_channel.name + '" />');
		}
		//best_offer
		var o = p.best_offer;
		if (typeof o != 'undefined' && 
				o != null && 
				o.dispo) {
			//channel & diff
			if (typeof o.channel.name != 'undefined') {
				if ($('.channel img', li).length > 0) {
					$('.channel img', li).attr('src', o.channel.img).attr('title', o.channel.name);
				} else {
					$('.channel', li).prepend('<img src="' + o.channel.img + '" alt="' + o.channel.name + '" />');
				}
				if (o.broadcastdate) {
					$('.channel .diff', li).html(o.broadcastdate.replace(' à ', '<br/>')).removeClass('hide');
				} else if (p.deporte) {
					$('.channel .diff', li).html('sur mySkreen').removeClass('hide');
				}
				//playlist seulement
				if (this.elmt.hasClass('slider-playlist')) {
					console.log('BaseSlider.addProgramBestOffer', 'slider-playlist', o);
					if (o.deporte) {
						$('a.title', li).attr('data-play', o.deporte)
														.attr('data-ajax', API.config.v3_root + p.seo_url)
														.attr('rel', '#content');
					} else if (o.url) {
						$('a.title', li).attr('data-redirect', o.url);
					} else {
						$('a.title', li).attr('data-ajax', API.config.v3_root + p.seo_url)
														.attr('rel', '#content');
					}
				}
				$('.channel', li).removeClass('hide');
			}
		} else {
			//if (p.deporte) { $('.channel .diff', li).html('<i class="icon-th icon-white"></i> Sur mySkreen'); }
			//else 
			if (p.has_vod == 4) { $('.channel .diff', li).html('Ciné'); }
			else if (p.has_vod == 3) { $('.channel .diff', li).html('DVD'); }
			else if (p.has_vod == 5) { $('.channel .diff', li).html('TV'); }
			else if (p.has_vod == 6) { $('.channel .diff', li).html('Bientôt en Replay'); }
			else if (p.has_vod == 7 || p.has_vod == 8 || p.has_vod == 9 || p.has_vod == 10) { $('.channel .diff', li).html('Replay'); }
			else if (p.has_vod) { $('.channel .diff', li).html('VOD'); }
			//playlist seulement
			if (this.elmt.hasClass('slider-playlist')) {
				console.log('BaseSlider.addProgramBestOffer', 'slider-playlist no bestOffer', p);
				$('a.title', li).attr('data-ajax', API.config.v3_root + p.seo_url)
												.attr('rel', '#content');
			} else {
				$('a.title', li).attr('href', API.config.v3_root + p.seo_url);
			}
		}
	},
	getTemplate: function(params) {
		var title = typeof params.title != 'undefined' ? '<h2>' + params.title + '</h2>' : '';
		var html = $('<div' + (typeof params.id != 'undefined' ? ' id="' + params.id + '"' : '') + ' class="slider tv-container"' + (typeof params.data_id != 'undefined' ? ' data-id="' + params.data_id + '"' : '') + '>' + title + '<div class="slider-container"><ul class="items" data-current-position="0"><li class="loader static">Chargement ...</li></ul></div></div>');

		//console.log('BaseSlider.getTemplate', params, html);
		return html;
	}
});
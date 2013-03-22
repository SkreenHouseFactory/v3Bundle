// -- YouTube Player API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
function onPlayerReady(event) {
	console.warn('onPlayerReady', event.target);
	Player.ytplayer = event.target;
}

// -- Player
var Player;
Player = {
	elmt: null,
	timeout: [],
	timeoutdelay: 5000,
	type: null,
	state: 'stopped',
	playing: null,
	elmt_meta: null,
	//player
	init: function(elmt, elmt_meta) {
		this.reset();
		this.elmt = elmt;
		if (!this.elmt.hasClass('player')) {
			this.elmt.addClass('player on');
			//UI.appendLoader(this.elmt);
		}
		if (typeof elmt_meta != 'undefined') {
			console.log('Player.init', 'elmt_meta', elmt_meta.length);
			this.elmt_meta = elmt_meta;
			this.elmt_meta.addClass('actions');
			//this.loadMetaProgram(this.elmt.data('player-program'));
		}

		this.type = Player.getType();
		console.log('Player.init', 'type', this.type, this.elmt);

		return this;
	},
	reset: function() {
		$('#player-meta').empty();
		if (this.elmt != null	&& this.elmt.html()) {
			this.elmt.empty();
			//this.elmt = null;
		}
		if (this.playing) {
			this.playing = null;
		}
		this.type = null;
		if (this.timeout.length > 0) {
			for (k in this.timeout) {
				clearTimeout(this.timeout[k]);
			}
		}
		console.log('Player.reset', 'done');
	},
	getType: function() {
		if (this.type != null) {
			return this.type;
		}
		if (navigator.userAgent.match(/iPhone|iPod|iPad/)) {
			console.log(['Player.getType', 'iPhone|iPod|iPad', navigator.userAgent]);
			return 'ios';
		//} else if (Modernizr.video.h264) {
		//	console.log('Player.getType', 'Modernizr.video', Modernizr.video);
		//	return 'h264';
		} else {
			return 'flowplayer'; //'flash';
		}
	},
	load: function(trigger) {
		var self = this;
		console.log('Player.load', trigger);

		var url			= trigger.attr('href');
		var embed		= trigger.data('player-embed');
		var title		= trigger.data('player-title');
		var subtitle = trigger.data('player-subtitle');
		var icon		 = trigger.data('player-icon') ? '<img src="' + trigger.data('player-icon') + '"/> ' : '';
		var program	= trigger.data('player-program');

		this.elmt = $('#player');
		this.elmt.css('height', window.height)
		$('.title', this.elmt).html(icon + title);
		$('.subtitle', this.elmt).html(subtitle);
		if (program) {
			this.loadMetaProgram(program);
		}

		// -- embed
		if (embed) {
			this.play(embed);

			//overlay
			self.timeout['overlay'] = setTimeout(function(){
				$('.player-overlay').fadeOut('slow');
			}, self.timeoutdelay);
			$(window).mousemove(function(e) {
				if ($('.player-overlay').css('display') == 'none') {
					console.log('Player.load', 'mousemove');
					$('.player-overlay').show();
					self.timeout['overlay'] = setTimeout(function(){
						$('.player-overlay').fadeOut('slow');
					}, self.timeoutdelay);
				}
			});
			$('.player-overlay').show();

			//resize
			$(document).keyup(function(e) {
				if (e.keyCode == 27) { self.minify(); }
			});
			$('> i.icon-white', this.elmt).unbind().bind('click', function(){
				if ($(this).hasClass('icon-resize-full')) {
					$(this).removeClass('icon-resize-full').addClass('icon-resize-small');
					self.expand();
				} else {
					$(this).removeClass('icon-resize-small').addClass('icon-resize-full');
					self.minify();
				}
			});

			//insert playlist
			$('.player-playlist').prependTo(this.elmt);

		// -- redirect
		} else if (url) {
			this.remove();
			this.redirect(url);
		}

	},
	redirect: function(url, elmt, toggleElmt) {
		console.log('Player.redirect', url, elmt, url.indexOf('/exit/') != -1);
		if (typeof url != 'undefined') {
			if (url.indexOf('/exit/') != -1 || url.indexOf('m6replay') != -1) { //url.match(/\/exit\//)) {
				window.open(url.replace('/redirection/', '/exit/')); //hack m6
				return false;
			} else {
				//get final url
				if (url.indexOf('?url=') != -1) {
					var tmp = url.split('?url=');
					url = unescape(tmp[1]);
				}
				elmt.html('<iframe src="' + url + '"></iframe>');
			}
			elmt.show().css('height', ($(window).height() - 100) + 'px');
			if (typeof toggleElmt != 'undefined') {
				toggleElmt.hide();
			}
		}
	},
	play: function(player, callback) {
		console.log('Player.play', player, this.type, this.elmt);
		this.state = 'playing';
		this.playing = player.id;
		if (typeof player.format != 'undefined') {
			this.type = player.format;
		}

		switch(this.getType()) {	
			/*
				http://flowplayer.org/documentation/api/player.html
				
				100	Plugin initialization failed
				200	Stream not found
				201	Unable to load stream or clip file
				202	Provider specified in clip is not loaded
				300	Player initialization failed
				301	Unable to load plugin
				302	Error when invoking plugin external method
				303	Failed to load resource such as stylesheet or background image
			*/
			case 'ios':
			case 'h264':
			case 'html5':
			case 'flowplayer':

				//non compatible
				if (player.format == 'flash') {
					this.type = 'flash';
					this.elmt.html(player.embed);
					return;
				}

				var flashArgs = {
							"src": player.swf || "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf",
							"wmode":"opaque",
							"allowfullscreen":"true",
							"cachebusting": "false",
							"width": player.width || "100%",
							"height": player.height || "100%",
							"allowscriptaccess":"always"
				};

				flowArgs = player.config ? JSON.parse(player.config) : {"clip":{"url":player.url}};
				flowArgs.onMouseOver = function() {};
				flowArgs.onMouseOut = function() {};
				flowArgs.onBegin = function() {};
				flowArgs.onFinish = function() {
					if (typeof callback != 'undefined') {
						callback();
					}
				}
				flowArgs.onError = function(errorCode,errorMessage) {
					UI.error('Erreur de lecture !');
					if (typeof callback != 'undefined') {
						callback();
					}
					//console.error('Player.flowplayer', player, errorCode, errorMessage);
				};

				if (this.getType() == 'html5' || 
						this.getType() == 'ios') {
					console.warn('Player.flowplayer', 'iOs/noflash', player.url);
					/*
					Player.elmt.css('height', document.body.clientHeight/2);
					$f(this.elmt.attr('id'), flashArgs, flowArgs).ipad({simulateiDevice: true, 
																															controls: false, 
																															ipadUrl: player.url, 
																															validExtensions: null,
																															debug: true,
																															posterUrl: player.poster != 'undefined' ? player.poster : '',
																															posterExtensions: /png|jpg/gi});
					*/
					this.elmt.html('<video id="skPlayerHtml5" width="' + flashArgs.width + '" height="' + flashArgs.height + '" controls="1" x-webkit-airplay="allow" tabindex="0">' +
												 '<source' + ( typeof player.poster != 'undefined' ? ' poster="' + player.poster + '""' : null) + ' src="' + player.url + '" type="video/mp4"></source>' +
												 '</video>');
					this.elmt.find('video:first').play();
					console.warn('Player.flowplayer', 'html', Player.elmt.html());

				} else {
					//if (this.elmt.data('player-jscontrolbar')) {
					//	flowArgs.plugins.controls = null;
					//}
					console.warn('Player.flowplayer', 'flash', flashArgs, flowArgs);
					var f = $f(this.elmt.attr('id'), flashArgs, flowArgs);
					//if (this.elmt.data('player-jscontrolbar')) {
					//	f.controls(this.elmt.data('player-jscontrolbar'), {duration: 25});
					//}
				}

				this.track(player);

			break;
			case 'flash':
				console.warn('Player.play', 'flash', player, this.elmt);
				this.elmt.html(player.embed != 'undefined' ? player.embed : player);
			break;
			case 'android':
				if (typeof Webview != 'undefined') {
					//player.url = 'http://www.pocketjourney.com/downloads/pj/video/famous.3gp';
					//player.url = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov';
					//player.url = 'rtsp://a2047.v1411b.c1411.g.vq.akamaistream.net/5/2047/1411/1_h264_650/1a1a1ae454c430950065de4cbb2f94c226950c7ae655b61a48a91475e243acda3dac194879adde0f/080690210abcn_2a_650.mov';
					Webview.postMessage(['player', 'launch', player.url]);
				}
			break;
			case 'iframe':
				this.elmt.html('<iframe src="' + player.url + '" width="100%" height="100%" frameborder="0"></iframe>');
			break;
			case 'YouTube':
				//this.elmt.html('<embed id="ytplayer" width="100%" height="100%" name="plugin" src="http://www.youtube.com/v/' + player.url + '?enablejsapi=1&version=3&playerapiid=ytplayer&wmode=opaque" type="application/x-shockwave-flash"><param name="wmode" value="transparent"></embed>');
				this.elmt.html('<iframe src="http://www.youtube.com/embed/' + player.url + '?version=3&f=videos&app=youtube_gdata&rel=1&border=0&fs=1&autoplay=1&wmode=opaque" width="100%" height="100%" frameborder="0"></iframe>');
			break;
		}
	},
	pause: function() {
		if (this.state != 'playing') {
			console.warn('Player.pause', 'state', this.state);
			return;
		}
		this.state = 'paused';
		switch(this.type) {
			case 'android':
				if (typeof Webview != 'undefined') {
					Webview.postMessage(['player', 'pause']);
				}
			break;
			case 'html5':
			case 'flowplayer':
				$f(this.elmt.attr('id')).pause();
			break;
			case 'YouTube':
				//this.ytplayer.pauseVideo();
			break;
		}
	},
	resume: function() {
		this.state = 'playing';
		switch(this.type) {
			case 'android':
				if (typeof Webview != 'undefined') {
					Webview.postMessage(['player', 'play']);
				}
			break;
			case 'html5':
			case 'flowplayer':
				$f(this.elmt.attr('id')).resume();
			break;
			case 'YouTube':
				//this.ytplayer.playVideo();
			break;
		}
	},
	stop: function() {
		this.state = 'stopped';
		switch(this.type) {
			case 'android':
				if (typeof Webview != 'undefined') {
					Webview.postMessage(['player', 'stop']);
				}
			break;
			case 'html5':
			case 'flowplayer':
				if (this.elmt != null) {
					if (player = $f(this.elmt.attr('id'))) {
						player.stop();
					}
				}
			break;
			case 'YouTube':
				//this.ytplayer.stopVideo();
			break;
		}

		this.reset();
	},
	mute: function() {
		switch(this.type) {
			case 'android':
			//?
			break;
			case 'html5':
			case 'flowplayer':
				$f(this.elmt.attr('id')).mute();
			break;
			case 'YouTube':
				//?
			break;
		}
	},
	playProgram: function(id, callback, args) {
		var self = this;
		if (typeof args == 'undefined' || 
				typeof args.current_player == 'undefined' || 
				!args.current_player) {
			this.reset();
		}
		var args = $.extend(true, {
				with_player: 1,
				with_teaser: 1,
				player_width: this.elmt.data('play-width') ? this.elmt.data('play-width') : '100%', 
				player_height:	this.elmt.data('play-height') ? this.elmt.data('play-height') : '100%',
				player: this.type,
				fullHD: 1,
				no_paywall: 1
			}, 
			typeof args != 'undefined' ? args : {}
		);
		API.query(
			'GET',
			'player/program/' + id + '.json',
			args,
			function(media){
				console.log('Player.playProgram', media.player, args);

				if (!media.player || typeof media.player == 'undefined') {
					callback('unvailable');
					return false;
				}
				self.play($.extend(media.player, {id: id}), callback);
	
				return true;
			}, 
			true
		);
	},
	playOccurrence: function(id, callback, args) {
		console.log('Player.playOccurrence', id, args);
		var self = this;
		if (typeof args == 'undefined' || 
				typeof args.current_player == 'undefined' || 
				!args.current_player) {
			this.reset();
		}
		var args = $.extend(true, {
				with_player: 1,
				with_teaser: 1,
				player_width: this.elmt.data('play-width') ? this.elmt.data('play-width') : '100%', 
				player_height:	this.elmt.data('play-height') ? this.elmt.data('play-height') : '100%',
				player: this.getType(),
				fullHD: 1,
				no_paywall: 1,
				occurrence_id: id
			}, 
			typeof args != 'undefined' ? args : {}
		);
		API.query(
			'GET',
			'player/' + id + '/' + Skhf.session.uid + '.json',
			args,
			function (video){
				console.log('Player.playOccurrence', video, args);
				if (!video.player || typeof video.player == 'undefined') {
					console.error(['Player.playOccurrence', 'API.query', 'callback', video]);
					if (typeof callback != 'undefined') {
						callback('unvailable');
					}
					return false;
				}
				self.play($.extend(video.player, args), callback);
				var nb_version = $.map(video.versions, function(n, i) { return i; }).length;
				if (typeof video.versions != 'undefined' && nb_version > 1) {
					self.loadVersions(video.versions, id);
				}

				return true;
			}, 
			true
		);
	},
	track: function(player) {
		var self = this;
		//track
		API.query('POST',
							'player/track.json',
							{
								token: this.playing,
								url: document.location.href
							}
						 );

		//watching
		if (Skhf.session.datas.email) {
			this.timeout['track'] = setTimeout(function() {
				API.query('POST',
									'player/watching.json',
									{
										token: self.playing,
										session_uid: Skhf.session.datas.uid,
										ip_adress: ''
									});
			}, 30000);
		}
	},
	loadVersions: function(versions, current_id) {
		var el = $('#player-versions', this.elmt_meta);
		if (!el.length) {
			var el = $('<div id="player-versions"></div>');
			el.appendTo(this.elmt_meta);
		}
		console.log('Player.loadVersions', versions, el);
		if (el.html()) {
			return;
		}
		for (k in versions) {
			if (k) {
				if (!el.html() && this.elmt_meta) {
					this.elmt_meta.addClass('has-versions');
					el.html('Versions disponibles<br/>');
				}
				el.append(' <a href="#" data-play="' + versions[k] + '" data-play-args=\'{"current_player": "1"}\' class="badge' + (versions[k] == current_id ? ' badge-info' : '') + '">' + k + '</a>');
			}
		}
		$('[data-play]', el).click(function() {
			$('[data-play]', el).removeClass('badge-info');
			$(this).addClass('badge-info');
		});
	},
	loadMetaProgram: function(p) {
		console.log('Player.loadMetaProgram', p, this.elmt_meta);
		if (this.elmt_meta == null) {
			return false;
		}
		this.elmt_meta.empty();

		//meta program
		if (typeof p == 'object') {
			var format = p.format != null ? p.format : '';
			var year = p.year != null ? ' - ' + p.year : '';
			this.elmt_meta.data('id', p.id);
			this.elmt_meta.data('title', 'Ajout à vos playlists<br/><small>' + p.title + ', ' + format + year + '</small>');
			this.elmt_meta.append('<h4>' + p.title + '<br/><small>' + p.format + year + '</small></h4>');
			//<br/><a class="btn btn-large fav">Suivre / voir plus tard</a><span>');
		}
		
		//version ?
		this.elmt_meta.append('<div id="player-versions"></div>');
		
		//buy ?
		if (typeof p == 'object' && 
				typeof p.pass != 'undefined' && 
				p.pass != null) {
			//this.elmt_meta.append('<div id="player-paywall"><a href="#" class="btn btn-info" data-play="' + p.pass + '"><i class="icon-play icon-white"></i> Louer ce programme</a></div>');
		}
	},
	minify: function() {
		$('#header').collapse('show');
		$('#top-playlist').collapse('hide');
	},
	expand: function() {
		$('#header, #top-playlist').collapse('hide');
	},
	remove: function() {
		this.timeout = new Array();
		$('.title, .subtitle, .embed', this.elmt).empty();
		this.elmt.removeClass('on');
		$('#header').collapse('show');
		$('#redirect').empty().collapse('hide');
	},
	setType: function(type) {
		console.warn(['Player.setType', type]);
		this.type = type;
	}
}
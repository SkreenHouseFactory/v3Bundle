// -- popin
var skXdmSocket = {postMessage: function(){
}};
function skPaymentPopinResize() {
}
function skPaymentPopinEnd(action, player, occurrence_id) {
	console.warn('skPaymentPopinEnd', action, player, occurrence_id);
	if (typeof action != 'undefined' && 
			action == 'play') {
		Couchmode.init({type: 'occurrence', id: occurrence_id, hide_sliders: 1});
	}
	$('.modal').modal('hide');
}
function skPaymentPopinRefresh() {
	return skPaymentPopinEnd();
}
function skPaymentPopinRefreshSession() {
}
function onRentClicked() {
	var current_program_id = Player.elmt.data('playing-id');
	console.warn('onRentClicked playing', current_program_id);
	document.location.hash = 'program-offers';
}

// -- ENV
var ENV;
ENV = {
	dev: {
		env: 'dev',
		site_url: 'http://beta.' + DEV + '.myskreen.typhon.net:40011',
		v3_url: 'http://v3.' + DEV + '.myskreen.typhon.net/app_dev.php',
		v3_root: '/app_dev.php',
		base: 'http://' + DEV + '.myskreen.typhon.net/api/',
		popin: 'http://' + DEV + '.myskreen.typhon.net/popin/',
		domain: DEV + '.myskreen.typhon.net',
		fb: {app_id: 101348563248431 },
		console: true
	},
	preprod: {
		env: 'preprod',
		site_url: 'http://preprod.beta.myskreen.com',
		v3_url: 'http://preprod.v3.myskreen.com',
		v3_root: '',
		base: 'https://preprod.api.myskreen.com/api/',
		popin: 'https://preprod.api.myskreen.com/popin/',
		domain: 'preprod.beta.myskreen.com',
		fb: {app_id: 193945860617344 },
		console: true
	},
	prod: {
		env: 'prod',
		site_url: 'http://www.myskreen.com',
		v3_url: 'http://www.myskreen.com',
		v3_root: '',
		base: 'https://api.myskreen.com/api/',
		popin: 'https://api.myskreen.com/popin/',
		domain: 'www.myskreen.com',
		fb: {app_id: 193945860617344 },
		console: false
	},
	all: {
		api_version: '2',
		slider: {
			width: 150,
			height: 200
		}
	}
}

// -- API
$.support.cors = true;
var API;
API = {
	xhr: new Array(),
	db: new Array(),
	skXdmSocket: null,
	config: null,
	dataType: 'jsonp',
	currentModalUrl: null,
	currentUrl: null,
	geolocation_id: null,
	init: function(callback) {
		var href = document.location.href;
		API.config = $.extend(ENV.all, href.indexOf('.net') != -1 ? ENV.dev : href.indexOf('preprod.') != -1 ? ENV.preprod : ENV.prod);
		API.config.player = $('html').hasClass('video') ? 'html5' : 'flash';

		// console
		if( API.config.console != true || typeof console == 'undefined' || typeof console.log === 'undefined') {
			console = {
					log: function() {},
					warn: function() {},
					error: function() {}
			};
		}

		//session
		Skhf = {
			session: null
		}

		//callback
		if (typeof callback != 'undefined') {
			callback();
		}
	},
	quickLaunchModal: function(action, callbackOnLoad, args) {
		this.launchModal(this.config.popin + action, callbackOnLoad, args);
	},
	launchModal: function(url, callbackOnLoad, args) {
		console.log('API.launchModal enter', url, typeof callbackOnLoad);

		//if (url != this.currentModalUrl) {
			var body = $('.modal .modal-body');
			body.empty();
			UI.appendLoader(body, 1000);

			var args = $.extend(typeof args != 'undefined' ? args : {}, {session_uid: Skhf.session.uid, proxy: 'v3'});

			this.query('GET_PROXY', 
								 url,
								 args, 
								 function(json){
									//console.log('API.launchModal', 'redirect:' + json.redirect, 'callbackOnLoad', callbackOnLoad);
									if (typeof json.redirect != 'undefined') {
										API.launchModal(json.redirect, callbackOnLoad);
									} else if (json.html) {
										if (typeof json.title != 'undefined' && json.title) {
											$('.modal .modal-header h3').html(json.title);
										}
										body.html(json.html);
										API.catchForm($('.modal'), callbackOnLoad);
									}
								});
		//} else {
		//	callbackOnLoad();
		//}

		$('.modal').modal();

		this.currentModalUrl = url;
	},
	catchForm: function(elmt, callbackOnLoad) {
		var self = this;
		console.log('API.catchForm', 'catch form');

		//link
		$('a.tv-component', elmt).click(function(e){
			e.preventDefault();
			e.stopPropagation();
			//tmp = $(this).attr('href').split('/');
			//tmp[tmp.length-1]
			console.log('API.catchForm', $(this).attr('href'));
			self.launchModal($(this).attr('href'), callbackOnLoad);

			return false;
		});

		//form
		$('[type="submit"]', elmt).click(function(e){
			e.preventDefault();
			//console.warn('API.catchForm', 'submit');
			//$(this).attr('disabled', 'disabled');
			var form = $(this).parents('form:first');
			var o = {};
			var a = form.serializeArray();
			$.each(a, function() {
				if (o[this.name] !== undefined) {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				} else {
					o[this.name] = this.value || '';
				}
			});
			var args = $.extend(o, {session_uid: Skhf.session.uid});
			var method = form.attr('method') ? form.attr('method').toUpperCase() : 'POST';
			//console.warn('API.catchForm', 'query method', method);
			self.query(method, form.attr('action'), args, function(json){
				//console.log('API.catchForm', 'API.query callback', args, json, elmt);
				// if modal
				if (elmt.hasClass('modal')) {
					//return html
					if (typeof json != 'object') {
						$('.modal-body', elmt).empty().html(json);
						self.catchForm(elmt, callbackOnLoad);
					//onError
					} else if (typeof json.error != 'undefined') {
						$('.#form-errors', elmt).html(json.error).fadeIn();
					//onSuccess
					} else if (typeof json.success != 'undefined' && json.success) {
						Skhf.session.sync(function(){
							elmt.modal('hide');
						});
					//redirect
					} else if (typeof json.redirect != 'undefined') {
						self.launchModal(json.redirect, callbackOnLoad);
					//reload html
					} else if (typeof json.html != 'undefined') {
						$('.modal-body', elmt).empty().html(json.html);
						self.catchForm(elmt, callbackOnLoad);
					}
				//default
				} else {
//					console.log(json);
					$('.post-form-display').remove();
					//handle success
					if (json.success) {
						form.prepend('<p class="alert alert-success post-form-display">Modification réussie</p>');
					}
					//handle errors : {error: {message: 'error mesage ...', fields: {field1: error_name, field2: error_name, …}}}
					else if (json.error) {
						form.prepend('<p class="alert alert-error post-form-display">' + json.error.message + '</p>');
						for (k in json.error.fields) {
							$('[name="'+k+'"]').after('<span class="alert alert-error post-form-display">'+ json.error.fields[k] +'</span>');
						}
					}
					if (typeof(callbackOnLoad) != 'undefined') {
						callbackOnLoad(json);
					}
				}
			});
			return false;
		});

		//input dpad
		$('input:visible:not(.tv-component)', elmt).addClass('tv-component tv-component-input');
		$('.btn:visible:not(.tv-component)', elmt).addClass('tv-component');
		$('input[type="text"], input[type="email"], input[type="password"]', elmt).attr('autocomplete', 'off');

		
		//v2
		if (elmt.hasClass('modal')) {
			this.v2Modal(elmt);
		}

		if (typeof callbackOnLoad != 'undefined') {
			callbackOnLoad();
		}
	},
	v2Modal: function(modal) {
		console.log('API.v2Modal', 'enter', modal);
		//header
		if ($('#part-header h1', modal)) {
			$('.modal-header h3', modal).html($('#part-header h1', modal).html());
			$('#part-header', modal).remove();
		}
		//error
		$('.error_list', modal).addClass('alert alert-error').removeClass('error_list');
		//input
		$('form input[type="submit"]', modal).addClass('btn-large btn-primary').removeClass('primary');
		console.log('API.v2Modal', 'exit', modal);
	},
	typeahead: function(keywords) {
		var url = 'search/autocomplete/' + keywords;
		var args = {advanced:1, session_uid:Skhf.session.uid};
		this.query('GET', url, args, function(json){
			return json;
		});
	},
	addPreference: function(parameter, value, callback, parcours) {
		this.query('POST', 'preference/flag.json', {session_uid:Skhf.session.uid, type:parameter, value:value, parcours:parcours}, function(json){
			console.log('API.addPreference', 'callback', parameter, value, json);
			if (json.success) {
				var added = new Array();
				added.push(value);
				UI.loadPlaylistTriggers(parameter, added);
				
				Skhf.session.sync();//function(){},{ with_notifications: 0 });
				if (typeof callback != 'undefined' && callback != null) {
					callback(value);
				}
			}
		});
	},
	removePreference: function(parameter, value, callback) {
		this.query('POST', 'preference/unflag.json', {session_uid: Skhf.session.uid, type:parameter, value:value}, function(json){
			console.log('API.removePreference', 'callback', parameter, value, json);
			if (json.success) {
				var removed = new Array();
				removed.push(value);
				UI.unloadPlaylistTriggers(parameter, removed);
				
				Skhf.session.sync();//function(){},{ with_notifications: 0 });
				if (typeof callback != 'undefined') {
					callback(value);
				}
			}
		});
	},
	togglePreference: function(parameter, value, callback, parcours){
		var self = this;
		console.log('API.togglePreference', parameter, value);
		if ($.inArray('' + value, Skhf.session.datas.queue) != -1) {
			self.removePreference(parameter, value, callback);
		} else {
			self.addPreference(parameter, value, callback, parcours);
		}
	},
	markAsRed: function(id){
		this.query('POST', '/user/markasred.json', {program_id: id}, function() {
			UI.markAsRed(id);
		});
	},
	play: function(id, base_args){
		var base_args = typeof base_args != 'undefined' ? base_args : {};
		console.log('API.play', 'id', id, 'args', base_args);
		var self = this;
		this.query('GET', '/player/' + id + '/' + Skhf.session.uid + '.json', {}, function(datas) {
			console.log('API.play', 'callback API.query', datas);
			switch (datas.error) {
				case 'DISCONNECTED':
					UI.auth(function(){
						console.log('API.play', 'callback UI.auth', Skhf.session.datas);
						$('.modal .modal-body').prepend('<p class="alert alert-success"><b>Vidéo à la demande :</b><br/>Créez votre compte pour voir ce programme sur mySkreen !</p>');
						if (Skhf.session.datas.email) {
							self.play(id);
						}
					});
				break;
				case 'NO_RIGHTS':
					UI.paywall(id, function(){
						//self.play(id);
					});
				break;
				default:
					console.log(['script', 'Player.getType:', Player.getType(), 'data-couchmode', $(this).data('couchmode'), base_args]);
					UI.play(id, base_args);
				break;
			}
		});
	},
	query: function(method, url, data, callback, cache, version) {

		if (!url.match(/^http(s|)\:\/\//)) {
			//console.log('API.query', 'http', 'is api', url);
			var version = typeof version != 'undefined' ? version : this.config.api_version;
			var url	= this.config.base + version + '/' + url; //.replace('//', '/');
		}

		url = url.replace('/app_dev.php', '').replace('/app.php', ''); //developpment environment
		if (typeof data.img_width == 'undefined' && 
				typeof data.item_height == 'undefined' &&
				typeof Slider != 'undefined') {
			$.extend(data, {'img_height': Slider.item_height, 'img_width': Slider.item_width});
		}

		if (typeof data.fromWebsite == 'undefined') {
			$.extend(data, {fromWebsite: 'v3'});
		}

		var post = {};
		var dataType = typeof data.dataType != 'undefined' ? data.dataType : this.dataType;
		// Currently, proxy POST requests
		if (method == 'POST' || method == 'DELETE' || method == 'GET_PROXY') {
			method = method.replace('_PROXY', ''); //hack GET_PROXY
			var dataType = 'text json';
			var post = {};
			post['url'] = url.replace('.json','');
			post['data'] = data;
			data = post;
			url = this.config.env == 'dev' ? '/app_dev.php/proxy' : '/proxy';

		} else {
			if (data && typeof data === 'object'){
				//console.log(data, 'url.indexOf', url.indexOf('?'));
				url += url.indexOf('?') == -1 ? '?' : '&';
				for (var key in data) {
					 url += key+'='+escape(data[key])+'&';
				}
				data=null;
			}
		}

		console.log('API.query', method, dataType, url, data, new Date());
		
		//Permet de benchmarker le temps d'execution des pages
		var tooLongQuery = setTimeout(function(){
			console.warn('API.query', 'too long query', new Date(), url);
		}, 1000);

		var req = $.ajax({
			url: url,
			dataType: dataType,
			cache: typeof cache != 'undefined' ? cache : false,
			data: data,
			type: method,
			jsonp: 'callback',
			async: true,
			//crossDomain: true,
			error: function(retour, code) {
				console.log('API.query', 'error getting query', code, retour);
				clearTimeout(tooLongQuery); 
				if (retour.readyState == 4 && 
						retour.statusText != 'Internal Server Error'){
					if (typeof callback != 'undefined') {
						callback(JSON.parse(retour.responseText));
					}
				} else {
					console.error('error getting query', retour, url, data, code, retour.statusText);
					return false;
				}
			},
			success: function(json) {		 
				//console.log(['API.query', 'succes', json]);
				clearTimeout(tooLongQuery);
				if (typeof callback != 'undefined') {
					var datas = JSON.parse(JSON.stringify(json));
					callback(datas);
				}
			}
		});
		return req;
	},
	cookie: function(name, value, expires){
		if (typeof value == 'undefined') {
			return $.cookie('myskreen_' + name);
		} else {
			var expires = typeof expires != 'undefined' ? expires : 30;
			//console.log('API.cookie', 'myskreen_' + name, '=' ,value, { path: '/', expires: expires, domain: API.config.domain});
			$.cookie('myskreen_' + name, value, { path: '/', expires: expires }); //, domain: API.config.domain});
		}
	},
	trackEvent: function(var1, var2, var3) {
		//return; //hack test visites ga
		if (typeof _gaq != 'undefined') {
			_gaq.push(['_trackEvent', 
									var1, 
									var1 + '-' + var2, 
									var3]);
		}
	},
	geolocation: function(customSuccessCallback, customErrorCallback){
		console.log('API.geolocation', customSuccessCallback, customErrorCallback);
		function successCallback(position){
			var date = new Date();
			date.setTime(date.getTime() + (30 * 60 * 1000));
			API.cookie('latlng', position.coords.latitude + ',' + position.coords.longitude, date);
			console.log('API.geolocation', 
									'successCallback', 
									'Latitude : ' + position.coords.latitude + ', longitude : ' + position.coords.longitude);
			if (typeof customSuccessCallback != 'undefined') {
				customSuccessCallback(position.coords.latitude + ',' + position.coords.longitude);
			}
		}
		function errorCallback(error){
			console.log('API.geolocation', 'errorCallback', error);
			var msg = null;
			switch(error.code){
				case error.PERMISSION_DENIED:
					msg = 'Vous n\'avez pas autorisé l\'accès à votre position géographique.';
					break;			
				case error.POSITION_UNAVAILABLE:
					msg = 'Votre emplacement géographique n\'a pas pu être déterminé.';
					break;
				case error.TIMEOUT:
					msg = 'Le service n\'a pas répondu à temps.';
					break;
			}
			if (typeof customSuccessCallback != 'undefined') {
				customErrorCallback(msg, error.code);
			}
		}
		//browser capability
		if (!navigator.geolocation) {
			if (typeof customSuccessCallback != 'undefined') {
				customErrorCallback('Votre navigateur ne prend pas en compte la géolocalisation', 'navigator.geolocation');
			}
			return null;
		}
		this.geolocation_id = navigator.geolocation.watchPosition(successCallback, 
																															errorCallback, 
																															{enableHighAccuracy:true});
	},
	formatTimestamp: function(timestamp) {
		var time = new Date(timestamp),
		y = time.getFullYear(), 
		d = time.getDay(),
		h = time.getHours(), // 0-24 format
		mn = time.getMinutes();
		switch (time.getMonth()) {
			case 0: m = 'Janvier'; break;
			case 1: m = 'Février'; break;
			case 2: m = 'Mars'; break;
			case 3: m = 'Avril'; break;
			case 4: m = 'Mai'; break;
			case 5: m = 'Juin'; break;
			case 6: m = 'Juillet'; break;
			case 7: m = 'Août'; break;
			case 8: m = 'Septembre'; break;
			case 9: m = 'Octobre'; break;
			case 10: m = 'Novembre'; break;
			case 11: m = 'Décembre'; break;
			default: m = ''; break;
		}

		return d + ' ' + m + ' ' + y + ' à ' + h + ':' + (parseInt(mn) > 9 ? mn : '0' + mn);
	},
	isHome: function(url) {
		var url = typeof url == 'undefined' ? this.currentUrl : url;
		switch (url) {
			case '/tv':
			case '/cine':
			case '/replay-vod':
			case '/':
			case '/films':
			case '/documentaires':
			case '/series':
			case '/spectacles':
			case '/emissions':
				return true;
			break;
			default:
				return false;
			break;
		}
	},
	openIndexedDb: function(dbname, storeName, callback) {
		//callback(null); return; //desactivated
		
		if (typeof window.indexedDB == 'undefined'){
			console.warn('window.indexedDB', 'undefined');
			if (typeof callback != 'undefined') {
				callback(null);
			}
			return;
		}

		var self = this;
		console.log('API.openIndexedDb',	dbname, storeName);
		var req = window.indexedDB.open(dbname, 2);
		req.onsuccess = function (e) {
			self.db[dbname] = e.target.result;
			console.log('API.openIndexedDb', 'DONE', dbname, storeName, self.db[dbname]);

			if (typeof callback != 'undefined') { //1: read_only
				if (typeof storeName != 'undefined' && storeName != null) {
					var trans = self.db[dbname].transaction(storeName, 'readwrite');
					var store = trans.objectStore(storeName);
					callback(store);
				} else {
					callback(self.db[dbname]);
				}
			}
		}
		req.onerror = function (e) {
			console.error('API.openIndexedDb', 'Error', e.target.errorCode);
		}
		req.onupgradeneeded = function (e) {
			console.log('API.openIndexedDb', 'onupgradeneeded', dbname, storeName);
			var store = e.target.result.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
			/*switch(storeName) {
				case 'friends':
					//store.createIndex('parameter', 'parameter', { unique: false });
					//store.createIndex('value', 'value', { unique: false });
				break;
			}*/
		}
	},
	insertIndexedDb: function(dbname, storeName, storeObject, retry) {
		var self = this; 
		this.openIndexedDb(dbname, storeName, function(store){
			if (store == null) {
				console.log('API.insertIndexedDb', 'store not found, create', storeName);
				return;
			}
			console.log('API.insertIndexedDb', 'callback', store);
			store.put(storeObject);
			self.db[dbname].close();
		});
	},
	selectIndexedDb: function(dbname, storeName, id, callback) {
		var self = this; 
		this.openIndexedDb(dbname, storeName, function(store){
			if (store == null) {
				callback(null);
				return;
			}
			store.get(id).onsuccess = function(e) {
				console.log('selectIndexedDb', 'result', e.target.result);
				callback(e.target.result);
				self.db[dbname].close();
			}
		});
	},
	deleteIndexedDb: function(dbname, storeName, id) {
		this.openIndexedDb(dbname, storeName, function(store){
			if (store == null) {
				callback(null);
				return;
			}
			//Warning : bug YUICompressor > .delete() ?
			//store.delete(id).onsuccess = function(e){
			//	console.log('deleteIndexedDb', 'deleted', id);
			//}
		});
	}
}

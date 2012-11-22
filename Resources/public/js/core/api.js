// -- popin
var skXdmSocket = { postMessage: function(){} };
function skPaymentPopinResize () {
}
function skPaymentPopinEnd () {
  $('.modal').modal('hide');
}

// -- ENV
var DEV = 'benoit';
var ENV;
ENV = {
  dev: {
        env: 'dev',
        site_url: 'http://beta.' + DEV + '.myskreen.typhon.net:40011',
        v3_root: '/app_dev.php/',
        base: 'http://' + DEV + '.myskreen.typhon.net/api/',
        popin: 'https://' + DEV + '.myskreen.typhon.net/popin/',
        domain: DEV + '.myskreen.typhon.net',
        console: true
  },
  preprod: {
        env: 'preprod',
        site_url: 'http://preprod.beta.myskreen.com',
        v3_root: '/app.php/',
        base: 'http://preprod.api.myskreen.com/api/',
        popin: 'https://preprod.api.myskreen.com/popin/',
        domain: 'preprod.beta.myskreen.com',
        console: true
  },
  prod: {
        env: 'prod',
        site_url: 'http://www.myskreen.com',
        v3_root: '/',
        base: 'http://api.myskreen.com/api/',
        popin: 'https://api.myskreen.com/popin/',
        domain: 'www.myskreen.com',
        console: false
  }
}

// -- API
$.support.cors = true;
var API;
API = {
  xhr: new Array(),
  context: 'v3',
  skXdmSocket: null,
  config: null,
  dataType: 'jsonp',
  currentModalUrl: null,
  currentUrl: null,
  init: function(callback) {
    var href = document.location.href;
    API.config = href.indexOf('.net') != -1 ? ENV.dev : href.indexOf('preprod.') != -1 ? ENV.preprod : ENV.prod;
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
  quickLaunchModal: function(action, callbackOnLoad) {
    this.launchModal(this.config.popin + action, callbackOnLoad);
  },
  launchModal: function(url, callbackOnLoad) {
    console.log('API.launchModal enter', url, callbackOnLoad);
    if (this.context == 'v2') {
      this.postMessage(['modal', url]);
      return;
    }

    if (url != this.currentModalUrl) {
      $('.modal .modal-body').empty();
      this.query('GET_PROXY', 
                 url,
                 {session_uid: Skhf.session.uid,
                  proxy: 'v3'}, 
                 function(json){
                  console.log('API.launchModal', 'redirect:' + json.redirect, 'callbackOnLoad', callbackOnLoad);
                  if (typeof json.redirect != 'undefined') {
                    API.launchModal(json.redirect, callbackOnLoad);
                  } else if (json.html) {
                    $('.modal .modal-body').html(json.html);
                    API.catchFormModal(callbackOnLoad);
                  }
                });
    } else {
      callbackOnLoad();
    }

    $('.modal').modal();

    this.currentModalUrl = url;
  },
  catchFormModal: function(callbackOnLoad) {
    var self = this;
    var modal = $('.modal');
    console.log('API.catchFormModal', 'catch form');

    //form
    $('.modal-footer', modal).html($('form input[type="submit"]', modal).attr('onclick','').addClass('btn-large btn-primary'));
    $('.modal-footer', modal).append(' <a href="#" class="close">Fermer</a>');
    $('.modal-footer input[type="submit"]', modal).click(function(e){
      e.preventDefault();
      console.warn('API.catchFormModal', 'submit 1');

      $(this).attr('value', 'chargement . . .').attr('disabled', 'disabled');
      var form = $('.modal form:first')
      form.append('<input type="hidden" name="fromSerializeArray" value="1" />');
      var args = form.serializeArray();
      //var args = {};
      //jQuery.map(form.serializeArray(), function(n, i){
      //  args[n['name']] = n['value'];
      //});
      self.query('POST', form.attr('action'), args, function(json){
        console.log('API.catchFormModal', json);
        if (typeof json.redirect != 'undefined') {
          self.launchModal(json.redirect, callbackOnLoad);
        } else {
          $('.modal .modal-body').empty().html(json.html);
          self.catchFormModal(callbackOnLoad);
        }
      });
      return false;
    });
    //header
    var headerv3 = $('.modal-body #part-header-v3', modal);
    console.log('API.catchFormModal', 'headerv3', headerv3);
    if (headerv3.length > 0) {
      $('.modal-header', modal).empty().append(headerv3);
    } else {
      $('.modal-header h3', modal).html($('#part-header h1', modal).html());
    }
    //input dpad
    $('input:visible:not(.tv-component)', modal).addClass('tv-component tv-component-input');
    $('.btn:visible:not(.tv-component)', modal).addClass('tv-component');
    $('input[type="text"], input[type="email"], input[type="password"]', modal).attr('autocomplete', 'off');
    
    //error
    $('.error_list').addClass('alert alert-error').removeClass('error_list');

    if (typeof callbackOnLoad != 'undefined') {
      callbackOnLoad();
    }

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
      console.log('API.addPreference', 'callback', parameter, value, json, callback);
      if (json.success) {
        if (Skhf.session.datas.queue == null) {
          Skhf.session.datas.queue = [value];
        } else {
          Skhf.session.datas.queue.push('' + value);
        }
        var added = new Array();
        added.push(value);
        UI.loadUserPrograms(added);
        if (typeof callback != 'undefined' && callback != null) {
          callback(value);
        }
      }
    });
  },
  removePreference: function(parameter, value, callback) {
    this.query('POST', 'preference/unflag.json', {session_uid: Skhf.session.uid, type:parameter, value:value}, function(json){
      console.log('API.removePreference', 'success:' + json.success, 'callback:' + callback, parameter, value, json);
      if (json.success) {
        delete Skhf.session.datas.queue[value];
        var removed = new Array();
        removed.push(value);
        UI.unloadUserPrograms(removed);
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
    this.query('POST', '/user/markasred', {program_id: id}, function() {
      UI.markAsRed(id);
    });
  },
  query: function(method, url, data, callback, cache, version) {

    if (url.match(/^https\:\/\//)) {
      //console.log('API.query', 'http(s|)://', 'is popin', url);
    } else {
      //console.log('API.query', 'http', 'is api', url);
      var version = typeof version == 'undefined' ? '1' : version;
      var url  = this.config.base + version + '/' + url; //.replace('//', '/');
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
    // Currently, proxy POST requests
    if (method == 'POST' || method == 'DELETE' || method == 'GET_PROXY') {
      method = method.replace('_PROXY', ''); //hack GET_PROXY
      var dataType = "text json";
      var post = {};
      post["url"] = url.replace('.json','');
      post["data"] = data;
      data = post;
      url = this.config.env == 'dev' ? '/app_dev.php/proxy' : '/app.php/proxy';

    } else {
      var dataType = 'jsonp';
      if (data && typeof data === 'object'){
        //console.log(data, 'url.indexOf', url.indexOf('?'));
        url += url.indexOf('?') == -1 ? '?' : '&';
        for (var key in data) {
           url += key+'='+escape(data[key])+'&';
        }
        data=null;
      }
    }

    console.log('API.query', method, this.dataType, url, data, new Date());
    
    //Permet de benchmarker le temps d'execution des pages
    var tooLongQuery = setTimeout(function(){
      console.warn('API.query', 'too long query', new Date(), url);
    }, 1000);

    var req = $.ajax({
      url: url,
      dataType: this.dataType,
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
      console.log('API.cookie', 'set', 'myskreen_' + name, '=' ,value, { path: '/', expires: expires, domain: API.config.domain});
      $.cookie('myskreen_' + name, value, { path: '/', expires: expires }); //, domain: API.config.domain});
    }
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
  trackEvent: function(var1, var2, var3) {
    //return; //hack test visites ga
    if (typeof _gaq != 'undefined') {
      _gaq.push(['_trackEvent', 
                  var1, 
                  var1 + '-' + var2, 
                  var3]);
    }
  },
  linkV2: function(url, force, callback) {
    console.log('API.linkV2', this.context, url, this.currentUrl, 'force:' + force, callback);

    if (typeof url == 'undefined') {
      console.warn('API.linkV2', 'url undefined');
      return;
    }

    if (this.context == 'v2') {
      var url = url.replace('http://www.myskreen.com',''); //hack
      if (url != this.currentUrl || url == '\\') {
        this.postMessage(["link", url, force]);
        if (force != true) {
          if (typeof callback == 'undefined') {
            Skhf.session.initPlaylist(('/' + url).replace('//','/'));
          } else {
            callback();
          }
        }
      }
    } else {
      document.location = url.substr(0,1) == '/' ?  this.config.site_url + url : url;
    }

    this.currentUrl = url;
  },
  javascriptV2: function(script) {
    if (this.context == 'v2') {
      this.postMessage(['javascript', script]);
    }
  },
  syncV2: function(callback) {
    var self = this;

    this.context = 'v2';
    this.skXdmSocket = new easyXDM.Socket({
      onMessage:function(message, origin) {
        message = JSON.parse(message);
        console.log('API.syncV2', 'onMessage', message);
        if (message[0] == "sessionData") {
          Skhf.session.uid = message[1].uid;
          Skhf.session.sync();

        } else if (message[0] == 'ajax-nav') {
          UI.ad();

        } else if (message[0] == 'nav') {
          if (message[1] == 'reset' && !Skhf.session.datas.email) {
            $('.subnav .nav li.active').removeClass('active selected');
            //$('#top-filters li').hide();
            UI.loadFilters('home');
          }

        } else if (message[0] == 'header') {

          if (message[1] == 'collapsed') {
            if ($('#top-playlist').hasClass('in')) {
              $('#top-playlist').collapse('hide');
            }
            if (Skhf.session.datas.email) {
              API.cookie('playlist_collapsed', 1);
            }
          } else {
            API.cookie('playlist_collapsed', '');
          }

        } else if (message[0] == "preference") {
          self.togglePreference(message[1],
                                message[2], 
                                null, function(){
                                  Skhf.session.initPlaylist();
                                }, 
                                message[3]);

        } else if (message[0] == 'redirect') {
          window.open('/redirect?target=' + escape(message[1]));
          //Player.redirect(message[1]);

        } else if (message[0] == 'pathname') {
          self.currentUrl = message[1];

        } else if (message[0] == 'program_notified') {
          UI.markAsRed(message[1]);

        } else if (message[0] == 'typeahead') {
          if (message[1] == 'blur') {
            //console.log('API.syncV2', 'typeahead', 'blur', 'hide playlist');
            $('.search-query').blur();
            $('#top-playlist').collapse('hide');
          }
        }
      }
    });
    this.postMessage(['sync']);
    if (typeof callback != 'undefined') {
      callback();
    }

  },
  postMessage: function(message) {
    if (this.context == 'v2') {
      this.skXdmSocket.postMessage(JSON.stringify(message));
    }
  }
}

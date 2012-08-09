// -- popin
var skXdmSocket = { postMessage: function(){} };
function skPaymentPopinResize () {
}
function skPaymentPopinEnd () {
  $('#skModal').modal('hide');
}

// -- ENV
var ENV;
ENV = {
  dev: {
        env: 'dev',
        site_url: 'http://beta.benoit.myskreen.typhon.net:40011',
        base: 'http://benoit.myskreen.typhon.net/api/1/',
        popin: 'https://benoit.myskreen.typhon.net/popin/',
        console: true
  },
  preprod: {
        env: 'preprod',
        site_url: 'http://preprod.beta.myskreen.com',
        base: 'http://preprod.api.myskreen.com/api/1/',
        popin: 'https://preprod.api.myskreen.com/popin/',
        console: true
  },
  prod: {
        env: 'prod',
        site_url: 'http://www.myskreen.com',
        base: 'http://api.myskreen.com/api/1/',
        popin: 'https://api.myskreen.com/popin/',
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
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  quickLaunchModal: function(action, callback) {
    this.launchModal(this.config.popin + action, callback);
  },
  launchModal: function(url, callback) {
    console.log('API.launchModal', url, callback);
    if (this.context == 'v2') {
      this.postMessage(['modal', url, callback]);
      return;
    }

    if (url != this.currentModalUrl) {
      $('#skModal .modal-body').empty();
      this.query('GET', 
                 url,
                 {session_uid: Session.uid,
                  proxy: 'v3'}, 
                 function(json){
                  console.log('API.launchModal', 'redirect:'+json.redirect, callback, json);
                  if (typeof json.redirect != "undefined") {
                    API.launchModal(json.redirect, callback);
                  } else if (json.html) {
                    $('#skModal .modal-body').html(json.html);
                    API.catchFormModal(callback);
                  }
                });
    }

    $('#skModal').modal();
    /*$('#skModal').on('hide', function(e){
      e.preventDefault();
      console.log("on('hide')", callback);
      if (typeof callback != 'undefined') {
        callback();
      }
    });*/

    this.currentModalUrl = url;
  },
  catchFormModal: function(callback) {
    //console.log('API.catchFormModal', 'catch form', callback);
    $('#skModal form').submit(function(){
      var args = $(this).serializeArray();
      API.query('POST', $(this).attr('action'), args, function(json){   
        if (typeof json.redirect != "undefined") {
          //console.log('API.launchModal', 'redirect');
          API.launchModal(json.redirect, callback);
        } else {
          $('#skModal .modal-body').html(json.html);
          API.catchFormModal(callback);
        }
      });
      return false;
    });
    
    this.transfertModal($('#skModal'))
  },
  transfertModal: function(modal) {
    //console.log('API.transfertModal', modal);
    //h1 :
    $('.modal-header h3', modal).html($('#part-header h1', modal).html());
    //submit
    $(".modal-footer", modal).html($('form input[type="submit"]', modal));
    $('.modal-footer input[type="submit"]', modal).attr('onClick','').click(function(e){
      e.preventDefault();
      $('.modal-body form', modal).submit();
      $(this).attr('value', 'chargement . . .').attr('disabled', 'disabled');
    });
  },
  typeahead: function(keywords) {
    var url = 'search/autocomplete/' + keywords;
    var args = {advanced:1, session_uid:Session.uid};
    this.query('GET', url, args, function(json){
      return json;
    });
  },
  addPreference: function(parameter, value, trigger, callback, parcours) {
    this.query('POST', 'preference/flag.json', {session_uid: Session.uid, type:parameter, value:value, parcours:parcours}, function(json){
      console.log('API.addPreference', 'callback', parameter, value, json);
      if (json.success) {
        Session.datas.queue.push('' + value);
        var added = new Array();
        added.push(value);
        UI.loadUserPrograms(added);
        if (typeof callback != 'undefined') {
          callback(value);
        }
      }
    });
  },
  removePreference: function(parameter, value, trigger, callback) {
    this.query('POST', 'preference/unflag.json', {session_uid: Session.uid, type:parameter, value:value}, function(json){
      console.log('API.removePreference', 'success:' + json.success, 'callback:' + callback, parameter, value, json);
      if (json.success) {
        delete Session.datas.queue[value];
        var removed = new Array();
        removed.push(value);
        UI.unloadUserPrograms(removed);
        if (typeof callback != 'undefined') {
          callback(value);
        }
      }
    });
  },
  togglePreference: function(parameter, value, trigger, callback, parcours){
    var self = this;
    console.log('API.togglePreference', parameter, value, trigger);
    if ($.inArray('' + value, Session.datas.queue) != -1) {
      self.removePreference(parameter, value, trigger, callback);
    } else {
      self.addPreference(parameter, value, trigger, callback, parcours);
    }
  },
  markAsRed: function(id){
    this.query('POST', '/user/markasred', {program_id: id}, function() {
      UI.markAsRed(id);
    });
  },
  query: function(method, url, data, callback, cache) {

    if (url.match(/^https\:\/\//)) {
      //console.log('API.query', 'https', 'is popin', url);
    } else {
      //console.log('API.query', 'http', 'is api', url);
      var url  = this.config.base + url; //.replace('//', '/');
    }

    url = url.replace('/app_dev.php', '').replace('/app.php', ''); //developpment environment
    if (typeof data.img_width == 'undefined' && typeof data.item_height == 'undefined') {
      $.extend(data, {'img_height': Slider.item_height, 'img_width': Slider.item_width});
    }
    $.extend(data, {fromWebsite: 'v3'});

    var post = {};
    // Currently, proxy POST requests
    if (method == "POST" || method == "DELETE") {
      var dataType = "text json";
      var post = {};
      post["url"] = url.replace('.json','');
      post["data"] = data;
      data = post;
      url = '/app.php/post';

    } else {
      var dataType = "jsonp";
      if (data && typeof data==='object'){
        //console.log(data, 'url.indexOf', url.indexOf('?'));
        url += url.indexOf('?') == -1 ? '?' : '&';
        for (var key in data) {
           url += key+'='+data[key]+'&';
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
        clearTimeout(tooLongQuery); 
        if(retour.readyState == 4){
          callback(retour);
        } else {
          console.error('error getting query', retour, url, data, code, retour.statusText);
          return false;
        }
      },
      success: function(json) {     
        clearTimeout(tooLongQuery);    
        var datas = JSON.parse(JSON.stringify(json));  
        callback(datas);
      }
    });
    return req;
  },
  cookie: function(name, value){
    if (typeof value == 'undefined') {
      return $.cookie('myskreen_' + name);
    } else {
      console.log('API.cookie', 'set', 'myskreen_' + name, '=' ,value);
      $.cookie('myskreen_' + name, value);
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
  linkV2: function(url, force, callback) {
    console.log('API.linkV2', this.context, url, this.currentUrl, 'force:' + force, callback);

    if (typeof url == 'undefined') {
      console.warn('API.linkV2', 'url undefined');
      return;
    }

    if (this.context == 'v2') {
      if (url != this.currentUrl || url == '\\') {
        this.postMessage(["link", url, force]);
        if (force != true) {
          if (typeof callback == 'undefined') {
            Session.initPlaylist(('/' + url).replace('//','/'));
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
          Session.uid = message[1].uid;
          Session.sync();

        } else if (message[0] == 'history.back') {
          if (message[1] == 'add') {
            $('#history-back').show(); //UI.addHistoryBack();
          } else {
            $('#history-back').hide(); //UI.removeHistoryBack();
          }

        } else if (message[0] == 'nav') {
          if (message[1] == 'reset' && !Session.datas.email) {
            $('.subnav .nav li.active').removeClass('active');
            $('#top-filters li').hide();
          }

        } else if (message[0] == 'header') {

          if (message[1] == 'collapsed') {
            if ($('#top-playlist').hasClass('in')) {
              $('#top-playlist').collapse('hide');
            }
            if (Session.datas.email) {
              API.cookie('playlist_collapsed', 1);
            }
          } else {
            API.cookie('playlist_collapsed', '');
          }

        } else if (message[0] == "preference") {
          self.togglePreference(message[1],
                                message[2], 
                                null, function(){
                                  Session.initPlaylist();
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
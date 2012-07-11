// -- popin
var skXdmSocket = { postMessage: function(){} };
function skPaymentPopinResize () {
}
function skPaymentPopinEnd () {
  $('#skModal').modal('hide');
}


// -- API
$.support.cors = true;
var API;
API = {
  context: 'v3',
  skXdmSocket: null,
  conf: {site_url: 'http://beta.benoit.myskreen.typhon.net:40011', base: 'http://benoit.myskreen.typhon.net/api/1/',  popin: 'https://benoit.myskreen.typhon.net/popin/'},
  //conf: {site_url: 'http://preprod.beta.myskreen.com', base: 'http://preprod.myskreen.com/api/1/',  popin: 'https://preprod.myskreen.com/popin/'},
  dataType: 'jsonp',
  currentModalUrl: null,
  currentUrl: null,
  quickLaunchModal: function(action, callback) {
    this.launchModal(this.conf.popin + action, callback);
  },
  launchModal: function(url, callback) {
    if (url != this.currentModalUrl) {
      //console.log('API.launchModal', url);
      $('#skModal .modal-body').empty();
      this.query('GET', 
                 url, 
                 {session_uid: Session.uid,
                  proxy: 'v3'}, 
                 function(json){
                  //console.log('API.launchModal', 'redirect:'+json.redirect, callback, json);
                  if (typeof json.redirect != "undefined") {
                    API.launchModal(json.redirect, callback);
                  } else if (json.html) {
                    $('#skModal .modal-body').html(json.html);
                    API.catchFormModal(callback);
                  }
                });
    }

    $('#skModal').modal();
    $('#skModal').on('hide', function(){ 
      console.log("on('hide')", callback);
      if (typeof callback != 'undefined') {
        callback();
      }
    });

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
  addPreference: function(parameter, value, callback) {
      this.query('POST', 'preference/flag.json', {session_uid: Session.uid, type:parameter, value:value}, function(json){
        if (json.success) {
          callback(value);
        }
      });
  },
  removePreference: function(parameter, value, callback) {
      this.query('POST', 'preference/unflag.json', {session_uid: Session.uid, type:parameter, value:value}, function(json){
        if (json.success) {
          callback(value);
        }
      });
  },
  togglePreference: function(parameter, value, trigger, callback){
    console.log('API.togglePreference', parameter, value, trigger);
    if ($.inArray(value, Session.datas.queue)) {
      API.removePreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            Session.sync(function(){
              Session.initSelector();
            });
            if (typeof trigger != 'undefined') {
              trigger.html('<i class="icon-plus-sign"></i> Suivre / voir + tard').removeClass('btn-primary');
            }
          break;
        }
        if (typeof callback != 'undefined') {
          callback(value);
        }
      });
    } else {
      API.addPreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            Session.sync(function(){
              Session.initSelector();
            });
            if (typeof trigger != 'undefined') {
              trigger.html('<i class="icon-ok-sign"></i> Dans vos favoris').addClass('btn-primary');
            }
          break;
        }
        if (typeof callback != 'undefined') {
          callback(value);
        }
      });
    }
  },
  query: function(method, url, data, callback, cache) {
    
    if (url.match(/^https\:\/\//)) {
      //console.log('API.query', 'https', 'is popin', url);
    } else {
      //console.log('API.query', 'http', 'is api', url);
      var url  = this.conf.base + url;
    }

    url = url.replace('/app_dev.php', '').replace('/app.php', ''); //developpment environment
    if (typeof data.img_width == 'undefined' && typeof data.item_height == 'undefined') {
      $.extend(data, {img_height: Slider.item_height, img_width: Slider.item_width});
    }
    $.extend(data, {fromWebsite: 'v3'});

    var post = {};
    // Currently, proxy POST requests
    if (method == "POST" || method == "DELETE") {
      var dataType = "text json";
      var post = {};
      post["url"] = url;
      post["data"] = data;
      data = post;
      url = '/post';
     
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
      cache: cache != 'undefined' ? cache : false,
      data: data,
      type: method,
      jsonp: 'callback',
      async: true,
      crossDomain: true,
      error: function(retour, code) {
        clearTimeout(tooLongQuery); 
        console.error('error getting query', retour, url, data, code, retour.statusText);
        if(retour.statusText == 'abort'){
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
  linkV2: function(url) {
    console.log('API.linkV2', url, this.context);
    if (this.context == 'v2') {
      this.postMessage(["link", url]);
      Session.initPlaylist(url);
    } else {
      document.location = this.conf.site_url + url;
    }
  },
  javascriptV2: function(script) {
    if (this.context == 'v2') {
      this.postMessage(["javascript", script]);
    }
  },
  syncV2: function() {
    var self = this;

    this.context = 'v2';
    this.skXdmSocket = new easyXDM.Socket({
      onMessage:function(message, origin) {
        message = JSON.parse(message);
        console.log('API.syncV2', 'onMessage', message);
        if (message[0] == "sessionData") {
          Session.uid = message[1].uid;
          Session.sync();

        } else if (message[0] == "history.back") {
          if (message[1] == "add") {
            $('#history-back').show(); //UI.addHistoryBack();
          } else {
            $('#history-back').hide(); //UI.removeHistoryBack();
          }

        } else if (message[0] == "nav") {
          if (message[1] == "reset") {
            $('.subnav .nav li.active').removeClass('active');
          }

        } else if (message[0] == "header") {
          if (message[1] == "collapsed") {
            $('#top-playlist').collapse('hide');
          } else {
            $('#top-playlist').collapse('show');
          }

        } else if (message[0] == "preference") {
          self.togglePreference(message[1], message[2]);

        } else if (message[0] == "redirect") {
          window.open('/redirect?target=' + escape(message[1]));
          //Player.redirect(message[1]);

        } else if (message[0] == "pathname") {
          self.currentUrl = message[1];
          Session.initPlaylist(message[1]);
        }
      }
    });
    this.postMessage(["sync"]);

    //height header
    $('a[data-target="#top-playlist"]').click(function (e) {
      self.postMessage(["header", $('#top-playlist').hasClass('in') ? "remove_playlist": "add_playlist"]);
    });
  },
  postMessage: function(message) {
    if (this.context == 'v2') {
      this.skXdmSocket.postMessage(JSON.stringify(message));
    }
  }
}
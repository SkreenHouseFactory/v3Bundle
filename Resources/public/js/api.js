// -- popin
var skXdmSocket = { postMessage: function(){} };
function skPaymentPopinResize () {
}


// -- API
var API;
API = {
  context: 'v3',
  skXdmSocket: null,
  site_url: 'http://beta.benoit.myskreen.typhon.net:40011',
  base: 'http://benoit.myskreen.typhon.net/api/1/', 
  popin: 'https://benoit.myskreen.typhon.net/popin/',
  dataType: 'json',
  currentModalUrl: null,
  quickLaunchModal: function(action, callback) {
    this.launchModal(this.popin+action);
  },
  launchModal: function(url, callback) {
    if (url != this.currentModalUrl) {
      var url = url.indexOf('proxy=v3') == -1 ? url + '?proxy=v3' : url;
      console.log('API.launchModal', url);
      $('#skModal .modal-body').empty();
      
      this.query('GET', 
                 url, 
                 null, 
                 function(json){
                  console.log('API.launchModal', 'callback', json);
                  if (typeof json.redirect != "undefined") {
                    console.log('API.launchModal', 'redirect');
                    API.launchModal(json.redirect, callback);
                  } else if (json.html) {
                    $('#skModal .modal-body').html(json.html);
                    API.catchFormModal();
          
                    //transfer h1 :
                    $('#skModal .modal-header h3').html($('#part-header h1', $(json.html)).html());
                  }
                });
    }
    $('#skModal .modal-footer').hide();
    $('#skModal').modal();
    $('#skModal').on('hidden', callback);
    
    this.currentModalUrl = url;
  },
  catchFormModal: function() {
    console.log('API.catchFormModal', 'catch form');
    $('#skModal form').submit(function(){
      var args = $(this).serializeArray();
      API.query('POST', $(this).attr('action'), args, function(json){   
        if (typeof json.redirect != "undefined") {
          console.log('API.launchModal', 'redirect');
          API.launchModal(json.redirect, callback);
        } else {
          $('#skModal .modal-body').html(json.html);
          API.catchFormModal();
        }
      });
      return false;
    });
  },
  typeahead: function(keywords) {
    var url = this.base + 'search/autocomplete/' + keywords;
    var args = {advanced:1, session_uid:Session.uid};
    this.query('GET', url, args, function(json){
      return json;
    });
  },
  addPreference: function(parameter, value, callback) {
      this.query('POST', this.base + 'preference/flag/'+Session.uid, {parameter:parameter, value:value}, function(json){
        if (json.success) {
          callback();
        }
      });
  },
  removePreference: function(parameter, value, callback) {
      this.query('POST', this.base + 'preference/unflag/'+Session.uid, {parameter:parameter, value:value}, function(json){
        if (json.success) {
          callback();
        }
      });
  },
  togglePreference: function(parameter, value, trigger, callback){
    console.log('API.togglePreference', parameter, value, trigger, callback);
    if ($.inArray(value, Session.datas.queue)) {
      API.removePreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            trigger.html('<i class="icon-plus-sign"></i> Suivre / voir + tard').removeClass('btn-primary');
          break;
        }
      }, callback);
    } else {
      API.addPreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            trigger.html('<i class="icon-ok-sign"></i> Dans vos favoris').addClass('btn-primary');
          break;
        }
      }, callback);
    }
  },
  query: function(method, url, data, callback, cache) {
    
    if (url.match(/^https\:\/\//)) {
      console.log('API.query', 'https', 'is popin', url);
    } else {
      console.log('API.query', 'http', 'is api', url);
      var url  = this.base + url;
    }

    url = url.replace('/app_dev.php', ''); //developpment environment

    $.extend(data, {img_height: Slider.item_height, img_width: Slider.item_width, fromWebsite: true});

    var post = {};
    // Currently, proxy POST requests
    if (method == "POST" || method == "DELETE") {
      var dataType = "text json";
    } else {
      var dataType = "jsonp";
      if (data && typeof data==='object'){
        //console.log('url.indexOf', url.indexOf('?'));
        url += url.indexOf('?') == -1 ? '?' : '&';
        for (var key in data) {
           url += key+'='+data[key]+'&';
        }
        data=null;
      }
    }

    console.log('API.query', method, url, data);
    
    //Permet de benchmarker le temps d'execution des pages
    var tooLong = setTimeout(function(){
      console.warn('!! API.query : too long request', (new Date()), url);
    }, 1000);

    var req = $.ajax({
      url: url,
      dataType: this.dataType,
      cache: false, //Attention mémoire nodejs
      data: data,
      type: method,
      jsonp: "callback",
      async: true,
      crossDomain: true,
      error: function(retour, code) {
        clearTimeout(tooLong); 
        console.warn('error getting query',retour, url, data, code);
        if(retour.statusText == 'abort'){
          return false;
        }

        retour.context = { method:method, url:url, data:data };
        console.log('return', retour);
        if(typeof(callback) != 'undefined') callback(retour, null);
      },
      success: function(json) {     
        clearTimeout(tooLong);    
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
      document.location = this.site_url + url;
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
        console.log('msg v2', message);
        if (message[0] == "sessionData") {
          Session.signin(message[1]);

        } else if (message[0] == "history.back") {
          if (message[1] == "add") {
            $('#history-back').show(); //UI.addHistoryBack();
          } else {
            $('#history-back').hide(); //UI.removeHistoryBack();
          }
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
    this.skXdmSocket.postMessage(JSON.stringify(message));
  }
}
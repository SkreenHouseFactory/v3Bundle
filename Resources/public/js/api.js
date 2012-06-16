// -- popin
var skXdmSocket = { postMessage: function(){} };
function skPaymentPopinResize () {
}


// -- API
var API;
API = {
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
      console.log('API.launchModal', url, url.indexOf('proxy=v3'));
      //var url = url.indexOf('proxy=v3') == -1 ? url + '?proxy=v3' : url;
      this.query('GET', url+'?proxy=v3', null, function(json){
        console.log('API.launchModal', 'callback', json);
        if (typeof json.redirect != "undefined") {
          console.log('API.launchModal', 'redirect');
          API.launchModal(json.redirect, callback);
        } else if (json.html) {
          $('#skModal .modal-body').html(json.html);
          API.catchFormModal();

          //transfer h1 :
          $('#skModal .modal-header h3').html($('#part-header h1', $(json.html)));
        }
      });
    }
    $('#skModal').modal();
    $('#myModal').on('hidden', callback);
    
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
  togglePreference: function(parameter, value, trigger){
    console.log('API.togglePreference', parameter, value, trigger);
    if ($.inArray(value, Session.datas.queue)) {
      API.removePreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            trigger.html('<i class="icon-plus-sign"></i> Suivre / voir + tard').removeClass('btn-primary');
          break;
        }
      });
    } else {
      API.addPreference(parameter, value, function() {
        switch(parameter) {
          case 'like':
            trigger.html('<i class="icon-ok-sign"></i> Dans vos favoris').addClass('btn-primary');
          break;
        }
      });
    }
  },
  query: function(method, url, data, callback, cache) {
    
    if (url.match(/^https\:\/\//)) {
      console.log('API.query', 'https', 'is popin', url);
    } else {
      console.log('API.query', 'http', 'is api', url);
      var url  = this.base + url;
    }

    console.log('API.query', method, url, data);

    var post = {};
    // Currently, proxy POST requests
    if (method == "POST" || method == "DELETE") {
      var dataType = "text json";
    } else {
      var dataType = "jsonp";
      if (data && typeof data==='object'){
        url += '?';
        for (var key in data) {
           url += key+'='+data[key]+'&';
        }
        url+='&fromWebsite=1';
        data=null;
      }
    }
    
    //Permet de benchmarker le temps d'execution des pages
    var tooLong = setTimeout(function(){
      console.warn('!! API.query : too long request', url, (new Date()));
    },2000);

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
    if (Session.context == 'v2') {
      Session.postMessage(["link", url]);
      Session.initPlaylist(url);
    } else {
      document.location = url;
    }
  },
  javascriptV2: function(script) {
    if (Session.context == 'v2') {
      Session.postMessage(["javascript", script]);
    }
  }
}
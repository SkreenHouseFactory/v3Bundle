// -- API
var API;
API = {
  query: function(method, url, data, callback, cache) {
    var root = this.root;
    var post = {};

    // Currently, proxy POST requests
    if (method == "POST" || method == "DELETE") {
      url = url.match(/^http\:\/\//) ? url: "http://"+root +"api/1/"+ url;
      var dataType = "text json";
    } else {
      var dataType = "jsonp";
      if (data && typeof data==='object'){
        url += '?';
        _.each(data, function (valeur, clef){
          url += clef+'='+valeur+'&';
        });
        url+='&fromWebsite=1';
        data=null;
      }
      if(url.match(/^https\:\/\//)) url.match(/^https\:\/\//) ? url: "https://"+root +"api/1/"+ url;
      else url = url.match(/^http\:\/\//) ? url: "http://"+root +"api/1/"+ url;
    }

    console.log('query called -->',method, url, data);
    
    //Permet de benchmarker le temps d'execution des pages
    var tooLong = setTimeout(function(){
      console.warn('!! Too long request to API', url, (new Date()));
    },2000);

    var req = API.datasource.request({
      url: url,
      dataType: dataType,
      cache: false, //Attention mémoire nodejs
      data: data,
      type: method,
      jsonp: "callback",
      error: function(retour, code) {
        clearTimeout(tooLong); 
        console.warn('error getting query',retour, url, data, code);
        if(retour.statusText == 'abort'){
          return false;
        }

        retour.context = { method:method, url:url, data:data };
        console.log('## retourn', retour);
        if(typeof(callback) != 'undefined') callback(retour, null);
      },
      success: function(json) {     
        clearTimeout(tooLong);      
        var datas = JSON.parse(JSON.stringify(json));
        callback(null, datas);
      }
    });
    return req;
  }
}
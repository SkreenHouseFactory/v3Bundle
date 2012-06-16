// -- UI
var UI;
UI = {
  player: null,
  //typeahead
  typeahead: function(searchbox){
    console.log('UI.typeahead', searchbox);
    $(searchbox).typeahead({
      items: 10,
      source: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
      /*source: function (typeahead, query) {
        console.log('UI.typeahead', 'query:'+query);
        return API.query('GET', API.base + 'search/autsuggest/' +query, null, function(data){
          //return typeahead.process(data);
         });
      }*/
    });
  },
  //player
  loadPlayer: function(trigger) {
    var url = trigger.data('url');
    var embed = trigger.data('embed');
    this.player = $('#top-player');
    if (embed) {
      switch(embed.type) {
        case 'html5':
          this.player.html('loading embed html5 ...'+embed.url);
        break;
        case 'swf':
          this.player.html('loading embed swf …'+embed.url);
        break;
        case 'iframe':
          this.player.html('<iframe src="'+embed.url+'" frameborder="0"></iframe>');
        break;
      }
    } else if (trigger.data('url')) {
      this.player.html('<iframe src="'+url+'" frameborder="0"></iframe>');
    }
    
    this.player.collapse('show');
  }
}
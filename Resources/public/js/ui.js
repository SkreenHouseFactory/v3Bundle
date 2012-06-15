// -- UI
var UI;
UI = {
  //slider
  loadSlider: function(slider) {
    if ($('ul li', slider).length <= 5) {
      return;
    }
    var container = $('.slider-container ul', slider);
    console.log('UI.slider', slider);
    $('.next, .prev', slider).css({'visibility':'visible'});
    $('.next', slider).bind('click', function(){
      console.log('next', container.css('left'), slider.css('width'));
      if (parseInt(container.css('left')) < 2000 || container.css('left') == 'auto') {
        container.animate({left: '+=-'+parseInt(slider.css('width'))});
      }
    });
    $('.prev', slider).bind('click', function(){
      console.log('prev', container.css('left'), slider.css('width'));
      if (parseInt(container.css('left')) > -2000) {
        container.animate({left: '+='+parseInt(slider.css('width'))});
      }
    });
  },
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
  unloadSlider: function(slider) {
    $('.next, .prev', slider).css({'visibility':'hidden'});
    $('.next, .prev', slider).unbind('click');
  }
}
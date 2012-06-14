// -- UI
var UI;
UI = {
  //slider
  slider: function(slider) {
    if ($('#top-playlist ul li').length <= 5) {
      return;
    }
    $('.next, .prev').css({'visibility':'visible'});
    $('.next').click(function(){
      var container = $('.slider-container', slider);
      console.log('next', container.css('left'), slider.css('width'));
      if (parseInt(container.css('left')) < 2000 || container.css('left') == 'auto') {
        container.animate({left: '+=-'+parseInt(slider.css('width'))});
      }
    });
    $('.prev').click(function(){
      var container = $('.slider-container', slider);
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
      source: function (typeahead, query) {
        console.log('UI.typeahead', 'query:'+query);
        return API.query('GET', API.base + 'search/autsuggest/' +query, null, function(data){
          //return typeahead.process(data);
         });
      }
    });
  }
}
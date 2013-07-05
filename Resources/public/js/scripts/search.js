// -- search
var shouldDisplayMore = new Array();
var query = $('.search-query').val();
var elementsPerPage = 30;
var offset = new Array();

$(document).ready(function(){
  if ($('#view-search').length) {
    //youtube
    var trigger = $('#youtube[data-more-streaming-query]');
    if (trigger && trigger.data('more-streaming-query')) {
      console.log('data-more-streaming-query', trigger);
      var url = 'program/more-streaming-query/' + encodeURIComponent(trigger.data('more-streaming-query')) + '.json?nb_results=30';
      API.query(
        'GET',
        url,
        {nb_results: 30},
        function(programs) {
          if (programs.length == 0 || typeof programs.length == 'undefined') {
            $('#trigger-youtube').parent().addClass('hide');
            return;
          }
          //TODO : sort by duration ?
          console.log('more-streaming', ' callback', programs.length);
          $('#trigger-youtube').append(' <span>' + programs.length + '</span>');
          if ($('#triggers li').length == 1) {
            $('#trigger-youtube').trigger('click');
          }
          var container = $('#ytCarousel .carousel-inner .item:first-child');
          var c_index = 0;
          var nb_page = 10;
          for (var i = 0; i < programs.length; i++) {
            //console.log('youtube callback', 'c_index:' + c_index, 'modulo:' + i%8, container);
            if (i%nb_page == 0) {
              c_index++;
              var item = $('<div class="item' + (i ==0 ? ' active' : '') + '"></div>');
              container = $('#carousel-youtube .carousel-inner').append(item);
            }
            item.append('<a href="#" data-couchmode=\'{"type": "remote", "id": "' + encodeURIComponent(url).replace(/'/g, '%27') + '", "hide_sliders": "1", "autoplay": "' + programs[i].id + '"}\' class="pull-left">' +
                           '<span>' + programs[i].duration + ' min.</span>' +
                           '<img class="img-polaroid" alt="' + programs[i].title + '" src="' + programs[i].picture + '" />' +
                           '<div class="title">' + programs[i].title + '</div>' +
                           '</a>');
          }
          if (programs.length > nb_page) {
            $('#carousel-youtube').carousel().carousel('pause').removeClass('hide'); //{interval: 7000, pause: 'hover'}
            $('#carousel-youtube').css("height","400px");
            $('#youtube').append('<p class="alert alert-info">Ces extraits sont récupérés automatiquement sur Youtube notamment. Il se peut qu\'ils ne correspondent pas tout à fait au programme recherché et les sites référencés sont seuls responsables du contenu qu\'ils proposent.</p>');
          
          }
        });
    }
  }
});

$(document).scroll(function() {
  var activeFormat = $(".tab-pane.active").attr("id");
  if (!(activeFormat in shouldDisplayMore))
    shouldDisplayMore[activeFormat] = true;

  if (activeFormat == "youtube")
    return;

  if (shouldDisplayMore[activeFormat] && ($('#bottom-search-results').offset().top - ($(window).scrollTop() + $(window).height())) < 0) {
    console.log("on charge la suite");
    var url = 'search/' + encodeURIComponent(query) + '.json';

    shouldDisplayMore[activeFormat] = false;
    if (activeFormat in offset)
      offset[activeFormat] += elementsPerPage;
    else
      offset[activeFormat] = elementsPerPage;

    console.log("activeFormat : " + activeFormat + " / offset actuel : " + offset[activeFormat]);

    var params = { nb_results: elementsPerPage, offset: offset[activeFormat] };
    if (activeFormat == "nouveautes") {
      params["with_new"] = 1;
    } else {
      params["format"] = activeFormat;
    }
    $('#view-search').append('<div class="loading bar"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>');
  API.query('GET',
              url,
              params,
              function(results) {
                var slider = new BaseSlider("","",$(".tab-pane.active").children().first());
                if (activeFormat != "nouveautes") {
                  slider.insertPrograms(results.programs, function() {
                    if (results.count >= (offset[activeFormat] + elementsPerPage))
                      shouldDisplayMore[activeFormat] = true;
                  });
                } else {
                  slider.insertPrograms(results.Nouveautés, function() {
                    if (results.count.nouveautes >= (offset[activeFormat] + elementsPerPage))
                      shouldDisplayMore[activeFormat] = true;
                  });
                }
                $('.loading.bar').remove();
              });
  }
});
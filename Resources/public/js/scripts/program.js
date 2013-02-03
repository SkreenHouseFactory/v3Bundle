// -- program
$(document).ready(function(){
	if ($('#view-program').length) {

	  //no deportes
	  if ($('#trigger-deportes').data('nb') == 0) {
	    $('#triggers li:nth-child(2) a').trigger('click');
	  }

	  //ics
	  $('[data-ics-occurrence]').click(function(e){
	    e.preventDefault();
	    document.location = API.config.base + '1/icsfile/' + $(this).data('id')  + '.ics';
	    return false;
	  });

	  //episodes
	  $('#program-offers .episode').live('hover', function(event) {
	    var trigger = $(this);
	    if (event.type == 'mouseover' || event.type == 'mouseenter') {
	      if (!trigger.data('loaded')) {
	        API.query('GET',
	                  'program/' + $(this).data('episode-id') + '.json',
	                  {
	                    with_description: 1,
	                    img_width: 200,
	                    episode_only: 1
	                  },
	                  function(json) {
	                    $('.popover:visible').hide();
	                    trigger.data('loaded', true);
	                    if (json.description != null) {
	                      var picture = json.picture != null ? '<hr/><p align="center"><img src="' + json.picture + '" alt="' + json.title + '" />' : '';
	                      var content = '<strong>' + 
	                                    (json.season_number ? ' Saison ' + json.season_number : '') + 
	                                    (json.episode_number ? ' Episode ' + json.episode_number : '') + 
	                                    (json.season_number || json.episode_number  ? ' - ' : '') + 
	                                    (json.year != null ? json.year : '') +
	                                    '</strong><br/><small>' + json.description + '</small>' + picture + '</p>';
	                      trigger.attr('data-content', content);
	                      trigger.popover('show');
	                    } else {
	                      trigger.attr('data-content', '');
	                    }
	                  });
	      } else if (trigger.attr('data-content')) {
	        $('.popover:visible').hide();
	        trigger.popover('show');
	      }
	    } else {
	      trigger.popover('hide');
	    }
	  });
    
	  //youtube
	  var trigger = $('#view-program [data-more-streaming]');
	  if (trigger &&
	      trigger.data('more-streaming')) {
	    console.log('data-more-streaming', trigger);
	    var url = 'program/more-streaming/' + trigger.data('more-streaming') + '.json';
	    API.query('GET',
	              url,
	              {nb_results: 24},
	              function(programs) {
	                if (programs.length == 0 || typeof programs.length == 'undefined') {
	                  $('#trigger-bonus').parent().addClass('hide');
	                  return;
	                }
	                //TODO : sort by duration ?
	                console.log('more-streaming', ' callback', programs.length);
	                $('#trigger-bonus').append(' (' + programs.length + ')');
	                if ($('#triggers li').length == 1) {
	                  $('#trigger-bonus').trigger('click');
	                }
	                var container = $('#ytCarousel .carousel-inner .item:first-child');
	                var c_index = 0;
	                var nb_page = 8;
	                for (var i = 0; i < programs.length; i++) {
	                  //console.log('youtube callback', 'c_index:' + c_index, 'modulo:' + i%8, container);
	                  if (i%nb_page == 0) {
	                    c_index++;
	                    var item = $('<div class="item' + (i ==0 ? ' active' : '') + '"></div>')
	                    container = $('#ytCarousel .carousel-inner').append(item);
	                  }
	                  item.append('<a href="#" data-couchmode=\'{"type": "remote", "id": "' + encodeURIComponent(url) + '", "hide_sliders": "1", "autoplay": "' + programs[i].id + '"}\' class="pull-left">' +
	                                 '<span>' + programs[i].duration + ' min.</span>' +
	                                 '<img class="img-polaroid" alt="' + programs[i].title + '" src="' + programs[i].picture + '" />' +
	                                 '<div class="title">' + programs[i].title + '</div>' +
	                                 '</a>');
	                }
	                if (programs.length > nb_page) {
	                  $('#ytCarousel').carousel().carousel('pause').removeClass('hide'); //{interval: 7000, pause: 'hover'}
	                }
	              });
	  };
	}
});
$(document).ready(function(){
	console.log('scripts', 'load scripts/ui.js');
	// -- ui link/url
	$('a[data="url"]').live('click', function(e){
	  e.preventDefault();
	  console.log('ui link/url', 'a[data="url"]');
	  API.linkV2($(this).data('url'));
	  return false;
	});
	$('a.link-v2').live('click', function(e){
	  console.log('ui link/url', 'linkV2');
	  e.preventDefault();
	  API.linkV2($(this).attr('href'), $(this).hasClass('link-force'));
	  return false;
	});
	$('a.javascript-v2').live('click', function(e){
	  console.log('ui link/url', 'javascriptV2');
	  e.preventDefault();
	  API.javascriptV2($(this).attr('href').replace('javascript://',''));
	  return false;
	});
	var triggerModal = getUrlParameter('modal')
	if (triggerModal) {
		API.quickLaunchModal(triggerModal);
	}

	$('a[data-modal], [data-modal-remote]').live('click', function(e){
	  console.log('script', 'a[data-modal], [data-modal-remote]', 'click');
	  e.preventDefault();
		var trigger = $(this);
	  if (trigger.data('modal') == 'remote' || trigger.data('modal-remote')) {
			var url = trigger.data('modal-remote') ? trigger.data('modal-remote') : trigger.attr('href');
	    var args = {};
			if (!url.match(/^http(s|)\:\/\//)) {
	      url  = API.config.v3_url + url;
				$.extend(args, {dataType: 'text html'});
	    } 
	    UI.appendLoader($('.modal .modal-body').empty(), 1000);
			API.query('GET', url, args, function(data){
				//html
				if (typeof data == 'object' && typeof data.html != 'undefined') {
					$('.modal .modal-body').html(data.html);
				} else {
	      	$('.modal .modal-body').html(data);
				}
				//form
				API.catchForm($('.modal'));
				//title
				if (trigger.data('modal-title')) {
	    		$('.modal .modal-header h3').html(trigger.data('modal-title'));
				}
				//message
				if (trigger.data('modal-message')) {
		      $('.modal .modal-body').prepend('<p class="alert alert-success">' + trigger.data('modal-message') + '</p>');
				}
	      $('.modal').modal('show');
			})
	  } else {
			API.quickLaunchModal(trigger.data('modal'));
			if (trigger.data('modal') == 'card') { //TODO : use UI.callbackModal
				$('.modal').on('hidden',function(e) {
				 e.preventDefault();
					var url = document.location.toString();
					if (url.match('#')) {
						url = url.split("#")[0];
					}
			   	API.linkV2(url);
			   	return false;
				});
			}
	  }
	  return false;
	});

	// -- ui form
	$('[data-form="catch"]').each(function(){
	  var form = $(this);
	  API.catchForm(form, function(json){
	    //callback
	    console.log('ui form catched', form);
			// Modification préférences utilisateur
			if (form.attr('name') == 'user_settings_profile_form') {
				if ((typeof(json) != 'undefined') && (typeof(json.success) != 'undefined')) {
	//					console.log("la value",$('input[name="update_mail"]').attr('value'));
					$('.username').html($('input[name="update_mail"]',form).attr('value'));
				}
			} else if (form.attr('name') == 'user_settings_password_form') {
			}
	  });
	});

	// -- ui modal
	if ($('.modal').length > 0) {
		$('.modal').on('show', function(){
		  $('.popover:visible').popover('hide');
		  Player.pause();
		  carousels = $('.carousel');
		  if (carousels.length > 0) {
		    carousels.each(function(){
		      $(this).carousel('pause');
		    });  
		  }
		});
		$('.modal').on('hidden', function(){
		  $('.popover:visible').popover('hide');
		  $('.modal .modal-body').empty();
    
		  //hack addtofavorite fb + callback modal
		  if (UI.callbackModal) {
		    UI.callbackModal();
		    UI.callbackModal = null;
		  }
		  //TODO : Player.play();
		  carousels = $('.carousel');
		  if (carousels.length > 0) {
		    carousels.each(function(){
		      $(this).carousel('cycle');
		    });
		  }
		});
	}

	// -- ui actions : play
	$('.slider li:not(.selector)').live('click', function(e){
	  console.log('script', '.slider li:not(.selector)', $('a.title', this));
	  document.location = API.config.v3_root + $('a.title', this).attr('href');
	  return false;
	});
	/*
	  if ($(this).parent().parent().find('.badge')) {
	    API.markAsRed($(this).parent().data('id'));
	  }
	});
	*/

	// -- carousel autoload
	$('[data-carousel-autoload="1"]').each(function(){
	  console.log('script', 'carousel-autoload', $(this));
	  $(this).carousel({interval: 7000, pause: 'hover'});
	  $(this).data('carousel-loaded', 1);
	});

  //autoload sliders
  $('.slider[data-autoload="1"]').each(function(){
    new BaseSlider({}, function(){}, $(this));
    //console.log('UI.init', 'autoload sliders', $(this));
  });

	// -- nav-alpha-client
	$('.pagination-client-alpha li').click(function(){
	  console.log('script', 'nav-alpha-client', '[data-alpha="' + $('a', this).html() + '"]', $('[data-alpha="' + $('a', this).html() + '"]'));
	  if ($('a', this).html().length > 1) {
	    $('[data-alpha]').show();
	  } else {
	    $('[data-alpha]').hide();
	    $('[data-alpha="' + $('a', this).html() + '"]').show();
	  }
	  $('.pagination-client-alpha li').removeClass('active');
	  $(this).addClass('active');
	});

	// -- popover
	if ($('[data-content]').length > 0) {
		$('[data-content]').popover();
	}

	// -- tooltip
	if ($('[rel="tooltip"]').length > 0) {
		$('[rel="tooltip"]').tooltip();
	}

	// -- btn-radio
	$('[data-toggle="buttons-radio"] > *').click(function(){
	  $('> *', $(this).parent()).removeClass('active btn-primary');
	  $(this).addClass('active btn-primary');
	});

	/* TOUCH */
	if ($('html').hasClass('touch')) {
	  $('html.touch .tv-component, html.touch .tv-component *').live('touchstart', function(e){
	    e.preventDefault();
	    e.stopPropagation();

	    $(this).trigger('click');
	    return false;
	  });
	}
});
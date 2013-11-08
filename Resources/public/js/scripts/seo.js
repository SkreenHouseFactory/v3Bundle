// remplace les liens non visible par google par des liens visibles

$(document).ready(function(){
	$('[data-link-to-replace]').each(function(){
		var node = '<a href="'+ $(this).data('link-to-replace') +'">'+$(this).html()+'</a>';
		$(this).replaceWith(node);
    
	});
  $('.pager').each(function(){
		var node = $(this).html();
    $('.pager_to_replace').addClass('pager').html(node);
  });
});
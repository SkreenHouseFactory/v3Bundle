// remplace les liens non visible par google par des liens visibles

$(document).ready(function(){
	$('[data-link-to-replace]').each(function(){
		var node = '<a href="'+ $(this).data('link') +'">'+$(this).html()+'</a>';
		$(this).replaceWith(node);
    
	});
});
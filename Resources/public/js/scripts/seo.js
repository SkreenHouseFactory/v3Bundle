// remplace les liens non visible par google par des liens visibles

$(document).ready(function(){
	seo.transform();
});
var seo;
seo = {
  rot13: function(s) {
   var b = [], c, i = s.length,
    a = 'a'.charCodeAt(), z = a + 26,
    A = 'A'.charCodeAt(), Z = A + 26;
   while(i--) {
    c = s.charCodeAt( i );
    if( c>=a && c<z ) { b[i] = this.rot( c, a, 13 ); }
    else if( c>=A && c<Z ) { b[i] = this.rot( c, A, 13 ); }
    else { b[i] = s.charAt( i ); }
   }
   return b.join( '' );
  },
   rot: function( t, u, v ) {
   return String.fromCharCode( ( ( t - u + v ) % ( v * 2 ) ) + u );
  },
    transform: function() {
      $('[data-link-to-replace]').each(function(){
        var link = unescape(seo.rot13($(this).data('link-to-replace')));
        var node = $('<a href="'+ link +'">'+$(this).html()+'</a>');
        $.each(this.attributes, function(){
          // console.log('scripts/seo.js', 'this.attributes', this.name, this.value);
          if(this.name != 'data-link-to-replace'){
            node.attr(this.name, this.value);
          }
        });
        node.addClass('seo-replaced');
        $(this).replaceWith(node.get(0));
      });

      $('.pager').each(function(){
        var node = $(this).html();
        $('.pager_to_replace').addClass('pager').removeClass('pager_to_replace').html(node);
      });
    }
}
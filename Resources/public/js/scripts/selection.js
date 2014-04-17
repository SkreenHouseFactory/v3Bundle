// Sticky page selection
$('.view-selections #selection-related').stick_in_parent({offset_top: 70})
  .on('sticky_kit:bottom', function(e) {
    $('#selection-related').parent().attr('style', function(i, style) {
      return style.replace(/position[^;]+;?/g, '');
    });
    $('.view-selections #selection-related').css({
      position: 'absolute',
      bottom: '0px',
      top: 'auto'
    });
  })
;
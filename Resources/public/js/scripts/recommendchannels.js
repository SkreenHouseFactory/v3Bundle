$(document).ready(function(){
  
  
  /* svod */
  console.log('start drawing chart svod');
  var titles = [];
  var coords = []
  $('#svod li[data-channel-recommend-name]').each(function(){
    titles.push($(this).data('channel-recommend-name'))
    coords.push($(this).data('channel-recommend-score'))
  })
  console.log('chart data', titles, coords);

  var r = Raphael("svod-chart"),
      txtattr = { font: "12px sans-serif" };
  r.text(160, 10, "Recommandations SVOD").attr(txtattr);
  r.barchart(10, 10, 470, 300, [coords], 0, {type: "sharp"});
  
  var rectseries = $('#svod-chart svg rect');
  for (var i = 0; i < rectseries.length; i++) {
    $(rectseries[i]).attr('rel','tooltip');
    $(rectseries[i]).attr('data-placement','bottom');
    $(rectseries[i]).attr('data-title',titles[i]);
  }
  $('#svod-chart svg [rel="tooltip"]').tooltip({container: 'body'});
  $('#svod-chart svg [rel="tooltip"]').hover(function(){
    $('#svod li').hide();
    $('#svod li[data-channel-recommend-name="'+$(this).data('title')+'"]').fadeIn();
  },function(){
    
  })
  console.log('svod chart completed');
  
  
  
  /* vod */
  console.log('start drawing chart vod');
  var titles = [];
  var coords = []
  $('#vod li[data-channel-recommend-name]').each(function(){
    titles.push($(this).data('channel-recommend-name'))
    coords.push($(this).data('channel-recommend-score'))
  })
  console.log('chart data', titles, coords);

  var r = Raphael("vod-chart"),
      txtattr = { font: "12px sans-serif" };
  r.text(160, 10, "Recommandations VOD").attr(txtattr);
  r.barchart(10, 10, 470, 300, [coords], 0, {type: "sharp"});
  
  var rectseries = $('#svod-chart svg rect');
  for (var i = 0; i < rectseries.length; i++) {
    $(rectseries[i]).attr('rel','tooltip');
    $(rectseries[i]).attr('data-placement','bottom');
    $(rectseries[i]).attr('data-title',titles[i]);
  }
  $('#vod-chart svg [rel="tooltip"]').tooltip({container: 'body'});
  $('#vod-chart svg [rel="tooltip"]').hover(function(){
    $('#vod li').hide();
    $('#vod li[data-channel-recommend-name="'+$(this).data('title')+'"]').fadeIn();
  },function(){
    
  })
  console.log('vod chart completed');
});
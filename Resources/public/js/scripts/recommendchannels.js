$(document).ready(function(){
  
  console.log('start drawing chart');
  var titles = ['canalpay','jook']
  var coords = [200,400]

  var r = Raphael("svod-chart"),
      txtattr = { font: "12px sans-serif" };
  r.text(160, 10, "Recommandations SVOD").attr(txtattr);
  r.barchart(10, 10, 300, 220, [coords], 0, {type: "sharp"});
  
  var rectseries = $('#svod-chart svg rect');
  for (var i = 0; i < rectseries.length; i++) {
    $(rectseries[i]).attr('rel','tooltip');
    $(rectseries[i]).attr('data-placement','bottom');
    $(rectseries[i]).attr('data-title',titles[i]);
  }


  $('#svod-chart svg [rel="tooltip"]').tooltip({container: 'body'});
  console.log('chart completed');
});
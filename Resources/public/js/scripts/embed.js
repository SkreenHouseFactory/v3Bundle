$(document).ready(function(){
  console.log('scripts/embed.js');
  $('#trigger').on('click', function(){
    $('.player-cover').fadeOut();
  })

  if (navigator.userAgent.match(/iPhone|iPod|Android/gi)) {
    console.log(['scripts/embed.js', 'iPhone|iPod|Android', 'default click']);
    $('#trigger').trigger('click');
  }
  
})
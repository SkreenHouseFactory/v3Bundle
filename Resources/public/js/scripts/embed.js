$(document).ready(function(){
  console.log('scripts/embed.js');
  $('#trigger').on('click', function(){
    $('.player-cover').fadeOut();
  })

  if (navigator.userAgent.match(/iPhone|iPod|iPad|Android/gi)) {
    console.log(['scripts/embed.js', 'iPhone|iPod|iPad|Android', 'default click']);
    $('#trigger').trigger('click');
  }
  
})
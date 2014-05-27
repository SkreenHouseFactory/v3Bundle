$(document).ready(function(){
  Skhf.session.getSocialDatas(function(friends, friends_programs) {
    for (k in friends) {
      $('.tv-component .origine[data-friend="' + friends[k].id + '"]').html(friends[k].name + ' fait partie de vos amis.');
    }
  });
});
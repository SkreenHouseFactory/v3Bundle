

$(document).ready(function(){

  $('form').click(function(event) {
    event.preventDefault();
    $(this).data('clicked',$(event.target));
    var channel_title = $('#form-channel #channel_name').val();
    console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_title', channel_title);
    var channel_slug = $('#form-channel #channel_slug').val();
    console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_slug', channel_slug);
    var channel_description = $('#form-channel #channel_description').val();
    console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_description', channel_description);
    if ($(this).data('clicked').is('.create, .modify')) {
      console.log('scripts/user-mychannel.js', 'click on modify or create', 'POUET');
    } 
  });


      // TEST of values
      // ...
      // API call for creation or modification of myskreener channel
      /*var args = {
        title : channel_title,
        slug : channel_slug,
        description : channel_description,
        session_uid : Skhf.session.uid
      };
      API.query(
        'POST',
        'skchannel.json',
        args,
        function(datas){
          // do something with datas
          console.log('scripts/user-mychannel.js', 'click on modify or create', 'callback API skchannel datas', datas);
        }
      );*/

});
$(document).ready(function(){

  // Prevent form to be submitted
  /*$('form#form-channel').on('submit', function(e){
    e.preventDefault();
    return false;
  });*/

  $(document).on('click', '.show-form', function(e) {
    e.preventDefault();
    $('.no-show').slideToggle('slow');
  });

  // Deal with API call for creation, update, publishing and deletion of user-channel
  $('button').click(function() {
    // Hide all error messages still displaying
    $('.error').hide();

    if ($(this).hasClass('delete')) { // Check for deletion button without input necessary

      var args = {
        title : $('.message-alert .channel-name').data('value'),
        slug : $('.message-alert .channel-slug').data('value'),
        description : $('.message-alert .channel-description').data('value'),
        session_uid : Skhf.session.uid,
        cancel : true
      };
      API.query(
        'POST',
        'skchannel.json',
        args,
        function(datas){
          // do something with datas
          console.log('scripts/user-mychannel.js', 'click on modify or create', 'callback API skchannel datas', datas);
          if (datas.success.indexOf('deleted') != -1) {
            location.reload(true);
            return false;
          }
        }
      );

    } else if ($(this).hasClass('publish')) { // Check for publishing button without input necessary

      var args = {
        title : $('.message-alert .channel-name').data('value'),
        slug : $('.message-alert .channel-slug').data('value'),
        description : $('.message-alert .channel-description').data('value'),
        session_uid : Skhf.session.uid,
        is_active : true
      };
      API.query(
        'POST',
        'skchannel.json',
        args,
        function(datas){
          // do something with datas
          console.log('scripts/user-mychannel.js', 'click on modify or create', 'callback API skchannel datas', datas);
          if (datas.success.indexOf('updated') != -1) {
            location.reload(true);
            return false;
          }
        }
      );

    } else if ($(this).hasClass('depublish')) { // Check for depublishing button without input necessary

      var args = {
        title : $('.message-alert .channel-name').data('value'),
        slug : $('.message-alert .channel-slug').data('value'),
        description : $('.message-alert .channel-description').data('value'),
        session_uid : Skhf.session.uid,
        is_active : 0
      };
      API.query(
        'POST',
        'skchannel.json',
        args,
        function(datas){
          // do something with datas
          console.log('scripts/user-mychannel.js', 'click on modify or create', 'callback API skchannel datas', datas);
          if (datas.success.indexOf('updated') != -1) {
            location.reload(true);
            return false;
          }
        }
      );

    } else { // Checks for creation or modification with input necessary

      // Definition of inputs
      var channel_title = $('#form-channel #form_channel_name').val();
      // console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_title', channel_title);
      var channel_description = $('#form-channel #form_channel_description').val();
      // console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_description', channel_description);
      var channel_slug = $('#form-channel #form_channel_slug').val();
      // console.log('scripts/user-mychannel.js', 'click on modify or create', 'channel_slug', channel_slug);

      // Check for input of title
      if (channel_title.length == 0) {
        $('.name-error').show().html('Vous devez renseigner ce champ.');
        setTimeout(function(){
          $('.name-error').fadeOut();
        }, 5000);
      }

      // check for input of description
      if (channel_description.length == 0) {
        $('.description-error').show().html('Vous devez renseigner ce champ.');
        setTimeout(function(){
          $('.description-error').fadeOut();
        }, 5000);
      }

      // Check validity of title
      var test_title = /[\]\/\\$([){}*+_-]+/g;
      var result_title = test_title.test(channel_title);
      // console.log('scripts/user-mychannel.js', 'click on modify or create', 'result_title', result_title);
      if (result_title) {
        $('.name-error').show().html('Vous ne pouvez PAS utiliser les caractères spéciaux suivants : ][)(}{$*+-_/\\');
        setTimeout(function(){
          $('.name-error').fadeOut();
        }, 8000);
      }

      // Check validity of description
      var test_description = /[\]\/\\$([){}*+_-]+/g;
      var result_description = test_description.test(channel_description);
      // console.log('scripts/user-mychannel.js', 'click on modify or create', 'result_description', result_description);
      if (result_description) {
        $('.description-error').show().html('Vous ne pouvez PAS utiliser les caractères spéciaux suivants : ][)(}{$*+-_/\\');
        setTimeout(function(){
          $('.description-error').fadeOut();
        }, 8000);
      }

      // Check validity of slug
      var test_slug = /^[a-z0-9]{3,}$/;
      var result_slug = test_slug.test(channel_slug);
      if (!result_slug) {
        $('.slug-error').show().html('Vous ne pouvez utiliser QUE des lettres minuscules ou des chiffres, sans espace, d\'au moins 3 caractères');
        setTimeout(function(){
          $('.slug-error').fadeOut();
        }, 8000);
      }

      if (!result_title && !result_description && result_slug) {
        // console.log('scripts/user-mychannel.js', 'Verification caractères', 'OK');
        if (channel_title.length > 20 || channel_description.length > 40 || channel_slug.length > 12) {
          if (channel_title.length > 20) {
            $('.name-error').show().html('Vous êtes limité à 20 caractères maximum.');
            setTimeout(function(){
              $('.name-error').fadeOut();
            }, 5000);
          }
          if (channel_description.length > 40) {
            $('.description-error').show().html('Vous êtes limité à 40 caractères maximum.');
            setTimeout(function(){
              $('.description-error').fadeOut();
            }, 5000);
          }
          if (channel_slug.length > 12) {
            $('.slug-error').show().html('Vous êtes limité à 12 caractères maximum.');
            setTimeout(function(){
              $('.slug-error').fadeOut();
            }, 5000);
          }
        } else {
          if ($(this).is('.create, .modify')) {
            /*var args = {
              title : channel_title,
              slug : channel_slug,
              description : channel_description,
              session_uid : Skhf.session.uid
            };
            // console.log('scripts/user-mychannel.js', 'click on modify or create', 'Args API Call', args);
            // API Call
            API.query(
              'POST',
              'skchannel.json',
              args,
              function(datas){
                // do something with datas
                console.log('scripts/user-mychannel.js', 'click on modify or create', 'callback API skchannel datas', datas);
                if (typeof datas.error != 'undefined' && datas.error.indexOf('slug already exists') != -1 ) {
                  $('.slug-error').show().html('Cette URL est déjà utilisée. Veuillez en choisir une autre');
                    setTimeout(function(){
                      $('.slug-error').fadeOut();
                    }, 8000);
                } else if (datas.success != 0) {
                  location.reload(true);
                }
              }
            );*/
            $('form#form-channel').submit();
          }
        }
      }

    }

  });

});
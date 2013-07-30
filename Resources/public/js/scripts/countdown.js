$(function(){
	// On récupère l'élément 'note' dans lequel on va inscrire des informations

	var note = $('#note');
	// Création de l'objet 'date' (année / mois / jour) ici initialisé au : 9 mars 2012
	// Attention les mois commencent à 0 !

	var ts = new Date(2012, 2, 9);
	var newYear = true;

	

	if((new Date()) > ts){
		// The new year is here! Count towards something else.

		// Notice the *1000 at the end - time must be in milliseconds

		ts = (new Date()).getTime() + 10*24*60*60*1000;

		newYear = false;

	}

		

	$('#countdown').countdown({

		timestamp	: ts,

		callback	: function(days, hours, minutes, seconds){

			var message = "";


			message += days + " jour" + ( days == 1 ? '':'s' ) + ", ";

			message += hours + " heure" + ( hours==1 ? '':'s' ) + ", ";

			message += minutes + " minute" + ( minutes==1 ? '':'s' ) + " et ";

			message += seconds + " seconde" + ( seconds==1 ? '':'s' );

			

			if (newYear) {

				message += " avant l'événement !";

			}

			else {

				message += "Il ne reste plus 10 jours à partir de maintenant !";

			}

			

			note.html(message);

		}

	});

	

});


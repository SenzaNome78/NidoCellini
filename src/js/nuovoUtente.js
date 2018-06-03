"use strict";

var pageName = location.pathname.split("/").slice(-1)[0]

var testoModalAttesa = '<h5>Per favore, avvicini il nuovo badge al lettore entro un minuto. Grazie.</h5>';
var testoModalSuccessoBadge = '<h5>Registrazione del badge eseguita con successo.</h5>';

var testoModalErroreBadge = '<h5>Si è verificato un errore nella registrazione del badge.<br>' +
'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

var testoModalErroreConn = '<h5>Si è verificato un errore di connessione col lettore di badge.<br>' +
	'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';


//Controlliamo che il nome del nuovo utente sia stato inserito nell'input box
function ValidForm() {
	var valido = document.getElementById("formNuovoUser").elements.namedItem("nomeBambino").value;
	if (valido == "") {
		return false;
	}
	else {
		return true;
	}
}

// E' stato cliccato il pulsante per registrare un nuovo badge
$('#btnRegBadge').on('click', function () {

	if (ValidForm()) {
		// Passiamo l'url allo script php per la richiesta al lettore rfid
		var url = ".\\php\\proxyToEsp.php?command=newBadge" +
			"&nome=" + $("#nomeBambino").val() +
			"&ruolo=" + $("#Ruolo").val() +
			"&sesso=" + $("#Sesso").val();
		console.log(url);

		// La finestra modal puo' essere chiusa solo con i pulsanti
		$('#modalAttesaBadge').modal({ backdrop: 'static' });

		// Proviam ad inviare una richiesta al lettore rfid per registrare un nuovo badge
		$.get(url,
			null,
			// Funzione eseguita se la richiesta GET ha avuto successo
			function (data, status) {
				var badgeRegStatus = data.substr(data.lastIndexOf("successo=")+9, 1);
				
				if (badgeRegStatus == "S") // Registrazione badge avvenuta con successo
				{
					$('#newBadgeModalBody').addClass('stileModalSuccesso');
					$('#newBadgeModalBody').html(testoModalSuccessoBadge);
					$('#newBadgeModalBody').removeClass('stileModalErrore');
				}	
				else if (badgeRegStatus == "N")// Registrazione badge non avvenuta
				{ }
				else // Registrazione badge: qualcosa non va
				{
					console.log("Data: " + data);
					console.log("badgeRegStatus: " + badgeRegStatus);
				}	
			}).fail(function (jqXHR, textStatus, error) { // <- Funzione che eseguimo se non siamo riusciti a contattare il lettore rfid
				$('#newBadgeModalBody').addClass('stileModalErrore');
				$('#newBadgeModalBody').html(testoModalErroreConn
			);
				console.log("text stat: " + textStatus);
				console.log("jqXHR: " + jqXHR.getAllResponseHeaders());
				console.log("error: " + error);

			})
	}

	else { // Se l'input box è vuoto visualiziamo un tooltip
		$('#nomeBambino').tooltip('show');
	}


});

// Mettiamo il testo normale nel modal, levando la classe dell'errore
$('#modalAttesaBadge').on('show.bs.modal', function (e) {
	$('#newBadgeModalBody').html(testoModalAttesa);
	$('#newBadgeModalBody').removeClass('stileModalErrore');
	$('#newBadgeModalBody').removeClass('stileModalSuccesso');
})
// Mettiamo il testo normale nel modal, levando la classe dell'errore
$('#modalAttesaBadge').on('hidden.bs.modal', function (e) {
	$('#newBadgeModalBody').html(testoModalAttesa);
	$('#newBadgeModalBody').removeClass('stileModalErrore');
	$('#newBadgeModalBody').removeClass('stileModalSuccesso');
})


// Facciamo in modo che il tooltip dell'input box nome duri per 3 secondi
$('.form-control').on('shown.bs.tooltip', function () {
	setTimeout(function () {
		$('#nomeBambino').tooltip('hide');
	}, 3000);
})


$(document).ready(function () {
	// Inizializiamo il tooltip dell'input box Nome
	$('[data-toggle="tooltip"]').tooltip();
	$('#nomeBambino').tooltip({
		trigger: 'manual',
		container: 'body',
		placement: 'auto',
		title: "<h6>Per favore compila<br>questo campo.</h6>",
		html: true
	});

});


// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);


"use strict";

const PHPURL = ".\\php\\dbComm.php";

const testoModalAttesa = '<h5>Per favore, avvicini il nuovo badge al lettore entro un minuto. Grazie.</h5>';
const testoModalSuccessoBadge = '<h5>Registrazione del badge eseguita con successo.</h5>';

const testoModalErroreBadge = '<h5>Si è verificato un errore nella registrazione del badge.<br>' +
	'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

const testoModalErroreConn = '<h5>Si è verificato un errore di connessione col lettore di badge.<br>' +
	'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

var pageName = location.pathname.split("/").slice(-1)[0] // Otteniamo il nome della pagina html
var ruolo; // Contiene il ruolo, es. B per bambino, E per educatore, etc:
var table; // Nome della tabella mysql da usare
var formName; // nome del form html
var inputName; // nome del campo input che contiene il nome dello user

// Il documento è pronto, inizializiamo le variabili
$(document).ready(function () {

	if (pageName == "NuovoBambino.html") {
		ruolo = "B";
		table = "tbbambini";
		formName = "formNuovoBambino"
		inputName = "nomeBambino";
	}
	else if (pageName == "NuovoEducatore.html") {
		ruolo = "E";
		table = "tbeducatori";
		formName = "formNuovoEducatore"
		inputName = "nomeEducatore";
	}
	else if (pageName == "NuovoParente.html") {
		ruolo = "E";
		table = "tbparenti";
		formName = "formNuovoParente"
		inputName = "nomeParente";
	}
	else // Stampiamo un errore nella console
	{
		console.log("Errore nel nome di pagina");
	}	

});


//Controlliamo che il nome del nuovo utente sia stato inserito nell'input box
function ValidForm() {
	var valido = document.getElementById(formName).elements.namedItem(inputName).value;
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
			"&nome=" + $("#" + inputName).val() +
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
				var badgeRegStatus = data.substr(data.lastIndexOf("successo=") + 9, 1);

				if (badgeRegStatus == "S") // Registrazione badge avvenuta con successo
				{
					$('#newBadgeModalBody').addClass('stileModalSuccesso');
					$('#newBadgeModalBody').html(testoModalSuccessoBadge);
					$('#newBadgeModalBody').removeClass('stileModalErrore');
				}
				else if (badgeRegStatus == "N")// Registrazione badge non avvenuta
				{
					$('#newBadgeModalBody').addClass('stileModalErrore');
					$('#newBadgeModalBody').html(testoModalErroreBadge);
					$('#newBadgeModalBody').removeClass('stileModalSuccesso');
				}
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



});


$('#btnSaveBadge').on('click', function () {
	event.preventDefault();
	var pageControls = document.getElementById(formName).elements;

	var i;
	var dataObj = {};

	dataObj["paramInsertUser"] = ruolo;
	dataObj["paramTableForInsert"] = table;
	for (i = 0; i < pageControls.length; i++) {
		if (pageControls[i].type == "text" || pageControls[i].type == "date" || pageControls[i].type == "select-one" || pageControls[i].type == "textarea") {
			dataObj[pageControls[i].name] = pageControls[i].value;
			console.log(pageControls[i].name);
		}
	}

	$.post(PHPURL, dataObj, function (data) {

		console.log("test");
		console.log(data);
	});


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

// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);


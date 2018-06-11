"use strict";

const PHPURL = ".\\php\\dbComm.php";
const titoloModalBadge = 'Registrazione nuovo badge';
const testoModalAttesa = '<h5>Per favore, avvicini il nuovo badge al lettore entro un minuto. Grazie.</h5>';
const testoModalSuccessoBadge = '<h5>Registrazione del badge eseguita con successo.</h5>';

const testoModalErroreBadge = '<h5>Si è verificato un errore nella registrazione del badge.<br>' +
	'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

const testoModalErroreConn = '<h5>Si è verificato un errore di connessione col lettore di badge.<br>' +
	'Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

const testoModalUserSaved = '<h5>Nuovo utente salvato.<br>' + '<p style="text-align:center">Adesso è possibile registrare un nuovo badge<br>usando il pulsante nella parte bassa della pagina</h5 ></p>';
const titoloModalUserSaved = 'Registrazione nuovo utente';


var pageName = location.pathname.split("/").slice(-1)[0] // Otteniamo il nome della pagina html
var ruolo; // Contiene il ruolo, es. B per bambino, E per educatore, etc:
var table; // Nome della tabella mysql da usare
var formName; // nome del form html
var inputName; // nome del campo input che contiene il nome dello user
var codfis; // nome del campo contenente il codice fiscale

// Il documento è pronto, inizializiamo le variabili
$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip({
		container: 'body'
	});
	

	formName = "formNuovoUser"
	
	if (pageName == "NuovoBambino.html") {
		ruolo = "B";
		table = "tbbambini";
		inputName = "nomeBambino";
		codfis = "codiceFiscaleBambino";
	}
	else if (pageName == "NuovoEducatore.html") {
		ruolo = "E";
		table = "tbeducatori";		
		inputName = "nomeEducatore";
		codfis = "codiceFiscaleEducatore";
	}
	else if (pageName == "NuovoParente.html") {
		ruolo = "P";
		table = "tbparenti";
		inputName = "nomeParente";
		codfis = "codiceFiscaleParente";
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

// Vogliamo interrompere la registrazione del nuovo badge
$('#btnStopBadgeRegModal').on('click', function () {
	var url = ".\\php\\proxyToInterr.php?command=stop";
	
	$.get(url);
});

// E' stato cliccato il pulsante per registrare un nuovo badge
$('#btnRegBadge').on('click', function () {
	event.preventDefault();
	if (ValidForm()) {
		// Passiamo l'url allo script php per la richiesta al lettore rfid
		var url = ".\\php\\proxyToEsp.php?command=newBadge" +
			"&nome=" + $("#" + inputName).val() +
			"&ruolo=" + ruolo +
			"&sesso=" + $("#sessoUser").val();
		// console.log(url);

		// La finestra modal puo' essere chiusa solo con i pulsanti
		$('#modalDialogModalBody').addClass('stileModalSuccesso');
		$('#modalDialogModalBody').removeClass('stileModalErrore');
		$('#modalDialogLabel').html(titoloModalBadge);
		$('#modalDialogModalBody').html(testoModalAttesa);
		$('#modalDialog').modal({ backdrop: 'static' });

		document.getElementById('btnCloseModal').style.display = "none";
		document.getElementById('btnStopBadgeRegModal').style.display = "inline";
		// Proviamo ad inviare una richiesta al lettore rfid per registrare un nuovo badge
		$.ajax(url,
			// Funzione eseguita se la richiesta GET ha avuto successo
			{
				success: function (data, status, jqXHR) {
					// var badgeRegStatus = data.substr(data.lastIndexOf("successo=") + 9, 1);


					console.log("ajax successo");
					if (data.search("ConnOk") != -1) // Connessione al lettore rfid riuscita
					{
						if (data.search("&successo=S") != -1) {
							$('#modalDialogModalBody').addClass('stileModalSuccesso');
							$('#modalDialogModalBody').html(testoModalSuccessoBadge);
							$('#modalDialogModalBody').removeClass('stileModalErrore');
						}
						else if (data.search("&successo=N") != -1) {
							$('#modalDialogModalBody').addClass('stileModalErrore');
							$('#modalDialogModalBody').html(testoModalErroreBadge);
							$('#modalDialogModalBody').removeClass('stileModalSuccesso');
						}

					}
					else if (data.search("ConnErr") != -1) // Connessione al lettore rfid fallita
					{
						$('#modalDialogModalBody').addClass('stileModalErrore');
						$('#modalDialogModalBody').html(testoModalErroreConn);
						$('#modalDialogModalBody').removeClass('stileModalSuccesso');
					}
					else // Registrazione badge: qualcosa non va
					{
						$('#modalDialogModalBody').addClass('stileModalErrore');
						$('#modalDialogModalBody').html("Errore Generico");
						$('#modalDialogModalBody').removeClass('stileModalSuccesso');
						console.log("Data: " + data);
						console.log("badgeRegStatus: " + data);
					}
				},
				error: function (jqXHR, textStatus, error) { // <- Funzione che eseguimo se non siamo riusciti a contattare il lettore rfid
					$('#modalDialogModalBody').addClass('stileModalErrore');
					$('#modalDialogModalBody').html(testoModalErroreConn
					);
					console.log("ERRORE");
					console.log("text stat: " + textStatus);
					console.log("jqXHR: " + jqXHR.getAllResponseHeaders());
					console.log("error: " + error);
				}
			});

	}
	$('#modalDialogModalBody').removeClass('stileModalErrore');
	$('#modalDialogModalBody').removeClass('stileModalSuccesso');
});

// Salviamo un nuovo user nel database e attiviamo il pulsante per registrare
// un nuovo badge
$('#btnSaveUser').on('click', function () {

	// Controlliamo se i campi obbligatori sono stati inseriti, altrimenti usciamo
	if (!document.getElementById(formName).checkValidity()) {
		return;
	}
	// preventDefault per non inviare il modulo e non fare il refresh della pagina
	event.preventDefault();

	// In pageControls mettiamo tutti i controlli della pagina
	var pageControls = document.getElementById(formName).elements;

	var i; // contatore
	var dataObj = {}; // Oggetto contenente tutti i controlli che ci servono e i loro valori

	dataObj["paramInsertUser"] = ruolo; 	// il ruolo, e attiva la funzione InsertNewUser in dbComm.php
	dataObj["paramTableForInsert"] = table; // la tabella mysql

	// Scorriamo tutti i controlli della pagina e se sono controlli che ci servono
	// li aggiungiamo a dataObj con i loro valori
	for (i = 0; i < pageControls.length; i++) {
		if (pageControls[i].type == "text"
			|| pageControls[i].type == "date"
			|| pageControls[i].type == "select-one"
			|| pageControls[i].type == "textarea"
			|| pageControls[i].type == "tel"
			|| pageControls[i].type == "email") {
			dataObj[pageControls[i].name] = pageControls[i].value;
		}
	}

	// inviamo l'oggetto dataObj al file php
	$.post(PHPURL, dataObj, function (data) {
	});

	// Attiviamo il pulsante per registrare un nuovo badge
	document.getElementById("btnRegBadge").disabled = false;
	$('#tipBtnRegBadge').removeClass("Dtooltip");
	document.getElementById("tipBtnRegBadgeSpan").innerHTML = "";


	// Formattiamo e visualizziamo una finestra modal per indicare il successo 
	// del salvataggio
	$('#modalDialogModalBody').addClass('stileModalSuccesso');
	$('#modalDialogModalBody').removeClass('stileModalErrore');
	$('#modalDialogLabel').html(titoloModalUserSaved);
	$('#modalDialogModalBody').html(testoModalUserSaved);
	$('#modalDialog').modal({ backdrop: 'static' });

});


// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);


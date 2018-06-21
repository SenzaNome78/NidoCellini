"use strict";

const PHPURL = ".\\php\\dbComm.php"; // URL del file php con cui ci connettiamo al database

// COSTANTI STRINGHE
const titoloModalBadge = 'Registrazione nuovo badge';
const testoModalAttesa = '<h5>Per favore, avvicini il nuovo badge al lettore entro un minuto. Grazie.</h5>';
const testoModalSuccessoBadge = '<h5>Registrazione del badge eseguita con successo.</h5>';

const testoModalErroreBadge = '<h5>Si è verificato un errore nella registrazione del badge.<br>Riprovi la procedura o contattati l\'amministratore di sistema </h5 > ';

const testoModalErroreConn = "<h5>Si è verificato un errore di connessione con il lettore di badge.<br> " +
	"Si prega di ripetere la procedura.<br> Se necessario contattare l'amministratore di sistema.</h5 > ";

const testoModalErroreTimeout = '<h5>Tempo per registrare il badge esaurito. <br> Si prega di riprovare.</h5 > ';

const testoModalErroreStop = "<h5>Registrazione badge interrotta dall'utente.<br>Premere OK per chiudere la finestra</h5 >";

const testoModalUserInserted = '<h5>Nuovo utente inserito.<br>' + '<p style="text-align:center">Adesso è possibile registrare un nuovo badge<br>usando il pulsante nella parte bassa della pagina</p></h5>';
const testoModalUserUpdated = '<h5>Utente modificato.<br>' + '<p style="text-align:center">La tabella è stata aggiornata.</p></h5>';

const titoloModalUserInserted = 'Registrazione nuovo utente';
const titoloModalUserUpdated = 'Modifica utente';
// FINE COSTANTI STRINGHE


// Elenco di tabelle contenute nel database mysql
const MYSQL_TABLE_BAMBINI = "tbbambini";
const MYSQL_TABLE_EDUCATORI = "tbeducatori";
const MYSQL_TABLE_PRESENZE_EDUCATORI = "tbpresenzeeducatori";
const MYSQL_TABLE_PRESENZE_BAMBINI = "tbpresenzebambini";
const MYSQL_VIEW_BAMBINI = "vwbambini";
const MYSQL_VIEW_EDUCATORI = "vweducatori";
// FINE ELENCO TABELLE MYSQL

// la variabile pageName contiene il nome della pagina html (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]

var viewMySql; // Variabile stringa che contiene la VIEW mysql per la pagina attuale
var tableMySql; // Variabile stringa che contiene la TABELLA mysql per la pagina attuale
var idDb; // Contiene l'id del database (es. idtbbambini, idtbeducatori, etc)

//variabile che contiene il riferimento alla DataTable creata
var tbTabella;


var ruolo; // Contiene il ruolo, es. B per bambino, E per educatore, etc:
var formName; // nome del form html
var inputName; // nome del campo input che contiene il nome dello user
var inputSesso; // nome del campo input che contiene il sesso dello user
var tipoDiPagine; // Ci indica se la pagina è un elenco o un nuovo inserimento.


// Il documento è pronto
// Usando il nome della pagina come riferimento, inizializiamo le variabili
// ed eventualmente eseguimo le funzioni che ci servono
$(document).ready(function () {
	// Attiviamo i tooltip
	$('[data-toggle="tooltip"]').tooltip({
		container: 'body'
	});

	if (pageName == "NuovoBambino.html") {
		ruolo = "B";
		tableMySql = MYSQL_TABLE_BAMBINI;;
		inputName = "nomeBambino";
		inputSesso = "sessoBambino";
		formName = "formNuovoUser";
		tipoDiPagine = "nuovoIns";
	}
	else if (pageName == "NuovoEducatore.html") {
		ruolo = "E";
		tableMySql = "tbeducatori";
		inputName = "nomeEducatore";
		inputSesso = "sessoEducatore";
		formName = "formNuovoUser";
		tipoDiPagine = "nuovoIns";
	}
	else if (pageName == "NuovoParente.html") {
		ruolo = "P";
		tableMySql = "tbparenti";
		inputName = "nomeParente";
		inputSesso = "sessoParente";
		formName = "formNuovoUser";
		tipoDiPagine = "nuovoIns";
	}
	else if (pageName === "ElencoBambini.html") {
		ruolo = "B";
		tableMySql = MYSQL_TABLE_BAMBINI;
		viewMySql = MYSQL_VIEW_BAMBINI;
		inputName = "nomeBambino";
		inputSesso = "sessoBambino";
		formName = "formModificaUser";
		tipoDiPagine = "elenco";
		idDb = "idtbbambini";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeBambino" },
			{ data: "cognomeBambino" },
			{ data: "dataNascitaBambinoFormat" },
			{ data: "educRif" }
		]);

	} else if (pageName === "ElencoEducatori.html") {
		ruolo = "E";
		tableMySql = MYSQL_TABLE_EDUCATORI;
		viewMySql = MYSQL_VIEW_EDUCATORI;
		inputName = "nomeEducatore";
		inputSesso = "sessoEducatore";

		formName = "formModificaUser";
		tipoDiPagine = "elenco";
		idDb = "idtbeducatori";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeEducatore" },
			{ data: "cognomeEducatore" },
			{ data: "codiceFiscaleEducatore" },
			{ data: "tel01Educatore" },
			{ data: "tel02Educatore" },
			{ data: "emailEducatore" }
		]);

	}
	else if (pageName === "Home.html")
	{
		console.log("Siamo nella home, non facciamo niente.")
		}
	else // Stampiamo un errore nella console
	{
		console.log("Errore nel nome di pagina");
	}

	// Se siamo in una pagina di nuovi inserimenti
	// attiviamo gli handler di eventi per i tasti SaveUser e Pulisci
	if (tipoDiPagine === "nuovoIns") {
		// Salviamo un nuovo user nel database e attiviamo il pulsante per registrare
		// un nuovo badge
		$('#btnSaveNewUser').on('click', function () {
			InsertUpdateUser(true, "0")
		});

		// Puliamo tutti i campi (Ricarica pagina)
		$('#btnPulisci').on('click', function () {
			// event.preventDefault();
			if (window.confirm("Premendo OK verrano puliti tutti i campi. Confermare?"))
				location.reload(true);

		});
	}
	// Se siamo in una pagina elenco registriamo gli handler degli eventi
	else if (tipoDiPagine === "elenco") {
		$('#btnNuovo').on('click', function () {
			MostraDettagli(true);
		});
	}

	// Una o più righe della tabella sono state selezionate
	if (tbTabella !== undefined) {
		tbTabella.on('select', function (e, dt, type, indexes) {
			// Se è stata selezionata una sola riga attiva il pulsante per modificare la voce
			if (type === 'row') {
				var righe = tbTabella.rows({ selected: true });

				if (righe[0].length > 0) {
					// Se sono rimaste seleziona una o più righe, attiva il pulsante per cancellare le voci
					tbTabella.button('btnCancella:name').enable();
					// Se è rimasta selezionata una sola riga attiva il pulsante per modificare la voce
					if (righe[0].length === 1)
						tbTabella.button('btnModifica:name').enable();
					else
						tbTabella.button('btnModifica:name').enable(false);
				}

				else { // Nessuna voce selezionata, disattiva i tasti di modifica e cancellazione
					tbTabella.button('btnModifica:name').enable(false);
					tbTabella.button('btnCancella:name').enable(false);
				}
			}
		});

		// Una o più righe della tabella sono state deselezionate
		tbTabella.on('deselect', function (e, dt, type, indexes) {

			if (type === 'row') {
				var righe = tbTabella.rows({ selected: true });

				if (righe[0].length > 0) {
					// Se sono rimaste seleziona una o più righe, attiva il pulsante per cancellare le voci
					tbTabella.button('btnCancella:name').enable();
					// Se è rimasta selezionata una sola riga attiva il pulsante per modificare la voce
					if (righe[0].length === 1)
						tbTabella.button('btnModifica:name').enable();
					else
						tbTabella.button('btnModifica:name').enable(false);
				}

				else { // Nessuna voce selezionata, disattiva i tasti di modifica e cancellazione
					tbTabella.button('btnModifica:name').enable(false);
					tbTabella.button('btnCancella:name').enable(false);
				}
			}
		});
	}


});


/**
 * Popola la tabella con i dati da un database mySql
 * @param {string} dbTabella Nome della tabella in mySql
 * @param {int} idKey il nome del campo mySql contentente la chiave primaria
 * @param {Array} colonne un'array i nomi delle intestazioni delle colonne
 */
function CompilaTabella(dbTabella, idKey, colonne) {

	tbTabella = $("#TabellaCorrente").DataTable(
		{
			// chiamata ajax per compilare la tabella
			ajax: {
				url: PHPURL, // url della nostra pagina php
				method: "POST", // usiamo il comando POST
				data: {
					table: dbTabella // nome della tabella mysql che andiamo a interrogare
				},
				dataSrc: '',
				error: function (jqXHR, textStatus, e) { // in caso di errore, non visibile all'utente
					if (textStatus == "parsererror") {
						console.log(textStatus);
						console.log("Controllare se il database mysql è avviato.");
					}
				}
			},

			columns: colonne,

			responsive: true,

			rowId: idKey,
			select: true,

			dom: 'ftlip', // ordine degli elementi visualizzati della tabella
			scrollY: '60vh', // 60vh
			scrollCollapse: true,
			paging: false,
			// deferRender: true,

			// in questa sezione ho tradotto le varie voci della tabella in italiano
			language: {
				select: {
					rows: {
						_: "%d righe selezionate.",
						0: "%d righe selezionate.",
						1: "Una riga selezionata."
					}

				},
				info: "Visualizza _START_ di _END_ (_TOTAL_ totali). ",
				infoFiltered: " Totale senza filtri: <b>_MAX_ voci</b>",
				infoEmpty: "Tabella vuota. Prova a rimuovere i filtri.",
				search: "Applica filtro: ",
				zeroRecords: "Tabella vuota.<br>Prova a rimuovere i filtri o contatta l'amministratore di sistema",
				lengthMenu: "Visualizza _MENU_ voci per pagina",
				paginate: {
					first: "Prima pagina",
					last: "Ultima pagina",
					next: "Prossima",
					previous: "Precedente"
				},
				scroller: true
			},
		});

	new $.fn.DataTable.Buttons(tbTabella, {
		buttons: [
			//'copy', 'excel', 'pdf',
			{
				name: "btnCancella",
				text: 'Cancella voci',
				enabled: false,
				action: function () {
					CancellaVoci(idKey);
				}
			},
			{
				name: "btnRicarica",
				text: "Ricarica voci",
				action: function () {
					tbTabella.ajax.reload();
				}
			},
			{
				name: "btnModifica",
				text: "Modifica voce",
				enabled: false,
				action: function () {
					MostraDettagli(false);
				}
			}
		]
	});
	tbTabella.buttons().container().appendTo($('#TabellaCorrente_wrapper'));

	tbTabella.column(0).visible(false);

}

function CancellaVoci(idKey) {

	var obj = tbTabella.rows({ selected: true }).ids(true);
	var tmpPostData = "&deleteId=";

	for (var i = 0; i < obj.length; i++) {
		if (i > 0) {
			tmpPostData += ",";
		}
		tmpPostData += tbTabella.rows({ selected: true }).ids()[i];
	}

	$.ajax({
		url: PHPURL,
		method: "POST",
		data: "table=" + tableMySql + tmpPostData + "&idKey=" + idKey,
		success: function (dataRet, stat, xmlh) {
			tbTabella.ajax.reload();
		}
	});
}

var datiTabella;
var idDaPassare;

// Apre il modal per modificare l'utente
function MostraDettagli(insert) {
	// Registra un evento all'apertura del modal per riportare la scrollbar in alto
	$('#modalDialogUpdateUser').off('show.bs.modal');

	$('#modalDialogUpdateUser').on('show.bs.modal', function (event) {
		$('#btnModUser').off('click');
		$('#btnRegBadge').off('click');
		$('#btnAnnullaModal').off('click');


		// Definiamo le stringhe del modal a seconda se siamo 
		// in inserimento o modifica
		if (insert === true) // INSERIMENTO
		{
			document.getElementById(formName).reset();
			document.getElementById("btnRegBadge").disabled = true;
			$("#modalDialogUpdateUserLabel").html("Inserisca i dati e prema Salva");
			$("#tipbtnModUserSpan").html("Inserisce il nuovo utente e chiude la finestra");
			$("#tipBtnRegBadgeSpan").html("Per registrare un nuovo badge si prega di aggiungere un nuovo utente usando il pulsante \"Salva\"");
		}
		else // MODIFICA
		{
			document.getElementById("btnRegBadge").disabled = false;
			$("#modalDialogUpdateUserLabel").html("Modificare i dati e premere Salva");
			$("#tipbtnModUserSpan").html("Salva le modifiche apportate e chiude la finestra");
			$("#tipBtnRegBadgeSpan").html("Registra un nuovo badge per questo utente");
		}

		// Se modifichiamo un utente, prima compiliamo i campi del modal
		if (insert === false) {
			// LEGGIAMO I DATI DALLA TABELLA E COMPILIAMO IL FORM
			// Queste due variabili contengono:
			// controlli: tutti i controlli del nostro form html
			// datiTabella: i campi e i valori del record selezionato nella tabella
			var controlli = document.getElementById(formName).elements;
			datiTabella = tbTabella.rows({ selected: true }).data()[0];


			idDaPassare = datiTabella[idDb];

			// Per ogni campo della tabella (anche quelli nascosti)
			for (var campo in datiTabella) {
				// Controlliamo che il rispettivo controllo esista nel form
				if (typeof controlli[campo] !== 'undefined') {
					// Se sia il campo della tabella che quello del controllo non sono null
					// modificiamo quest'ultimo
					if ((datiTabella[campo] !== null) && (controlli[campo].value != null))
						controlli[campo].value = datiTabella[campo];
				}
			}
		}
		// FINE LETTURA DATI

		if (insert === true) { // Andiamo ad inserire un nuovo utente
			$('#btnModUser').on('click', function (event) {
				if (InsertUpdateUser(true, 0)) {
					//$('#modalDialogUpdateUser').modal('hide');
				}
			});
		}
		else { // Modifichiamo un utente
			$('#btnModUser').on('click', function (event) {
				if (InsertUpdateUser(false, idDaPassare)) {
					//$('#modalDialogUpdateUser').modal('hide');
				}
			});
		}


		$('#btnRegBadge').on('click', function (event) {
			RegBadge(idDaPassare);
		});

		$('#btnAnnullaModal').on('click', function (event) {
			//$('#modalDialogUpdateUser').modal('hide');
		});

	});

	$('#modalDialogUpdateUser').modal('show');
	$('#modalDialogUpdateUserBody').scrollTop(0);
}

// Funzione per inserire o modificare un utente attraverso PHP->mySql
function InsertUpdateUser(insert, idDaPassare) {

	// Controlliamo se i campi obbligatori sono stati inseriti, altrimenti usciamo
	if (!document.getElementById(formName).checkValidity()) {
		document.getElementById(formName).reportValidity();
		return false;
	}

	// In pageControls mettiamo tutti i controlli della pagina
	var pageControls = document.getElementById(formName).elements;

	var i; // contatore
	var dataObj = {}; // Oggetto contenente tutti i controlli che ci servono e i loro valori

	if (insert === true) {
		dataObj["paramInsertOrUpdate"] = "insert"; // Indica alla funzione php di eseguire un update
	}
	else {
		dataObj["paramInsertOrUpdate"] = "update"; // Indica alla funzione php di eseguire un insert
		dataObj["paramId"] = idDaPassare; // Id del record mysql da modificare
	}

	dataObj["paramRuolo"] = ruolo; 	// il ruolo
	dataObj["paramTable"] = tableMySql; // la tabella mysql

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

	var dialogTitolo;
	var dialogTesto;
	// Formattazione post inserimento o modifica
	if (insert === true) {
		// Attiviamo il pulsante per registrare un nuovo badge
		document.getElementById("btnRegBadge").disabled = false;
		$("#tipBtnRegBadgeSpan").html("Registra un nuovo badge per questo utente");
		// document.getElementById("tipBtnRegBadgeSpan").innerHTML = "";

		// Stringhe usate nel dialog informativo
		dialogTitolo = titoloModalUserInserted;
		dialogTesto = testoModalUserInserted;
	}
	else {
		dialogTitolo = titoloModalUserUpdated;
		dialogTesto = testoModalUserUpdated;
	}
	// Formattiamo e visualizziamo una finestra modal per indicare il successo 
	// del salvataggio
	tbTabella.ajax.reload();
	$('#modalRegStatusBody').addClass('stileModalSuccesso');
	$('#modalRegStatusBody').removeClass('stileModalErrore');
	$('#modalRegStatusLabel').html(dialogTitolo);
	$('#modalRegStatusBody').html(dialogTesto);
	$('#modalRegStatus').modal('show');

	return true;
}

// Vogliamo interrompere la registrazione del nuovo badge
$('#btnStopBadgeRegModal').off('click');
$('#btnStopBadgeRegModal').on('click', function () {
	var url = ".\\php\\proxyToInterr.php?command=interr";
	$.get(url);
});


function RegBadge(idUtente) {
	if (!document.getElementById(formName).checkValidity()) {
		document.getElementById(formName).reportValidity();
		return false;
	}

	// Passiamo l'url allo script php per la richiesta al lettore rfid
	var url = ".\\php\\NewBadge.php?command=newBadge" +
		"&nome=" + $("#" + inputName).val() +
		"&ruolo=" + ruolo +
		"&sesso=" + $("#" + inputSesso).val() +
		"&idKey=" + idDb +
		"&id=" + idDaPassare +
		"&paramTable=" + tableMySql;

	// Visualizziamo un messaggio per invitare ad avvicinare un badge al lettore
	$('#modalRegStatusBody').addClass('stileModalSuccesso');
	$('#modalRegStatusBody').removeClass('stileModalErrore');
	$('#modalRegStatusLabel').html(titoloModalBadge);
	$('#modalRegStatusBody').html(testoModalAttesa);
	$('#modalRegStatus').modal({ backdrop: 'static' });

	// La finestra modal puo' essere chiusa solo con i pulsanti

	document.getElementById('btnCloseModal').style.display = "none";
	document.getElementById('btnStopBadgeRegModal').style.display = "inline";

	// Proviamo ad inviare una richiesta al lettore rfid per registrare un nuovo badge
	$.ajax(url,
		// Funzione eseguita se la richiesta GET ha avuto successo
		{
			success: function (data, status, jqXHR) {
				if (data.search("ConnOk") != -1) // Connessione al lettore rfid riuscita
				{
					if (data.search("S=Registrato") != -1) {
						$('#modalRegStatusBody').addClass('stileModalSuccesso');
						$('#modalRegStatusBody').html(testoModalSuccessoBadge);
						$('#modalRegStatusBody').removeClass('stileModalErrore');
						console.log("Data: " + data);
						console.log("badgeRegStatus: " + data);

					}
					else if (data.search("F=ScriviNuovoBadge") != -1) {
						$('#modalRegStatusBody').addClass('stileModalErrore');
						$('#modalRegStatusBody').html(testoModalErroreBadge);
						$('#modalRegStatusBody').removeClass('stileModalSuccesso');
						console.log("Data: " + data);
						console.log("badgeRegStatus: " + data);
					}
					else if (data.search("F=Stop") != -1) {
						$('#modalRegStatusBody').addClass('stileModalErrore');
						$('#modalRegStatusBody').html(testoModalErroreStop);
						$('#modalRegStatusBody').removeClass('stileModalSuccesso');
						console.log("Data: " + data);
						console.log("badgeRegStatus: " + data);
					}
					else if (data.search("F=Timeout") != -1) {
						$('#modalRegStatusBody').addClass('stileModalErrore');
						$('#modalRegStatusBody').html(testoModalErroreTimeout);
						$('#modalRegStatusBody').removeClass('stileModalSuccesso');
						console.log("Data: " + data);
						console.log("badgeRegStatus: " + data);
					}

				}
				else if (data.search("ConnErr") != -1) // Connessione al lettore rfid fallita
				{
					$('#modalRegStatusBody').addClass('stileModalErrore');
					$('#modalRegStatusBody').html(testoModalErroreConn);
					$('#modalRegStatusBody').removeClass('stileModalSuccesso');
					console.log("Data: " + data);
					console.log("badgeRegStatus: " + data);

				}
				else // Registrazione badge: qualcosa non va
				{
					$('#modalRegStatusBody').addClass('stileModalErrore');
					$('#modalRegStatusBody').html("Errore Generico");
					$('#modalRegStatusBody').removeClass('stileModalSuccesso');
					document.getElementById('btnCloseModal').style.display = "inline";
					document.getElementById('btnStopBadgeRegModal').style.display = "none";
					console.log("Data: " + data);
					console.log("badgeRegStatus: " + data);
				}
				document.getElementById('btnCloseModal').style.display = "inline";
				document.getElementById('btnStopBadgeRegModal').style.display = "none";
			},
			error: function (jqXHR, textStatus, error) { // <- Funzione che eseguimo se non siamo riusciti a contattare il lettore rfid
				$('#modalRegStatusBody').addClass('stileModalErrore');
				$('#modalRegStatusBody').html(testoModalErroreConn

				);

				console.log("ERRORE");
				console.log("text stat: " + textStatus);
				console.log("jqXHR: " + jqXHR.getAllResponseHeaders());
				console.log("error: " + error);
			}
		});


	$('#modalRegStatusBody').removeClass('stileModalErrore');
	$('#modalRegStatusBody').removeClass('stileModalSuccesso');
}

// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);

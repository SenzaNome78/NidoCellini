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
const MYSQL_TABLE_PRESENZE_BAMBINI = "tbpresenze_bambini";
const MYSQL_TABLE_PRESENZE_EDUCATORI = "tbpresenze_educatori";

// Elenco di "viste" contenute nel database mysql
const MYSQL_VIEW_BAMBINI = "vwbambini";
const MYSQL_VIEW_EDUCATORI = "vweducatori";
const MYSQL_VIEW_PRESENZE_BAMBINI = "vwpresenzebambini";
const MYSQL_VIEW_PRESENZE_EDUCATORI = "vwpresenzeeducatori";
// FINE ELENCO TABELLE MYSQL

// la variabile pageName contiene il nome della pagina html (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]


var datiTabella;
var idDaPassare;
var idNuovoUtente;

// Funzione estrae i parametri dall'url e li restituisce come oggetto
// Usa la funzione di supporto transformToAssocArray
function getSearchParameters() {
	var prmstr = window.location.search.substr(1);
	return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

// Funzione di supporto transformToAssocArray per
// la funzione getSearchParameters
function transformToAssocArray(prmstr) {
	var params = {};
	var prmarr = prmstr.split("&");
	for (var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}
// Variabile che contiene i paramametri passati attraverso l'url
// undefined se nessun parametro è stato passato
var urlParams = getSearchParameters();

// Una volta memorizzati i parametri dell'url, li eliminiamo dall'url stesso
history.replaceState("", "", location.origin + location.pathname);

var viewMySql; // Variabile stringa che contiene la VIEW mysql per la pagina attuale
var tableMySql; // Variabile stringa che contiene la TABELLA mysql per la pagina attuale
var idDb; // Contiene l'id del database (es. idtbbambini, idtbeducatori, etc)

//variabile che contiene il riferimento alla DataTable creata
var tbTabella;

var ruolo; // Contiene il ruolo, es. B per bambino, E per educatore, etc:
var formName; // nome del form html
var inputName; // nome del campo input che contiene il nome dello user
var inputSesso; // nome del campo input che contiene il sesso dello user

// Il documento è pronto
// Usando il nome della pagina come riferimento, inizializiamo le variabili
// ed eventualmente eseguimo le funzioni che ci servono
$(document).ready(function () {
	// Attiviamo i tooltip
	$('[data-toggle="tooltip"]').tooltip({
		container: 'body'
	});

	if (pageName === "ElencoBambini.html") {
		ruolo = "B";
		tableMySql = MYSQL_TABLE_BAMBINI;
		viewMySql = MYSQL_VIEW_BAMBINI;
		inputName = "nomeBambino";
		inputSesso = "sessoBambino";
		formName = "formModificaUser";
		idDb = "idtbbambini";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeBambino" },
			{ data: "cognomeBambino" },
			{ data: "dataNascitaBambinoFormat" },
			{ data: "educRif" }
		], true);

	} else if (pageName === "ElencoEducatori.html") {
		ruolo = "E";
		tableMySql = MYSQL_TABLE_EDUCATORI;
		viewMySql = MYSQL_VIEW_EDUCATORI;
		inputName = "nomeEducatore";
		inputSesso = "sessoEducatore";
		formName = "formModificaUser";
		idDb = "idtbeducatori";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeEducatore" },
			{ data: "cognomeEducatore" },
			{ data: "codiceFiscaleEducatore" },
			{ data: "tel01Educatore" },
			{ data: "tel02Educatore" },
			{ data: "emailEducatore" }
		], true);
	}
	else if (pageName === "PresenzeBambini.html") {
		ruolo = "B";
		tableMySql = MYSQL_TABLE_PRESENZE_BAMBINI;
		viewMySql = MYSQL_VIEW_PRESENZE_BAMBINI;
		idDb = "idPresenzeBambini";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeCognomeBambino" },
			{ data: "presBambiniData" },
			{ data: "presBambiniOrarioIn" },
			{ data: "presBambiniOrarioOut" }
		], false);
	}
	else if (pageName === "PresenzeEducatori.html") {
		ruolo = "E";
		tableMySql = MYSQL_TABLE_PRESENZE_EDUCATORI;
		viewMySql = MYSQL_VIEW_PRESENZE_EDUCATORI;
		idDb = "idPresenzeEducatori";
		CompilaTabella(viewMySql, idDb, [
			{ data: idDb },
			{ data: "nomeCognomeEducatore" },
			{ data: "presEducatoriData" },
			{ data: "presEducatoriOrarioIn" },
			{ data: "presEducatoriOrarioOut" }
		], false);
	}
	else if (pageName === "Home.html") {
		//Siamo nella home, non facciamo niente
	}
	else // Stampiamo un errore nella console
	{
		console.log("Errore nel nome di pagina");
	}

	// Event handler per il pulsante nuovo utente
	$('#btnNuovo').on('click', function () {
		MostraDettagli(true);
	});

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
 * @param {string} dbTabella Nome della tabella in mySql (uso una view)
 * @param {int} idKey Nome del campo mySql contentente la chiave primaria
 * @param {Array} colonne Un'array con i nomi delle intestazioni delle colonne
 * @param {bool} vociMod Se vero aggiunge un pulsante per modificare le voci
 */
function CompilaTabella(dbTabella, idKey, colonne, vociMod) {

	tbTabella = $("#TabellaCorrente").DataTable(
		{
			// chiamata ajax per compilare la tabella
			ajax: {
				url: PHPURL, // url della nostra pagina php
				method: "POST", // usiamo il comando POST
				data: {
					table: dbTabella // nome della view mysql che andiamo a interrogare
				},
				dataSrc: '',
				error: function (jqXHR, textStatus, e) { // in caso di errore, non visibile all'utente
					if (textStatus == "parsererror") {
						console.log(textStatus);
						console.log("Controllare se il database mysql è avviato.");
					}
				},
				complete: function (jqXHR, textStatus) {
					if (urlParams.command == "new") { // Se nella home è stato selezionato nuovo user
						MostraDettagli(true);	// all'avvio apriamo direttamente il dialog relativo
						urlParams.command = ""; // Lo facciamo solo una volta per refresh
					}
				}
			},

			columns: colonne, // le colonne della tabella, passate come parametro

			"order": [[1, "asc"]],

			responsive: true, // la tabella si ridimensiona con la larghezza della finestra

			rowId: idKey, // nome della chiave primaria della nostra tabella

			select: true, // plugin per selezionare le voci della tabella

			dom: 'ftlip', // ordine degli elementi visualizzati della tabella


			scrollY: 360, // la tabella avrà una barra di scorrimento
			scrollCollapse: true, // la barra di scorrimento verticale sparisce se non necessaria
			// scrollResize: true,
			paging: false, // non dividiamo la tabella in più pagine

			// In questa sezione ho tradotto le varie voci della tabella in italiano
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
				}
			},
		});

	// Aggiunge i pulsanti in basso alla tabella
	new $.fn.DataTable.Buttons(tbTabella, {
		buttons: [

			{	// Ricarica le voci della tabella
				name: "btnRicarica",
				text: "Ricarica voci",
				action: function () {
					tbTabella.ajax.reload();
				}
			},
			{	// modifica la voce selezionata
				name: "btnModifica",
				text: "Modifica voce",
				enabled: false, // Disattivato all'avvio
				action: function () {
					MostraDettagli(false);
				}
			},
			{	// Pulsante per cancellare le voci selezionate
				name: "btnCancella",
				text: 'Cancella voci',
				enabled: false, // Disattivato all'avvio
				className: "btn-danger",  // colore rosso
				action: function () {
					CancellaVoci(idKey);  // esegue la funzione CancellaVoci
				},
				init: function (api, node, config) {
					$(node).removeClass('btn-secondary') // Rimuove la classe di default dei pulsanti
				}
			},
		]
	});

	// Rimuoviamo il pulsante per modificare le voci, se richiesto
	if (vociMod == false) {
		tbTabella.button('btnModifica:name').remove();
	}

	// Posiziona i pulsanti in basso alla tabella
	// tbTabella.buttons().container().prependTo($('#TabellaCorrente_wrapper'));
	tbTabella.buttons().container().appendTo($('#TabellaCorrente_wrapper'));

	// Nasconde la prima colonna (id)
	tbTabella.column(0).visible(false);
}

// Cancella le voci selezionate
// idKey è il nome della colonna id (idtbbambini, idtbeducatori, etc)
function CancellaVoci(idKey) {
	// oggetto che contiene tutte le righe SELEZIONATE
	var obj = tbTabella.rows({ selected: true }).ids(true);
	// variabile che verrà passata alla richiesta POST
	var tmpPostData = "&deleteId=";

	// Per ogni riga selezionata aggiunge l'id del record da cancellare
	// se non è l'ultimo id aggiunge anche una virgola
	for (var i = 0; i < obj.length; i++) {
		if (i > 0) {
			tmpPostData += ",";
		}
		tmpPostData += tbTabella.rows({ selected: true }).ids()[i];
	}

	// Richiesta ajax al server Apache
	// lo script PHP dbComm si occuperà di comunicare col mySql
	$.ajax({
		url: PHPURL,
		method: "POST",
		data: "table=" + tableMySql + tmpPostData + "&idKey=" + idKey,
		success: function (dataRet, stat, xmlh) {
			tbTabella.ajax.reload();
		}
	});
}

// Apre il modal per modificare l'utente
function MostraDettagli(insert) {
	// Eliminiamo i vecchi event handlers per non avere ripetute chiamate
	$('#btnModUser').off('click');
	$('#btnRegBadge').off('click');
	$('#btnAnnullaModal').off('click');
	$('#modalDialogUpdateUser').off('show.bs.modal');
	$('#modalDialogUpdateUser').off('shown.bs.modal');

	$("#checkBadgeGreen").hide();
	$("#checkBadgeRed").show();

	// Event handler per quando il modal sta per essere aperto
	$('#modalDialogUpdateUser').on('show.bs.modal', function (event) {

		// Definiamo le stringhe del modal a seconda se siamo 
		// in inserimento o modifica
		if (insert === true) // INSERIMENTO
		{
			document.getElementById(formName).reset();
			document.getElementById("btnRegBadge").disabled = true;
			$("#modalDialogUpdateUserLabel").html("Inserire i dati del nuovo utente e premere il pulsante salva");
			$("#tipbtnModUserSpan").html("Inserisce il nuovo utente");
			$("#tipBtnRegBadgeSpan").html("Per registrare un nuovo badge si prega di aggiungere un nuovo utente usando il pulsante \"Salva\"");
		}
		else // MODIFICA
		{
			document.getElementById("btnRegBadge").disabled = false;

			$("#modalDialogUpdateUserLabel").html("Modificare i dati e premere Salva");
			$("#tipbtnModUserSpan").html("Salva le modifiche apportate");
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

			// Se l'utente non è associato ad un badge visualizziamo
			// il relativo check mark (doppio if per sapere se B o Ed)
			if (ruolo == "B") {
				if (datiTabella["seriale"] != null) {

					$("#checkBadgeRed").hide();
					$("#checkBadgeGreen").show();
				}
				else {
					$("#checkBadgeGreen").hide();
					$("#checkBadgeRed").show();
				}
			}
			else if (ruolo == "E") {
				if (datiTabella["serialeEducatore"] != null) {

					$("#checkBadgeRed").hide();
					$("#checkBadgeGreen").show();
				}
				else {
					$("#checkBadgeGreen").hide();
					$("#checkBadgeRed").show();
				}
			}

			idDaPassare = datiTabella[idDb];

			// Per ogni campo della tabella (anche quelli nascosti)
			for (var campo in datiTabella) {
				// Controlliamo che il rispettivo controllo esista nel form
				if (typeof controlli[campo] !== 'undefined') {
					// Se sia il campo della tabella che quello del controllo non sono null
					// modifichiamo quest'ultimo
					if ((datiTabella[campo] !== null) && (controlli[campo].value != null)) {
						controlli[campo].value = datiTabella[campo];
					}
				}
			}

		}
		// FINE LETTURA DATI

		if (insert === true) { // Andiamo ad inserire un nuovo utente

			$('#btnModUser').on('click', function (event) {
				if (InsertUpdateUser(true, 0)) {
				}
			});
		}
		else { // Modifichiamo un utente

			$('#btnModUser').on('click', function (event) {
				if (InsertUpdateUser(false, idDaPassare)) {
				}
			});
		}


		$('#btnRegBadge').on('click', function (event) {
			if (insert) {
				RegBadge(idNuovoUtente);
			}
			else {
				RegBadge(idDaPassare);
			}
		});

		$('#btnAnnullaModal').on('click', function (event) {
			event.preventDefault();
			$('#btnModUser').off('click');
			$('#btnRegBadge').off('click');
			$('#btnAnnullaModal').off('click');
			$('#modalDialogUpdateUser').modal('hide');
		});
	});

	// Event handler per quando il modal è stato aperto. Lo usiamo se l'utente
	// è un bambino, compiliamo la combobox idEducatoreRiferimento ed eventualmente selezioniamo
	// l'educatore di riferimento corrente
	$('#modalDialogUpdateUser').on('shown.bs.modal', function (event) {
		// Se l'utente è un bambino qui compiliamo la combobox degli educatori di riferimento
		if (ruolo === "B") {
			$.ajax({
				url: PHPURL,
				method: "POST",
				data: "comboEdRif=vwcomboedrif"

			}).done(function (data) {
				// combobox educatori di riferimento
				var tmpCombo = document.getElementById("idEducatoreRiferimento");
				// Prima di tutto svuotiamo la combobox
				tmpCombo.length = 0;
				// contiene una voce da aggiungere alla combobox
				var tmpOption;

				// Per primo inseriamo una voce vuota per indicare "nessun educatore di rif"
				tmpOption = document.createElement("option");
				tmpOption.value = "";
				tmpOption.text = "";
				tmpCombo.add(tmpOption);

				// Per ogni educatore presente inseriamo una nuova voce
				for (let i = 0; i < data.length; i++) {
					tmpOption = document.createElement("option");
					tmpOption.value = data[i].idEducatoreRiferimento;
					tmpOption.text = data[i].nomeCognRif;
					tmpCombo.add(tmpOption);

					// Se stiamo MODIFICANDO selezioniamo l'educatore di riferimento
					if (insert == false && tmpOption.value == datiTabella.idEducatoreRiferimento) {
						tmpCombo.selectedIndex = i + 1;
					}
				}
			});
		}

		document.getElementById(inputName).focus();


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
		dataObj["paramInsertOrUpdate"] = "insert"; // Indica alla funzione php di eseguire un insert
	}
	else {
		dataObj["paramInsertOrUpdate"] = "update"; // Indica alla funzione php di eseguire un update
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
		if (insert) {
			idNuovoUtente = data;
		}
	});

	var dialogTitolo;
	var dialogTesto;
	// Formattazione post inserimento o modifica
	if (insert === true) {
		// Attiviamo il pulsante per registrare un nuovo badge
		document.getElementById("btnRegBadge").disabled = false;
		$("#tipBtnRegBadgeSpan").html("Registra un nuovo badge per questo utente");

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
		"&id=" + idUtente +
		"&paramTable=" + tableMySql;

	// Visualizziamo un messaggio per invitare ad avvicinare un badge al lettore
	$('#modalRegStatusBody').addClass('stileModalSuccesso');
	$('#modalRegStatusBody').removeClass('stileModalErrore');
	$('#modalRegStatusLabel').html(titoloModalBadge);
	$('#modalRegStatusBody').html(testoModalAttesa);
	$('#modalRegStatus').modal({ backdrop: 'static' });

	// La finestra modal può essere chiusa solo con i pulsanti
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

						tbTabella.ajax.reload();

						// Cambiamo il checkbox a verde
						$("#checkBadgeRed").hide();
						$("#checkBadgeGreen").show();

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

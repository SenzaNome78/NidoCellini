"use strict";
import { RegBadge } from "./nuovoUtente.js";

// costanti che usiamo come chiavi per il comando POST, quando dobbiamo comunicare col server web
const TABLEKEY = "table"
const DELETEKEY = "delete"

// URL del file php con cui ci connettiamo al database
const PHPURL = ".\\php\\dbComm.php";

// Elenco di tabelle contenute nel database mysql
const MYSQL_TABLE_BAMBINI = "tbbambini";
const MYSQL_TABLE_EDUCATORI = "tbeducatori";
const MYSQL_TABLE_PRESENZE_EDUCATORI = "tbpresenzeeducatori";
const MYSQL_TABLE_PRESENZE_BAMBINI = "tbpresenzebambini";
const MYSQL_VIEW_BAMBINI = "vwbambini";
const MYSQL_VIEW_EDUCATORI = "vweducatori";

// la variabile pageName contiene il nome della pagina web (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]

var viewMySql; // Variabile stringa che contiene la VIEW mysql per la pagina attuale
var tableMySql; // Variabile stringa che contiene la TABELLA mysql per la pagina attuale

//variabile che contiene il riferimento alla DataTable creata
var tabella;


// Il nome del form che usiamo per modificare i dati dello user
var formName = "formModificaUser";

// Variabile con il ruolo degli utenti della tabella (B:bambini, E:Educatori, P:Parenti)
var ruolo;

// Aggiungiamo la barra di navigazione superiore alla pagina
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);


// Usando il nome della pagina come riferimento, eseguiamo la funzione
// PopulateTable con i parametri della tabella mysql, l'id dei record e le
// colonne che ci servono e associamo alla variabile currMysqlTable la tabella attuale
$(document).ready(function () {
	if (pageName === "Bacheca.html") {

	} else if (pageName === "ElencoBambini.html") {
		viewMySql = MYSQL_VIEW_BAMBINI;
		ruolo = "B";
		tableMySql = MYSQL_TABLE_BAMBINI;
		PopulateTable(viewMySql, "idtbbambini", [
			{ data: "nomeBambino" },
			{ data: "cognomeBambino" },
			{ data: "dataNascitaBambino" },
			{ data: "nomeSezione" },
			{ data: "educRif" }
		]);

	} else if (pageName === "ElencoEducatori.html") {
		viewMySql = MYSQL_VIEW_EDUCATORI;
		ruolo = "E";
		tableMySql = MYSQL_TABLE_EDUCATORI;
		PopulateTable(viewMySql, "idtbeducatori", [
			{ data: "nomeEducatore" },
			{ data: "cognomeEducatore" },
			{ data: "nomeSezione" },
			{ data: "codiceFiscaleEducatore" },
			{ data: "tel01Educatore" },
			{ data: "tel02Educatore" },
			{ data: "emailEducatore" }
		]);

	}

	// Una o più righe della tabella sono state selezionate
	tabella.on('select', function (e, dt, type, indexes) {
		// Se è stata selezionata una sola riga attiva il pulsante per modificare la voce
		if (type === 'row') {
			var righe = tabella.rows({ selected: true });
			
			if (righe[0].length > 0) {
				// Se sono rimaste seleziona una o più righe, attiva il pulsante per cancellare le voci
				tabella.button('btnCancella:name').enable();
				// Se è rimasta selezionata una sola riga attiva il pulsante per modificare la voce
				if (righe[0].length === 1)
					tabella.button('btnModifica:name').enable();
				else
					tabella.button('btnModifica:name').enable(false);
			}
			
			else { // Nessuna voce selezionata, disattiva i tasti di modifica e cancellazione
				tabella.button('btnModifica:name').enable(false);
				tabella.button('btnCancella:name').enable(false);
			}
		}
	});

	// Una o più righe della tabella sono state deselezionate
	tabella.on('deselect', function (e, dt, type, indexes) {
		
		if (type === 'row') {
			var righe = tabella.rows({ selected: true });

			if (righe[0].length > 0) {
				// Se sono rimaste seleziona una o più righe, attiva il pulsante per cancellare le voci
				tabella.button('btnCancella:name').enable();
				// Se è rimasta selezionata una sola riga attiva il pulsante per modificare la voce
				if (righe[0].length === 1)
					tabella.button('btnModifica:name').enable();
				else
					tabella.button('btnModifica:name').enable(false);
			}
			
			else { // Nessuna voce selezionata, disattiva i tasti di modifica e cancellazione
				tabella.button('btnModifica:name').enable(false);
				tabella.button('btnCancella:name').enable(false);
			}
		}
	});

})


/**
 * Popola la tabella con i dati da un database mySql
 * @param {string} dbTabella Nome della tabella in mySql
 * @param {int} idKey il nome del campo mySql contentente la chiave primaria
 * @param {Array} colonne un'array i nomi delle intestazioni delle colonne
 */
// function PopulateTable(dbTabella, idTabella, idRecord, colonne) {
function PopulateTable(dbTabella, idKey, colonne) {

	tabella = $("#TabellaCorrente").DataTable(
		{
			// chiamata ajax per compilare la tabella
			ajax: {
				url: PHPURL, // url della nostra pagina php
				type: "POST", // usiamo il comando POST
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
			scrollY: '60vh',
			scrollCollapse: true,
			paging: false,
			deferRender: true,

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

	new $.fn.DataTable.Buttons(tabella, {
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
					tabella.ajax.reload();
				}
			},
			{
				name: "btnModifica",
				text: "Modifica voce",
				enabled: false,
				action: function () {
					MostraDettagli();
				}
			},
			{
				text: "Aggiungi random",
				action: function () {
					//AddRandomRecords();
				}
			},
			{
				text: "TestButton",
				action: function () {

					TestButton();
				}
			}
		]
	});
	tabella.buttons().container().appendTo($('#TabellaCorrente_wrapper'));

}

function TestButton() {
	console.log(tabella.rows({}).data());
}

function CancellaVoci(idKey) {

	var obj = tabella.rows({ selected: true }).ids(true);

	var tmpPostData = "&deleteId=";

	for (var i = 0; i < obj.length; i++) {

		if (i > 0) {
			tmpPostData += ",";
		}
		tmpPostData += tabella.rows({ selected: true }).ids()[i];
	}

	$.ajax({
		url: PHPURL,
		method: "POST",
		data: "table=" + tableMySql + tmpPostData + "&idKey=" + idKey,
		success: function (dataRet, stat, xmlh) {
			tabella.ajax.reload();
		}
	});
}

function AddRandomRecords() {
	$.ajax({
		url: PHPURL,
		method: "POST",
		data: "table=" + tableMySql + "&random=exec",
		success: function () {
			tabella.ajax.reload();
		}
	});
}

var datiTabella;
var idDaPassare;
// Apre il modal per modificare l'utente
function MostraDettagli() {
	// Registra un evento all'apertura del modal per riportare la scrollbar in alto
	$('#modalDialogUpdateUser').off('show.bs.modal');
	

	$('#modalDialogUpdateUser').on('show.bs.modal', function (event) {

		// LEGGIAMO I DATI DALLA TABELLA E COMPILIAMO IL FORM
		// Queste due variabili contengono:
		// controlli: tutti i controlli del nostro form html
		// datiTabella: i campi e i valori del record selezionato nella tabella
		var controlli = document.getElementById(formName).elements;
		datiTabella = tabella.rows({ selected: true }).data()[0];

		
		if (ruolo === "B") {
			idDaPassare = datiTabella["idtbbambini"];
		} else if (ruolo === "E") {
			idDaPassare = datiTabella["idtbeducatori"];
		}


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
		// FINE LETTURA DATI


		$('#btnSaveUser').on('click', function (event) {
			if (UpdateUser(idDaPassare))
			{
				$('#modalDialogUpdateUser').modal('hide');
				tabella.ajax.reload();
			}
		});

		$('#btnRegBadge').on('click', function (event) {
			event.preventDefault();
			RegBadge();
		});

		$('#btnAnnullaModal').on('click', function (event) {
			event.preventDefault();
			$('#modalDialogUpdateUser').modal('hide');
		});

	});
	
	$('#modalDialogUpdateUser').modal('show');
	$('#modalDialogUpdateUserModalBody').scrollTop(0);
}

function UpdateUser(idDaPassare) {

	// Controlliamo se i campi obbligatori sono stati inseriti, altrimenti usciamo
	if (!document.getElementById(formName).checkValidity()) {
		return false;
	}
	// preventDefault per non inviare il modulo e non fare il refresh della pagina
	event.preventDefault();

	// In pageControls mettiamo tutti i controlli della pagina
	var pageControls = document.getElementById(formName).elements;

	var i; // contatore
	var dataObj = {}; // Oggetto contenente tutti i controlli che ci servono e i loro valori

	dataObj["paramInsertOrUpdate"] = "update"; // Indica alla funzione php di eseguire un update
	dataObj["paramRuolo"] = ruolo; 	// il ruolo
	dataObj["paramTable"] = tableMySql; // la tabella mysql
	dataObj["paramId"] = idDaPassare; // Id del record mysql da modificare

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

	return true;
}
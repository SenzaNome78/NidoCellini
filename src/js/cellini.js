"use strict";

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

// la variabile pageName contiene il nome della pagina web (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]

var currMysqlTable; // Variabile stringa che contiene la tabella mysql per la pagina attuale

// usiamo questa variabile per passare la tabella mysql attraverso
// il comando POST al nostro script PHP
var postData;

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
		PopulateTable(MYSQL_TABLE_BAMBINI, "idBambino", [
			{ data: "nome" },
			{ data: "cognome" },
			{ data: "dataNascita" },
			{ data: "seriale" }
		]);
	} else if (pageName === "ElencoBambini.html") {
		currMysqlTable = MYSQL_TABLE_BAMBINI;
		PopulateTable(MYSQL_TABLE_BAMBINI, "idtbbambini", [
			{ data: "nome" },
			{ data: "cognome" },
			{ data: "dataNascita" },
			{ data: "seriale" }
		]);

	} else if (pageName === "ElencoEducatori.html") {
		currMysqlTable = MYSQL_TABLE_EDUCATORI;
		PopulateTable(MYSQL_TABLE_EDUCATORI, "idtbeducatori", [
			{ data: "nome" },
			{ data: "cognome" },
			{ data: "dataNascita" },
			{ data: "seriale" }
		]);

	}
	
	postData = TABLEKEY + "=" + currMysqlTable;
})



//variabile che contiene il riferimento alla DataTable creata
var tabella;
/**
 * Popola la tabella con i dati da un database mySql
 * @param {string} dbTabella Nome della tabella in mySql
 * @param {string} idTabella L'id html della tabella visualizzata
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

			rowId: idKey,
			select: true,

			dom: 'ftlip', // ordine degli elementi visualizzati della tabella
			scrollY: '60vh',
			scrollCollapse: true,
			paging: false,
			deferRender: true,
			columns: colonne,

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

	var ButtonsVar = new $.fn.DataTable.Buttons(tabella, {
		buttons: [
			//'copy', 'excel', 'pdf',
			{
				text: 'Cancella voci',
				action: function () {
					CancellaVoci(idKey);
				}
			},
			{
				text: "Ricarica voci",
				action: function () {

					tabella.ajax.reload();
				}
			},
			{
				text: "Aggiungi random",
				action: function () {
					AddRandomRecords();
				}

			}

		]
	});
	tabella.buttons().container().appendTo($('#TabellaCorrente_wrapper'));

}


function CancellaVoci(idKey) {

	var obj = tabella.rows({ selected: true }).ids(true);

	var tmpPostData = "&delete=";

	for (var i = 0; i < obj.length; i++) {

		if (i > 0) {
			tmpPostData += ",";
		}
		tmpPostData += tabella.rows({ selected: true }).ids()[i];
	}

	$.ajax({
		url: PHPURL,
		method: "POST",
		data: postData + tmpPostData + "&idKey=" + idKey,
		success: function (dataRet, stat, xmlh) {

			tabella.ajax.reload();
		}
	});
}

function AddRandomRecords() {
	$.ajax({
		url: PHPURL,
		method: "POST",
		data: postData + "&random=" + "exec",
		success: function () {
			tabella.ajax.reload();
		}
	});
}
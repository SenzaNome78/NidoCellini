"use strict";

const PHPURL = ".\\php\\QuerySezioni.php";

const MYSQL_VIEW_BAMBINI_INSERITI = "vwbambininuovasez";
const MYSQL_VIEW_EDUCATORI_INSERITI = "vweducatorinuovasez";
const MYSQL_TABLE_BAMBINI = "tbbambini";
const MYSQL_TABLE_EDUCATORI = "tbeducatori";
const MYSQL_VIEW_BAMBINI = "vwbambini";
const MYSQL_VIEW_EDUCATORI = "vweducatori";


const TABELLAHTML_BAMBINI = "TabellaBambini";
const TABELLAHTML_EDUCATORI = "TabellaEducatori";

var dtTabellaBambini; // Riferimento alla dtTabella DataTable dei bambini scelti per la sezione
var dtTabellaEducatori; // Riferimento alla dtTabella DataTable degli educatori scelti per la sezione
var dtTabellaAggiungi;

// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);
});

$(document).ready(function () {
	PopulateTableVuota(TABELLAHTML_BAMBINI, dtTabellaBambini, "idtbbambino", [
		{ data: "nome" },
		{ data: "cognome" }
	]);
	PopulateTableVuota(TABELLAHTML_EDUCATORI, dtTabellaEducatori, "idtbeducatori", [
		{ data: "nome" },
		{ data: "cognome" }
	]);


	$("#BtnAggEducatore").on("click", function () {
		ApriModalAggiungiPersone(TABELLAHTML_BAMBINI, MYSQL_VIEW_BAMBINI);
	})

	
	$("#BtnAggBambino").on("click", function () {
		console.log("Clicke");

		$("#modalAggiungiPersone").modal('show');
		
		setTimeout(PredisponiAggiungi(TABELLAHTML_BAMBINI, MYSQL_VIEW_BAMBINI_INSERITI), 5000);
		event.preventDefault();
		$('#modalAggiungiPersone').on('shown.bs.modal', function (event) {
			
		});
		
		// ApriModalAggiungiPersone(TABELLAHTML_EDUCATORI, MYSQL_VIEW_EDUCATORI);
		// $("#tabellaAggiungi").DataTable({
		// 	ajax: PHPURL
		// });
	})




});


/**
 * Popola la dtTabella con i dati da un database mySql
 * @param {string} tabellaHtml Nome della tabella nella pagina html
 * @param {string} dtTabella Nome della dtTabella
 * @param {int} idKey il nome del campo mySql contentente la chiave primaria
 * @param {Array} colonne un'array i nomi delle intestazioni delle colonne
 */
// function PopulateTable(dbTabella, idTabella, idRecord, colonne) {
function PopulateTableVuota(tabellaHtml, dtTabella, idKey, colonne) {

	dtTabella = $("#" + tabellaHtml).DataTable(
		{


			columns: colonne,

			responsive: true,

			//rowId: idKey,
			select: true,

			dom: 'tlip', // ordine degli elementi visualizzati della dtTabella
			scrollY: '60vh',
			scrollCollapse: true,
			paging: false,
			deferRender: true,

			// in questa sezione ho tradotto le varie voci della dtTabella in italiano
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
				infoEmpty: "",
				search: "Applica filtro: ",
				zeroRecords: "Tabella vuota. <br> Usare il pulsante in alto per aggiungere delle voci.",
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

}


function ApriModalAggiungiPersone(tbHTML, dbTabella) {
	event.preventDefault();

	$('#modalAggiungiPersone').on('shown.bs.modal', function (event) {

		dtTabellaAggiungi.data = dtTabellaAggiungi.ajax.url(PHPURL + "?selTutti=" + dbTabella).load();

	});

}



function PredisponiAggiungi(tbHTML, dbTabella) {
	dtTabellaAggiungi = $("#tabellaAggiungi").DataTable(
		{
			ajax: {
				url: PHPURL + "?selTutti=" + dbTabella,
				type: "POST", // usiamo il comando POST
				data: {
					table: dbTabella // nome della dtTabella mysql che andiamo a interrogare
				},
				dataSrc: '',
			},
			columns: [
				{ data: "nome" },
				{ data: "cognome" }
			],
			responsive: true,

			//rowId: idKey,
			select: true,
			// scrollX: "100%",
			dom: 'tlip', // ordine degli elementi visualizzati della dtTabella
			// scrollY: '60vh',
			scrollCollapse: true,
			paging: false,
			deferRender: true,

			// in questa sezione ho tradotto le varie voci della dtTabella in italiano
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
				infoEmpty: "",
				search: "Applica filtro: ",
				zeroRecords: "Tabella vuota. <br> Usare il pulsante in alto per aggiungere delle voci.",
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

	// dtTabellaAggiungi.row.add({ "nome": "test" , "cognome": "cogn"}).draw();
}
/**
 * Popola la dtTabella con i dati da un database mySql
 * @param {string} tabellaHtml Nome della tabella nella pagina html
 * @param {string} dtTabella Nome della dtTabella
 * @param {string} dbTabella Nome della tabella in mySql
 * @param {int} idKey il nome del campo mySql contentente la chiave primaria
 * @param {Array} colonne un'array i nomi delle intestazioni delle colonne
 */
// function PopulateTable(dbTabella, idTabella, idRecord, colonne) {
function PopulateTable(tabellaHtml, dtTabella, dbTabella, idKey, colonne) {

	dtTabella = $("#" + tabellaHtml).DataTable(
		{
			// chiamata ajax per compilare la dtTabella
			ajax: {
				url: PHPURL, // url della nostra pagina php
				type: "POST", // usiamo il comando POST
				data: {
					table: dbTabella // nome della dtTabella mysql che andiamo a interrogare
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

			dom: 'ftlip', // ordine degli elementi visualizzati della dtTabella
			scrollY: '60vh',
			scrollCollapse: true,
			paging: false,
			deferRender: true,

			// in questa sezione ho tradotto le varie voci della dtTabella in italiano
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
				infoEmpty: "dtTabella vuota. Prova a rimuovere i filtri.",
				search: "Applica filtro: ",
				zeroRecords: "dtTabella vuota.<br>Prova a rimuovere i filtri o contatta l'amministratore di sistema",
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

	new $.fn.DataTable.Buttons(dtTabella, {
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
					dtTabella.ajax.reload();
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
	dtTabella.buttons().container().appendTo($('#' + tabellaHtml + '_wrapper'));

}

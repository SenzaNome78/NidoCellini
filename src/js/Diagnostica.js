"use strict";

// URL del file php con cui ci connettiamo all'esp8266
const PHPURL = ".\\php\\Diagnostica.php";

// la variabile pageName contiene il nome della pagina html (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]

$("#btnResetEsp").on("click", function () {
	SendReset();
});

$("#btnAzzeraPresenzeEsp").on("click", function () {
	AzzeraPresenze();
});

// Riavvia il lettore di badge
// Per un bug, dopo un upload del firmware
// è necessario fare un power cycle
function SendReset()
{
	var urlToSend = PHPURL;
	
	$.ajax({
		method: "POST",
		url: urlToSend,
		data: { 
			'command': 'reset'
		}
	});
}

// Azzera le presenze giornaliere contenute
// nel lettore di badge
function AzzeraPresenze()
{
	var urlToSend = PHPURL;
	
	$.ajax({
		method: "POST",
		url: urlToSend,
		data: { 
			'command': 'azzeraPresenze'
		}
	});
}

// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);
}
);
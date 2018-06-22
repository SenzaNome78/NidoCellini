"use strict";

// URL del file php con cui ci connettiamo all'esp8266
const PHPURL = ".\\php\\Diagnostica.php";

// la variabile pageName contiene il nome della pagina html (non il titolo)
var pageName = location.pathname.split("/").slice(-1)[0]

$("#btnResetEsp").on("click", function () {
	SendReset();
});

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

// Carichiamo la navbar in alto
$.get("nav-top.html", function (data) {
	$("#nav-top").replaceWith(data);

	// Rendiamo attiva la voce della barra superiore relativa alla pagina attuale
	$("#Nav" + pageName.split(".")[0]).addClass('active');
}
);
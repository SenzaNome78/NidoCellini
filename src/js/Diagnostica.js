"use strict";

const PHPURL = ".\\php\\Diagnostica.php"; // URL del file php con cui ci connettiamo all'esp8266

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
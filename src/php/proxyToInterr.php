<?php

  // Questo script è usato nel processo di registrazione di un nuovo
  // badge quando l'utente clicca sul pulsante
  // "interrompere registrazione badge"
  // Ci colleghiamo al Lettore di presenze, alla pagina fittizia Inter.html
  $url = "http://192.168.0.6:8080/Interr.html?command=interr";

  $ch = curl_init($url);

  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $execResult   = curl_exec($ch);
  $httpResponse = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $err          = curl_error($ch);

  curl_close($ch);

  // Siamo riusciti ad interrompere la registrazione sul
  // lettore rfid, restituiamo una stringa al browser web
  if ($execResult === "InterrOk")
  {
      echo "InterrOk";
  }
  else // Si è verificato qualche errore, lo notifichiamo al browser
  {
      echo "InterrErr";
      echo $err;
      echo $httpResponse;
      echo $execResult;
  }




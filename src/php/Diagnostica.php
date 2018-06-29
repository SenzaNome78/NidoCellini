<?php

  // In questo script metto varie funzioni di diagnostica
  // Indica la funzione da eseguire
  $paramCommand = isset($_GET['command']) ? $_GET['command'] : '';

  // Passiamo il comando all'ESP8266
  if ($paramCommand !== '')
  {
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, "http://192.168.0.6/Diagnostica.html");
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, "command=$paramCommand£");

      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $server_output = curl_exec($ch);

      echo $server_output;

      curl_close($ch);
  }



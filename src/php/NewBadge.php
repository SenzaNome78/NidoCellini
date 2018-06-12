<?php

  // In questo script PHP ci occupiamo della registrazione di un nuovo badge


  $commandParam = isset($_GET['command']) ? $_GET['command'] : '';
  $NomeDaReg    = isset($_GET['nome']) ? $_GET['nome'] : '';
  $RuoloDaReg   = isset($_GET['ruolo']) ? $_GET['ruolo'] : '';
  $SessoDaReg   = isset($_GET['sesso']) ? $_GET['sesso'] : '';

  if ($commandParam === "newBadge")
  {
      $url = "http://192.168.0.6/?nome=$NomeDaReg&ruolo=$RuoloDaReg&sesso=$SessoDaReg";
  }

  $ch = curl_init($url);

  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $execResult   = curl_exec($ch);
  //echo print_r(curl_getinfo($ch));
  $rfidResponse = "";
  if ($execResult === false) // Connessione non riuscita
  {
      $rfidResponse = "ConnErr";
  }
  else
  {
      if (strpos($execResult, "&S=Registrato") !== false)
      {
          $rfidResponse .= "&S=Registrato";
      }
      if (strpos($execResult, "&F=ScriviNuovoBadge") !== false)
      {
          $rfidResponse .= "&F=ScriviNuovoBadge";
      }
      if (strpos($execResult, "&F=Stop") !== false)
      {
          $rfidResponse .= "&F=Stop";
      }
      if (strpos($execResult, "&F=Timeout") !== false)
      {
          $rfidResponse .= "&F=Timeout";
      }

      $rfidResponse .= "&ConnOk";
  }
  curl_close($ch);
  echo $rfidResponse;



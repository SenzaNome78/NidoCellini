<?php

  $proxyParam = $_GET['command'];
  $NomeDaReg  = $_GET['nome'];
  $RuoloDaReg = $_GET['ruolo'];
  $SessoDaReg = $_GET['sesso'];

  if ($proxyParam == "newBadge")
  {
      $url = "http://192.168.0.6/?nome=$NomeDaReg&ruolo=$RuoloDaReg&sesso=$SessoDaReg";
  }
  echo $url;
//  $handle = file_get_contents(urlencode($url));
  $ch = curl_init("http://192.168.0.6/?nome=$NomeDaReg&ruolo=$RuoloDaReg&sesso=$SessoDaReg");
//  $fp = fopen("", "w");
//  curl_setopt($ch, CURLOPT_FILE, $fp);
  curl_setopt($ch, CURLOPT_HEADER, 0);

  curl_exec($ch);
  curl_close($ch);
//  fclose($fp);
//  if ($handle)
//  {
//      while (!feof($handle))
//      {
//          $buffer = fgets($handle, 4096);
//          echo($handle);
//      }
//      fclose($handle);
//  }

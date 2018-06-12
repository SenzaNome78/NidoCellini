<?php

  $commandParam = isset($_GET['command']) ? $_GET['command'] : '';

  if ($commandParam === "stop")
  {
      $url    = "http://192.168.0.6/?command=stop";
      $StopCh = curl_init($url);

      curl_setopt($StopCh, CURLOPT_HEADER, 0);
      curl_setopt($StopCh, CURLOPT_CONNECTTIMEOUT, 5);
      $execStopResult = curl_exec($StopCh);
      exit;
  }


  $ch = curl_init($url);


  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
//  curl_setopt($ch, CURLOPT_TIMEOUT, 3);
  $execResult   = curl_exec($ch);
  $httpResponse = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

  if ($execResult === true)
  {
      curl_close($ch);
      echo "ConnOk";
  }
  else
  {
      curl_close($ch);
      echo "ConnErr";
  }




<?php

  $commandParam = isset($_GET['command']) ? $_GET['command'] : '';

  $url = "http://192.168.0.6:8080/Interr.html?command=interr";

  $ch = curl_init($url);


  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//  curl_setopt($ch, CURLOPT_TIMEOUT, 3);
  $execResult   = curl_exec($ch);
  $httpResponse = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $err          = curl_error($ch);

  curl_close($ch);

  if ($execResult === "InterrOk")
  {
      echo "InterrOk";
  }
  else
  {
      echo "InterrErr";
      echo $err;
      echo $httpResponse;
      echo $execResult;
  }




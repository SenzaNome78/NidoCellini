<?php

  $paramCommand = $_POST["command"];

  if ($paramCommand === "reset")
  {
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, "http://192.168.0.6/Diagnostica.html");
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, "command=reset£");

      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $server_output = curl_exec($ch);

      echo $server_output;

      curl_close($ch);
  }


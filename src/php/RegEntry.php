<?php

  try
  {
      date_default_timezone_set("Europe/Rome");
      $paramSeriale = $_GET["seriale"];
      $paramRuolo   = $_GET["ruolo"];

      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini;charset=utf8mb4', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $giorno      = date('Y-m-d');
      echo $giorno . "\n\r";
      $oraIngresso = date('H:i:s');

      echo $oraIngresso . "\n\r";

      // $sqlInsert inserisce la presenza nella relativa tabella
      // $sqlId contiene tutti i record della tabella, la usiamo per trovare l'id

      if ($paramRuolo === "B")
      {
          $sqlId = $db->prepare("SELECT * FROM tbbambini");
      }
      elseif ($paramRuolo === "E")
      {
          $sqlId = $db->prepare("SELECT * FROM tbeducatori");
      }

      $sqlId->execute();
      $res = $sqlId->fetchAll(PDO::FETCH_ASSOC);

      foreach ($res as $key => $value)
      {

          // echo "Seriale di " . $value["nome"] . ": " . $value["seriale"] . "\n\r";;
          // Troviamo l'id della persona inserita usando il seriale del badge
          if ($paramRuolo === "B" && $value["serialeBambino"] == $paramSeriale)
          {
              $idUser = $value["idtbbambini"];

              $sqlInsert = "INSERT INTO tbpresenze_bambini"
                  . " (idPresenzeBambini, presBambiniData, presBambiniOrarioIn, presBambiniOrarioOut, "
                  . "presBambiniGiustifMancataEntrata, idBambino_presenza)"
                  . " VALUES "
                  . "(DEFAULT, '$giorno', '$oraIngresso', NULL, NULL, '$idUser')";

              $db->exec($sqlInsert);
          }
          else if ($paramRuolo === "E" && $value["serialeEducatore"] == $paramSeriale)
          {
              $idUser = $value["idtbeducatori"];

              $sqlInsert = "INSERT INTO tbpresenze_educatori"
                  . " (idPresenzeEducatori, presEducatoriData, presEducatoriOrarioIn, presEducatoriOrarioOut, "
                  . "presEducatoriGiustifMancataEntrata, idEducatore_presenza)"
                  . " VALUES "
                  . "(DEFAULT, '$giorno', '$oraIngresso', NULL, NULL, '$idUser')";

              $db->exec($sqlInsert);
          }
          // echo "Id di " . $value["nome"] . ": " . $value["idBambino"] . ".\n\r";
      }
      // echo "New record created successfully";
  } catch (PDOException $e)
  {
      echo $sqlId . "<br>" . $e->getMessage();
  }


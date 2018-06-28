<?php

  try
  {
//      ignore_user_abort(true);
//      set_time_limit(400);
//
//      ob_start();
//      //echo $response; // send the response
//      header('Connection: close');
//      header('Content-Length: ' . ob_get_length());
//      ob_end_flush();
//      flush();
//

      date_default_timezone_set("Europe/Rome");

      $paramSeriale  = isset($_GET["seriale"]) ? $_GET["seriale"] : '';
      $paramRuolo    = isset($_GET["ruolo"]) ? $_GET["ruolo"] : '';
      $paramEntrata  = isset($_GET["entrata"]) ? $_GET["entrata"] : '';
      $paramIdUscita = isset($_GET['idPresenzaUscita']) ? $_GET['idPresenzaUscita'] : '';


      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini;charset=utf8mb4', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


      $giorno = date('Y-m-d');
      $ora    = date('H:i:s');

      $result;

      // Usiamo questi SELECT per trovare l'utente col seriale
      // del badge rilevato
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


      if ($paramEntrata == 1) // Registriamo un'entrata
      {
          $serialePresente = false; // Indica se il seriale è associato ad un utente
          foreach ($res as $key => $value)
          {
              // Troviamo l'id della persona inserita usando il seriale del badge
              if ($paramRuolo === "B" && $value["seriale"] === $paramSeriale)
              {
                  $idUser = $value["idtbbambini"];

                  $sqlInsert = "INSERT INTO tbpresenze_bambini"
                      . " (idPresenzeBambini, presBambiniData, presBambiniOrarioIn,"
                      . " presBambiniOrarioOut, idBambino_presenza)"
                      . " VALUES "
                      . "(DEFAULT, '$giorno', '$ora', NULL, '$idUser')";

                  $serialePresente = true;

                  break;
              }
              else if ($paramRuolo === "E" && $value["seriale"] === $paramSeriale)
              {
                  $idUser = $value["idtbeducatori"];

                  $sqlInsert = "INSERT INTO tbpresenze_educatori"
                      . " (idPresenzeEducatori, presEducatoriData, presEducatoriOrarioIn,"
                      . " presEducatoriOrarioOut, idEducatore_presenza)"
                      . " VALUES "
                      . "(DEFAULT, '$giorno', '$ora', NULL, '$idUser')";

                  $serialePresente = true;

                  break;
              }
          }

          // Se il seriale è associato ad un utente registriamo la presenza e inviamo l'id della presenza
          // al lettore RFID dove verrà affiancato al seriale del badge e usato in seguito per l'uscita

          if ($serialePresente)
          {
              $query = $db->prepare($sqlInsert);

              $result = $query->execute();

              $idPresenza = $db->lastInsertId();

              // $url = "http://192.168.0.6/RegEntry.html?seriale=$paramSeriale&idPresenza=$idPresenza"; DA CANCELLARE

              echo "?seriale=$paramSeriale&idPresenza=$idPresenza&";
          }
          else // Il seriale non era associato ad un utente, lo facciamo sapere al Lettore RFID
          {
              //$url = "http://192.168.0.6/RegEntry.html?seriale=NoSeriale"; DA CANCELLARE

              echo "?seriale=NO_SERIALE&";
          }
          // Comunicazione verso il lettore RFID, in ogni caso
//          $ch = curl_init($url);
//
//          curl_setopt($ch, CURLOPT_HEADER, 0);
//          curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
//          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//          $execResult = curl_exec($ch);
//          curl_close($ch);
      }

      // Si tratta di un'uscita, registiamo l'orario nello stesso record mysql dove
      // abbiamo registrato l'entrata
      else
      {
          foreach ($res as $key => $value)
          {
              // Troviamo l'id della persona inserita usando il seriale del badge
              if ($paramRuolo === "B" && $value["seriale"] === $paramSeriale)
              {
                  $sqlInsert = "UPDATE tbpresenze_bambini "
                      . "SET presBambiniOrarioOut = '$ora' "
                      . "WHERE idPresenzeBambini = '$paramIdUscita'";
                  break;
              }
              else if ($paramRuolo === "E" && $value["seriale"] === $paramSeriale)
              {

                  $sqlInsert = "UPDATE tbpresenze_educatori "
                      . "SET presEducatoriOrarioOut = '$ora' "
                      . "WHERE idPresenzeEducatori = '$paramIdUscita'";
                  break;
              }
          }
          $query = $db->prepare($sqlInsert);

          $result     = $query->execute();
          $idPresenza = $db->lastInsertId();
      }
  } catch (PDOException $e)
  {
      echo $e->getMessage();
  }


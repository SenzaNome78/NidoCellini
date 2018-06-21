<?php

  try
  {
      ignore_user_abort(true);
      set_time_limit(400);

      ob_start();
      //echo $response; // send the response
      header('Connection: close');
      header('Content-Length: ' . ob_get_length());
      ob_end_flush();
      flush();


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


      if ($paramEntrata === "vero") // Registriamo un'entrata
      {
          foreach ($res as $key => $value)
          {
              // Troviamo l'id della persona inserita usando il seriale del badge
              if ($paramRuolo === "B" && $value["seriale"] === $paramSeriale)
              {
                  $idUser = $value["idtbbambini"];

                  $sqlInsert = "INSERT INTO tbpresenze_bambini"
                      . " (idPresenzeBambini, presBambiniData, presBambiniOrarioIn, presBambiniOrarioOut, "
                      . "presBambiniGiustifMancataEntrata, idBambino_presenza)"
                      . " VALUES "
                      . "(DEFAULT, '$giorno', '$ora', NULL, NULL, '$idUser')";
                  break;
              }
              else if ($paramRuolo === "E" && $value["seriale"] === $paramSeriale)
              {
                  $idUser = $value["idtbeducatori"];

                  $sqlInsert = "INSERT INTO tbpresenze_educatori"
                      . " (idPresenzeEducatori, presEducatoriData, presEducatoriOrarioIn, presEducatoriOrarioOut, "
                      . "presEducatoriGiustifMancataEntrata, idEducatore_presenza)"
                      . " VALUES "
                      . "(DEFAULT, '$giorno', '$ora', NULL, NULL, '$idUser')";
                  break;
              }
          }
          // Nel seguente blocco di codice inviamo l'id della presenza registrato in mysql
          // Verrà affiancato al seriale del badge nell'oggetto rfid e usato in seguito per l'uscita
          $query = $db->prepare($sqlInsert);

          $result = $query->execute();

          $idPresenza = $db->lastInsertId();

          $url = "http://192.168.0.6/RegEntry.html?seriale=$paramSeriale&idPresenza=$idPresenza";
          $ch  = curl_init($url);

          curl_setopt($ch, CURLOPT_HEADER, 0);
          curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $execResult = curl_exec($ch);
          curl_close($ch);
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

                  $idUser = $value["idtbeducatori"];
//
//                  $sqlInsert = "INSERT INTO tbpresenze_educatori"
//                      . " (idPresenzeEducatori, presEducatoriData, presEducatoriOrarioIn, presEducatoriOrarioOut, "
//                      . "presEducatoriGiustifMancataEntrata, idEducatore_presenza)"
//                      . " VALUES "
//                      . "(DEFAULT, '$giorno', '$ora', NULL, NULL, '$idUser')";
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


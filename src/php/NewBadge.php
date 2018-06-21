<?php

  // In questo script PHP ci occupiamo della registrazione di un nuovo badge
  // Associamo a ogni variabile PHP i parametri passati
  // dal lettore rfid
  $commandParam = isset($_GET['command']) ? $_GET['command'] : '';
  $NomeDaReg    = isset($_GET['nome']) ? $_GET['nome'] : '';
  $RuoloDaReg   = isset($_GET['ruolo']) ? $_GET['ruolo'] : '';
  $SessoDaReg   = isset($_GET['sesso']) ? $_GET['sesso'] : '';
  $idUtente     = isset($_GET['id']) ? $_GET['id'] : '';
  $idKey        = isset($_GET['idKey']) ? $_GET['idKey'] : '';
  $tableName    = isset($_GET['paramTable']) ? $_GET['paramTable'] : '';

  // Collegamento al database Mysql
  $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


  // url per il lettore presenze a cui passiamo i paramentri necessari
  $url = "http://192.168.0.6/NewBadge.html?nome=$NomeDaReg&ruolo=$RuoloDaReg&sesso=$SessoDaReg";

  // usiamo curl per comunicare col lettore rfid
  $ch = curl_init($url);

  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  // Risultato del collegamento http col lettore rfid
  $execResult = curl_exec($ch);

  // Assegnamo a questa variabile quello che passiamo al client
  // che reagirà di conseguenza
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

          // Estraiamo dal risultato http dal rfid il seriale del badge registrato
          $serialeRegistrato = substr($execResult, strpos($execResult, "&seriale=") + 9);

          // Usiamo il seriale per vedere se il badge era già associato ad un'altra persona.
          // Se sì, lo dissociamo da quella persona per associarlo alla nuova
          // Prima la tabella dei bambini
          $sqlId = $db->prepare("SELECT idtbbambini, seriale FROM tbbambini");

          $sqlId->execute();

          $dbResult = $sqlId->fetchAll(PDO::FETCH_ASSOC);

          $updateSql = "";

          foreach ($dbResult as $key => $value)
          {
              // Se il seriale dell'utente in questa iterazione
              // è uguale al seriale del nuovo badge
              // lo impostiamo a NULL
              if ($value['seriale'] === $serialeRegistrato)
              {
                  $idOldSeriale = $value['idtbbambini'];
                  $updateSql    = "UPDATE tbbambini SET seriale = NULL"
                      . " WHERE idtbbambini = '$idOldSeriale'";

                  $db->exec($updateSql);
              }
          }

          // Ora la tabella degli educatori
          $sqlId = $db->prepare("SELECT idtbeducatori, seriale FROM tbeducatori");

          $sqlId->execute();

          $dbResult = $sqlId->fetchAll(PDO::FETCH_ASSOC);

          $updateSql = "";

          foreach ($dbResult as $key => $value)
          {
              // Se il seriale dell'utente in questa iterazione
              // è uguale al seriale del nuovo badge
              // lo impostiamo a NULL
              if ($value['seriale'] === $serialeRegistrato)
              {
                  $idOldSeriale = $value['idtbeducatori'];
                  $updateSql    = "UPDATE tbeducatori SET seriale = NULL"
                      . " WHERE idtbeducatori = '$idOldSeriale'";

                  $db->exec($updateSql);
              }
          }

          // Impostiamo il seriale per l'utente corrente a quello del badge registrato
          $SqlString = "UPDATE $tableName SET seriale = $serialeRegistrato WHERE $idKey = $idUtente";
          $db->exec($SqlString);
      }

      // La scrittura del badge è fallita per qualche
      // motivo generico
      if (strpos($execResult, "&F=ScriviNuovoBadge") !== false)
      {
          $rfidResponse .= "&F=ScriviNuovoBadge";
      }
      // La scrittura del badge è stata
      // interrotta dall'utente
      if (strpos($execResult, "InterrWOk") !== false)
      {
          $rfidResponse .= "&F=Stop";
      }
      // Il tempo per scrivere il badge è finito
      if (strpos($execResult, "&F=Timeout") !== false)
      {
          $rfidResponse .= "&F=Timeout";
      }

      $rfidResponse .= "&ConnOk"; // Connessione riuscita
  }

  curl_close($ch);
  echo $rfidResponse;



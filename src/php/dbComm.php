<?php

  // In questo script avviene il dialogo principale
  // tra il browser web e il database mySQL
  // Sono presenti le funzioni per compilare una tabella e
  // per inserire, modificare e cancellare un utente
  //Classe vuota per contenere i risultati della query PDO
  class RecordClass
  {

      function __construct()
      {

      }

  }

  try
  { // Analizzo i parametri POST per avviare la funzione richiesta
      if (isset($_POST['deleteId']))
      {   // Cancelliamo uno o più record
          DeleteRecord();
      }
      else if (isset($_POST['paramInsertOrUpdate']))
      { // Inseriamo o modifichiamo un utente
          InsertUpdateUser();
      }
      else if (isset($_POST['table']))
      {   // compiliamo una tabella
          CompilaTabella($_POST['table']);
      }
      else if (isset($_POST['comboEdRif']))
      {   // compiliamo la combobox degli educatori di riferimento
          CompilaTabella($_POST['comboEdRif']);
      }
      else
      {   // Chiave sconosciuta, stampiamo un messaggio di errore
          foreach ($_REQUEST as $key => $value)
          {
              echo "chiave: " . $key . ' - ' . $value . '</br>';
          }

          echo 'ERRORE!';
      }
  } catch (PDOException $e)
  {
      echo 'Connection failed: ' . $e->getMessage();
  }

  // Restituisce un array di dati estratti dalla tabella del database MySQL
  function CompilaTabella($tableName)
  {

      // Apriamo il collegamento col database
      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      // Prepariamo la stringa SQL, che seleziona tutti i record della tabella
      $query = $db->prepare("SELECT * FROM $tableName");

      // Eseguiamo la query
      $query->execute();

      // Dalla query estraiamo tutti i record, affidandoli alla variabile $result
      $result = $query->fetchAll(PDO::FETCH_CLASS, "RecordClass");

      // Preparariamo l'header come tipo di dati JSON
      header("Content-type: application/json");
      // Restituiamo al browser web il nostro risultato formattato come JSON
      echo json_encode($result);
  }

  // Cancelliamo uno o più utenti o presenze
  function DeleteRecord()
  {
      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $tableName = $_POST["table"];
      $deleteId  = $_POST["deleteId"];
      $idKey     = $_POST["idKey"];

      $deleteSQL = "DELETE FROM $tableName WHERE $idKey IN ($deleteId)";
      echo $db->exec($deleteSQL);
  }

  function InsertUpdateUser()
  {

      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $tableName = $_POST["paramTable"];
      $ruolo     = $_POST["paramRuolo"];

      // Compilo la stringa SQL per INSERIRE un nuovo utente
      if ($_POST["paramInsertOrUpdate"] === "insert")
      {
          $SqlString       = "INSERT INTO " . $tableName . " (";
          $recordsToInsert = "";
          $fieldsToInsert  = "";

          // Per ogni campo da aggiungere alla stringa SQL
          foreach ($_POST as $key => $value)
          {
              if ($value === "")
              {
                  $value = NULL;
              }
              if (substr($key, 0, 5) !== "param")
              {
                  $recordsToInsert .= $key . ", ";
                  if ($value === "" or $value === NULL) // il campo da inserire è vuoto
                  {
                      $fieldsToInsert .= "NULL" . ", ";
                  }
                  else // il campo da inserire contiene qualcosa
                  {
                      $fieldsToInsert .= "'" . $value . "'" . ", ";
                  }
              }
          }
          $recordsToInsert = rtrim($recordsToInsert, ", ");
          $fieldsToInsert  = rtrim($fieldsToInsert, ", ");

          $SqlString .= $recordsToInsert . ") VALUES (" . $fieldsToInsert . ")";

          $db->exec($SqlString);
          $lastId = $db->lastInsertId();
          echo $lastId;
      }
      // Facciamo un UPDATE
      else if ($_POST["paramInsertOrUpdate"] === "update")
      {
          $id              = $_POST["paramId"];
          $SqlString       = "UPDATE " . $tableName . " SET ";
          $recordsToInsert = "";
          $fieldsToInsert  = "";

          // Per ogni campo da aggiungere alla stringa SQL
          foreach ($_POST as $key => $value)
          {
              if ($value === "")
              {
                  $value = "NULL";
              }
              if (substr($key, 0, 5) !== "param")
              {
                  $SqlString .= $key . " = ";
                  if ($value === "" or $value === "NULL") // il campo da inserire è vuoto
                  {
                      $SqlString .= "NULL" . ", ";
                  }
                  else // il campo da inserire contiene qualcosa
                  {
                      $SqlString .= "'" . $value . "'" . ", ";
                  }
              }
          }
          $SqlString      = rtrim($SqlString, ", ");
          $fieldsToInsert = rtrim($fieldsToInsert, ", ");

          if ($ruolo === "B")
          {
              $SqlString .= " WHERE idtbbambini = $id";
          }
          else if ($ruolo === "E")
          {
              $SqlString .= " WHERE idtbeducatori = $id";
          }

          $db->exec($SqlString);
      }
  }

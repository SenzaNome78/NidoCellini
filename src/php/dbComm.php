<?php

  session_start();

  //Classe vuota per la query dati
  class RecordClass
  {

      function __construct()
      {

      }

  }

  try
  {
      if (isset($_POST['deleteId']))
      {
          DeleteRecord();
      }
      else if (isset($_POST['random']))
      {
          AddRandomRecords();
      }
      else if (isset($_POST['paramInsertOrUpdate']))
      {
          InsertUpdateUser();
      }
      else if (isset($_POST['table']))
      {
          PopulateTable();
      }
      else
      {
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

  function PopulateTable()
  {

      $tableName = $_POST["table"];

      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $query  = $db->prepare("SELECT * FROM $tableName");
      $query->execute();
      $result = $query->fetchAll(PDO::FETCH_CLASS, "RecordClass");

      header("Content-type: application/json");
      echo json_encode($result);
      //echo "{\"data\": " . json_encode($result) . " }";
  }

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
      //paramInsertOrUpdate
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
              if (substr($key, 0, 5) !== "param")
              {
                  $recordsToInsert .= $key . ", ";
                  if ($value === "")
                  {
                      $fieldsToInsert .= "'" . "" . "'" . ", ";
                  }
                  else
                  {
                      $fieldsToInsert .= "'" . $value . "'" . ", ";
                  }
              }
          }
          $recordsToInsert = rtrim($recordsToInsert, ", ");
          $fieldsToInsert  = rtrim($fieldsToInsert, ", ");

          $SqlString .= $recordsToInsert . ") VALUES (" . $fieldsToInsert . ")";
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
              if (substr($key, 0, 5) !== "param")
              {
                  $SqlString .= $key . " = ";
                  if ($value === "") // il campo da inserire è vuoto
                  {
                      $SqlString .= "'" . "" . "'" . ", ";
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
      }

      $db->exec($SqlString);
  }

  function AddRandomRecords()
  {
      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


      $tableName = $_POST["table"];
      $execSQL   = "call dbnidocellini.CreateRandom();";
      $db->exec($execSQL);
  }

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
      if (isset($_POST['delete']))
      {
          DeleteRecord();
      }
      else if (isset($_POST['random']))
      {
          AddRandomRecords();
      }
      else if (isset($_POST['paramInsertUser']))
      {
          InsertNewUser();
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

      $query  = $db->prepare("SELECT * FROM " . $tableName);
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
      $deleteId  = $_POST["delete"];
      $idKey     = $_POST["idKey"];

      $deleteSQL = "DELETE FROM $tableName WHERE $idKey IN ($deleteId)";
      $db->exec($deleteSQL);
  }

  function InsertNewUser()
  {
      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $tableName        = $_POST["paramTableForInsert"];
      $insertNewUserSql = "INSERT INTO " . $tableName . " (";

      $recordsToInsert = "";
      $fieldsToInsert  = "";
      foreach ($_POST as $key => $value)
      {
          if (substr($key, 0, 5) !== "param")
          {
              $recordsToInsert .= $key . ", ";
              $fieldsToInsert  .= "'" . $value . "'" . ", ";
          }
      }
      $recordsToInsert = rtrim($recordsToInsert, ", ");
      $fieldsToInsert  = rtrim($fieldsToInsert, ", ");

      $insertNewUserSql .= $recordsToInsert . ") VALUES (" . $fieldsToInsert . ")";
      $tableExists      = $db->query("SHOW TABLES");
      if ($tableExists === true)
      {
          $db->exec($insertNewUserSql);
      }
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

<?php

  session_start();

  //Classe vuota per la query dati
//  class RecordClass{function __construct(){}}

  try
  {
      if (isset($_GET['selTutti'])) // La pagina ci ha chiesto tutti i record della tabella o view
      {
          selTutti();
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

// Scipt PHP per gestire le pagine relative alle sezioni

  function selTutti()
  {

      $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $paramDbTable = $_GET['selTutti'];
      $qrySQL       = $db->prepare("SELECT * FROM $paramDbTable");
      $qrySQL->execute();
      $result       = $qrySQL->fetchAll();

      header("Content-type: application/json");
      echo json_encode($result);
  }

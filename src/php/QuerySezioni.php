<?php

// In questo file php interroghiamo il database mysql
// e restituiamo una lista con i nomi delle sezioni

  $db = new PDO('mysql:host=localhost;dbname=dbnidocellini', 'root', 'mysql231278');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

  $qrySQL = $db->prepare("SELECT * FROM tbsezioni");
  $qrySQL->execute();
  $result = $qrySQL->fetchAll();

  header("Content-type: application/json");
  echo json_encode($result);

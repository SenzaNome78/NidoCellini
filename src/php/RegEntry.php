<?php

try {

	date_default_timezone_set("Europe/Rome");
	$seriale = $_GET["seriale"];

	$db = new PDO('mysql:host=localhost;dbname=dbnidocellini;charset=utf8mb4', 'root', 'mysql231278');
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

	$giorno = date('Y-m-d');
	echo $giorno . "\n\r";
	$oraIngresso = date('H:i:s');

	echo $oraIngresso . "\n\r";
      
	// $sqlInsert inserisce la presenza nella relativa tabella  
	

	// $sqlId contiene tutti i record della tabella, la usiamo per trovare l'id	  
	$sqlId = $db->prepare("SELECT tbbambini.* FROM tbbambini");
	$sqlId->execute();
	$res = $sqlId->fetchAll(PDO::FETCH_ASSOC);
	//   $db->exec($sqlId);
	//   print_r($res);

	// echo "Seriale inserito: " . $seriale . "\n\r";
	foreach ($res as $key => $value) {
		
		// echo "Seriale di " . $value["nome"] . ": " . $value["seriale"] . "\n\r";;
		// Troviamo l'id della persona inserita usando il seriale del badge
		if ($value["seriale"] == $seriale) {
			$idB = $value["idBambino"];
			$sqlInsert = "INSERT INTO tbpresenzebambini (dataPresenza, orarioEntrata, idBambino_IN_presenze)"
				. " VALUES ('$giorno', '$oraIngresso', '$idB')";

			$db->exec($sqlInsert);
			// echo "Id di " . $value["nome"] . ": " . $value["idBambino"] . ".\n\r";
		}
	}
	// echo "New record created successfully";
} catch (PDOException $e) {
	echo $sqlId . "<br>" . $e->getMessage();
}
?>


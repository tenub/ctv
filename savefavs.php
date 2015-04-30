<?php
	include "db.php";
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$favarray = $_POST["fa"];
	$favarray = json_decode($favarray, true);
	$sql = "UPDATE favorites SET name = NULL WHERE name is not null; ";
	$sql .= "SELECT * FROM favorites WHERE name = ''; ";
	$sql .= "DELETE FROM favorites WHERE name = ''; ";
	$sql .= "INSERT INTO favorites (name) VALUES ";
	foreach($favarray as $show) {
		$sql .= "('$show'),";
	}
	$sql = rtrim($sql,",");
	$stmt = $conn->prepare($sql);
	$stmt->setFetchMode(PDO::FETCH_ASSOC);
	if ($stmt) {
		try {
			$stmt->execute();
		}
		catch (PDOException $e) {
			var_dump($e);
		}
	}
?>
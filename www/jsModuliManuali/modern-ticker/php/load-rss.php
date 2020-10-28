<?php

$url = $_GET['url'];

$feed = simplexml_load_file($url);

echo json_encode($feed);

?>
<?php

$url = $_GET['url'];

$feed = file_get_contents($url);

echo $feed;

?>
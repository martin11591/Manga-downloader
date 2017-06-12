<?php

require_once 'getHTML.php';

$url=filter_input(INPUT_POST,"url");
$url=filter_input(INPUT_GET,"url");
$html=getHTML($url);

echo $html;
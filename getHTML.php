<?php

function getHTML($url) {
    $curl = curl_init();

    // Setup headers - I used the same headers from Firefox version 2.0.0.6 
    // below was split up because php.net said the line was too long. :/ 
    $header[0] = "Accept: text/xml,application/xml,application/xhtml+xml";
    $header[0] .= "text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5,image/jpg,*/*;q=0.5,image/jpeg,*/*;q=0.5";
    $header[] = "Cache-Control: max-age=0";
    $header[] = "Connection: keep-alive";
    $header[] = "Keep-Alive: 300";
    $header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7";
    $header[] = "Accept-Language: en-us,en;q=0.5";
    $header[] = "Pragma: "; // browsers keep this blank. 

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_USERAGENT, 'Googlebot/2.1 (+http://www.google.com/bot.html)');
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    curl_setopt($curl, CURLOPT_REFERER, 'http://www.google.com');
    curl_setopt($curl, CURLOPT_ENCODING, 'gzip,deflate');
    curl_setopt($curl, CURLOPT_AUTOREFERER, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_TIMEOUT, 10);

    $html = curl_exec($curl); // execute the curl command 
    curl_close($curl); // close the connection
    
    if (strpos($url, '.jpg') !== false) {
        $html = "data:image/jpg;base64,".base64_encode($html);
    }
    
    if (strpos($url, '.jpeg') !== false) {
        $html = "data:image/jpeg;base64,".base64_encode($html);
    }
    
    if (strpos($url, '.png') !== false) {
        $html = "data:image/png;base64,".base64_encode($html);
    }
    
    if (strpos($url, '.gif') !== false) {
        $html = "data:image/gif;base64,".base64_encode($html);
    }

    return $html; // and finally, return $html 
}

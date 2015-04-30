<?php

    $url = "http://services.tvrage.com/myfeeds/fullschedule.php?key=8aMu08YUL4Zy3rDTN12C";
    $str = file_get_contents($url);
    $str = str_replace(array("\n", "\r", "\t"), "", $str);
    $xml = simplexml_load_string($str);
    $json = json_encode($xml);
    $json = str_replace("@", "", $json);
    $file = "colechrzan.com/feed.json";
    file_put_contents($file, $json);

    $url = "http://services.tvrage.com/myfeeds/currentshows.php?key=8aMu08YUL4Zy3rDTN12C";
    $str = file_get_contents($url);
    $str = str_replace(array("\n", "\r", "\t"), "", $str);
    $xml = simplexml_load_string($str);
    $json = json_encode($xml);
    $file = "colechrzan.com/shows.json";
    file_put_contents($file, $json);

?>
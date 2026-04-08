<?php
    $host = "localhost";
    $username = "eduos";
    $password = "";
    $database = "my_eduos";

    $conn = new mysqli($host, $username, $password, $database);


    if ($conn->connect_error) {
        die("Errore di connessione al database: " . $conn->connect_error);
    }else{
        echo "grazie";
    }

    $conn->set_charset("utf8");
?>
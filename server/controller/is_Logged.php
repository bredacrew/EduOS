<?php
session_start();

if (isset($_SESSION['utente'])) {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error"]);
}
?>
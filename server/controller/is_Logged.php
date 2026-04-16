<?php
session_start();

if (isset($_SESSION['utente'])) {
    header("Location: ../../client/view/homepage.html?Login effettuato");
} else {
    header("Location: ../../client/view/login.html?msg=Login non effettuato");
}
exit;
?>
<!-- DA VEDERE -->
<?php

session_start();

$_SESSION = [];

session_destroy();

header("Location: ../../client/public/login?msg=Logout effettuato");
exit;
<!-- DA VEDERE! -->
<?php

require_once "auth_controller.php";

$action = $_POST['action'] ?? '';

if($action === "request"){

    $email = $_POST['email'];

    $token = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("UPDATE utenti SET reset_token=?, reset_expire=DATE_ADD(NOW(),INTERVAL 1 HOUR) WHERE email=?");

    $stmt->execute([$token,$email]);

    $link = "http://localhost/client/public/resetPassword?token=".$token;

    header("Location: ../../client/public/login?msg=Link reset creato: ".$link);
    exit;

}

if($action === "reset"){

    $token = $_POST['token'];
    $password = $_POST['password'];
    $confirm = $_POST['confirm_password'];

    if($password !== $confirm){

        header("Location: ../../client/public/login?error=Password non coincidono");
        exit;

    }

    $hash = password_hash($password,PASSWORD_ARGON2ID);

    $stmt = $pdo->prepare("UPDATE utenti SET password_hash=?,reset_token=NULL WHERE reset_token=?");

    $stmt->execute([$hash,$token]);

    header("Location: ../../client/public/login?msg=Password aggiornata");
    exit;

}
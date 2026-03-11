<!-- DA VEDERE! -->
<?php

require_once "auth_controller.php";

$nome = trim($_POST['nome'] ?? '');
$cognome = trim($_POST['cognome'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm = $_POST['confirm-password'] ?? '';

if(!$nome || !$cognome || !$email || !$password){

    header("Location: ../../client/public/register?error=Compila tutti i campi");
    exit;

}

if($password !== $confirm){

    header("Location: ../../client/public/register?error=Le password non coincidono");
    exit;

}

$hash = password_hash($password, PASSWORD_ARGON2ID);

$stmt = $pdo->prepare("INSERT INTO utenti(nome,cognome,email,password_hash,ruolo,attivo)
VALUES(?,?,?,?, 'studente',1)");

$stmt->execute([$nome,$cognome,$email,$hash]);

header("Location: ../../client/public/login?msg=Registrazione completata");
exit;
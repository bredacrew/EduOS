<?php
require_once "../../database/model/connessione.php";
/** @var mysqli $conn */
$nome = trim($_POST['nome'] ?? '');
$cognome = trim($_POST['cognome'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm = $_POST['confirm-password'] ?? '';
$data = trim($_POST['data_nascita'] ?? '');

if(!$nome || !$cognome || !$email || !$password){

    header("Location: ../../client/view/register?error=Compila tutti i campi");
    exit;

}
if($password !== $confirm){

    header("Location: ../../client/view/register?error=Le password non coincidono");
    exit;

}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO Utenti(nome,cognome,email,password,dataRegistrazione,IsAmministratore,DataNascita)
VALUES(?,?,?,?, NOW(),0,?)");

$stmt->bind_param("sssss",$nome,$cognome,$email,$hash,$data);
$stmt->execute();

header("Location: ../../client/view/login.html?msg=Registrazione completata");
exit;
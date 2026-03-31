<?php
require_once 'connessione.php';

$nome     = trim($_POST['nome'] ?? '');
$cognome  = trim($_POST['cognome'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm-password'] ?? '';

if (!$nome || !$cognome || !$email || !$password) {
    die("Tutti i campi sono obbligatori.");
}

if ($password !== $confirm) {
    die("Le password non coincidono.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Email non valida.");
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO utenti (Nome, Cognome, Email, Password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nome, $cognome, $email, $passwordHash);

if ($stmt->execute()) {
    header("Location: ../client/view/homepage.html");
    exit();
} else {
    die("Errore durante la registrazione: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>
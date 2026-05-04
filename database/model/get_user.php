<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorizzato']);
    exit;
}

require_once __DIR__ . '/connessione.php';
/** @var mysqli $conn */

$id   = (int) $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT Nome, Cognome, Email, DataNascita, AvatarUrl FROM Utenti WHERE IdUtente = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    http_response_code(404);
    echo json_encode(['error' => 'Utente non trovato']);
    exit;
}

echo json_encode([
    'Nome'        => $row['Nome'],
    'Cognome'     => $row['Cognome'],
    'Email'       => $row['Email'],
    'DataNascita' => $row['DataNascita'],
    'AvatarUrl'   => $row['AvatarUrl'] ?? null,
]);

<?php
require_once 'connessione.php';

session_start([
    'cookie_httponly' => true,
    'cookie_secure'   => true,
    'cookie_samesite' => 'Strict',
]);

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autenticato']);
    exit;
}

$id   = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT IdUtente, Nome, Cognome, Email, DataNascita, AvatarUrl FROM Utenti WHERE IdUtente = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Utente non trovato']);
    exit;
}

echo json_encode($user);
$stmt->close();
$conn->close();
?>
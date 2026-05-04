<?php
session_start();

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Non autorizzato']);
    exit;
}

require_once __DIR__ . '/connessione.php';
/** @var mysqli $conn */

header('Content-Type: application/json');

$userId = (int) $_SESSION['user_id'];
$input  = json_decode(file_get_contents('php://input'), true);
$idVoto = isset($input['id']) ? (int) $input['id'] : 0;

if ($idVoto <= 0) {
    echo json_encode(['error' => 'ID non valido']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM Voti WHERE IdVoto=? AND IdUtente=?");
$stmt->bind_param("ii", $idVoto, $userId);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    echo json_encode(['error' => 'Voto non trovato o non autorizzato']);
    exit;
}

echo json_encode(['ok' => true]);

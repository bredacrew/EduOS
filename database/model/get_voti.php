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

$id   = (int) $_SESSION['user_id'];
$stmt = $conn->prepare(
    "SELECT IdVoto, Materia, Voto, Tipo, DataVoto, Note
     FROM Voti
     WHERE IdUtente = ?
     ORDER BY DataVoto DESC, IdVoto DESC"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$voti = [];
while ($row = $result->fetch_assoc()) {
    $voti[] = [
        'id'      => (string) $row['IdVoto'],
        'materia' => $row['Materia'],
        'voto'    => (float)  $row['Voto'],
        'tipo'    => $row['Tipo'],
        'data'    => $row['DataVoto'] ?? '',
        'note'    => $row['Note']     ?? '',
    ];
}

header('Content-Type: application/json');
echo json_encode($voti);

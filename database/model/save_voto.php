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

$userId  = (int) $_SESSION['user_id'];
$input   = json_decode(file_get_contents('php://input'), true);

$idVoto  = isset($input['id'])      ? (int)   $input['id']      : null;
$materia = isset($input['materia']) ? trim($input['materia'])    : '';
$voto    = isset($input['voto'])    ? (float)  $input['voto']    : null;
$tipo    = isset($input['tipo'])    ? trim($input['tipo'])       : 'Scritto';
$data    = isset($input['data'])    ? trim($input['data'])       : null;
$note    = isset($input['note'])    ? trim($input['note'])       : '';

// Validazione
if ($materia === '') {
    echo json_encode(['error' => 'Materia obbligatoria']);
    exit;
}
if ($voto === null || $voto < 1 || $voto > 10) {
    echo json_encode(['error' => 'Voto non valido (1-10)']);
    exit;
}
$tipiValidi = ['Scritto', 'Orale', 'Pratico'];
if (!in_array($tipo, $tipiValidi, true)) {
    $tipo = 'Scritto';
}
$dataVal = ($data !== '' && $data !== null) ? $data : null;
$noteVal = $note !== '' ? $note : null;

if ($idVoto) {
    // UPDATE — verifica che il voto appartenga all'utente
    $stmt = $conn->prepare(
        "UPDATE Voti SET Materia=?, Voto=?, Tipo=?, DataVoto=?, Note=?
         WHERE IdVoto=? AND IdUtente=?"
    );
    $stmt->bind_param("sdsssii", $materia, $voto, $tipo, $dataVal, $noteVal, $idVoto, $userId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        echo json_encode(['error' => 'Voto non trovato o non autorizzato']);
        exit;
    }

    echo json_encode(['ok' => true, 'id' => $idVoto]);
} else {
    // INSERT
    $stmt = $conn->prepare(
        "INSERT INTO Voti (IdUtente, Materia, Voto, Tipo, DataVoto, Note)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("isdsss", $userId, $materia, $voto, $tipo, $dataVal, $noteVal);
    $stmt->execute();

    echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
}

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

$id      = (int) $_SESSION['user_id'];
$nome    = trim($_POST['nome']         ?? '');
$cognome = trim($_POST['cognome']      ?? '');
$email   = trim($_POST['email']        ?? '');
$data    = trim($_POST['data_nascita'] ?? '');

$fields = []; $params = []; $types = '';
if ($nome    !== '') { $fields[] = 'Nome = ?';        $params[] = $nome;    $types .= 's'; }
if ($cognome !== '') { $fields[] = 'Cognome = ?';     $params[] = $cognome; $types .= 's'; }
if ($email   !== '') { $fields[] = 'Email = ?';       $params[] = $email;   $types .= 's'; }
if ($data    !== '') { $fields[] = 'DataNascita = ?'; $params[] = $data;    $types .= 's'; }

// Gestione avatar
$avatarUrl = null;
if (!empty($_FILES['avatar']['tmp_name'])) {
    $ext      = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
    $allowed  = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (in_array($ext, $allowed)) {
        $filename = 'avatar_' . $id . '.' . $ext;
        $dest     = __DIR__ . '/../client/src/img/avatars/' . $filename;
        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $dest)) {
            $avatarUrl = '/client/src/img/avatars/' . $filename;
            $fields[]  = 'AvatarUrl = ?';
            $params[]  = $avatarUrl;
            $types    .= 's';
        }
    }
}

if (!empty($fields)) {
    $params[] = $id;
    $types   .= 'i';
    $sql  = "UPDATE Utenti SET " . implode(', ', $fields) . " WHERE IdUtente = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();
}

echo json_encode([
    'ok'        => true,
    'avatarUrl' => $avatarUrl,
]);
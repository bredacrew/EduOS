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

$id      = $_SESSION['user_id'];
$nome    = trim($_POST['nome']    ?? '');
$cognome = trim($_POST['cognome'] ?? '');
$email   = trim($_POST['email']   ?? '');
$data    = $_POST['data_nascita'] ?? '';

// Gestione upload avatar
$avatarUrl = null;
if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $ext       = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
    $allowed   = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array(strtolower($ext), $allowed)) {
        echo json_encode(['error' => 'Formato immagine non supportato']);
        exit;
    }
    $uploadDir = '../../client/src/img/avatars/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $filename  = 'avatar_' . $id . '.' . $ext;
    move_uploaded_file($_FILES['avatar']['tmp_name'], $uploadDir . $filename);
    $avatarUrl = '../src/img/avatars/' . $filename;
}

// Costruisci la query dinamicamente
$fields = [];
$types  = '';
$values = [];

if ($nome)     { $fields[] = 'Nome = ?';         $types .= 's'; $values[] = $nome; }
if ($cognome)  { $fields[] = 'Cognome = ?';      $types .= 's'; $values[] = $cognome; }
if ($email)    { $fields[] = 'Email = ?';        $types .= 's'; $values[] = $email; }
if ($data)     { $fields[] = 'DataNascita = ?';  $types .= 's'; $values[] = $data; }
if ($avatarUrl){ $fields[] = 'AvatarUrl = ?';    $types .= 's'; $values[] = $avatarUrl; }

if (empty($fields)) {
    echo json_encode(['error' => 'Nessun campo da aggiornare']);
    exit;
}

$values[] = $id;
$types   .= 'i';

$sql  = "UPDATE Utenti SET " . implode(', ', $fields) . " WHERE IdUtente = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$values);

if ($stmt->execute()) {
    // Aggiorna la sessione
    if ($nome)    $_SESSION['nome']    = $nome;
    if ($cognome) $_SESSION['cognome'] = $cognome;
    if ($email)   $_SESSION['email']   = $email;

    echo json_encode(['success' => true, 'avatarUrl' => $avatarUrl]);
} else {
    echo json_encode(['error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
<?php
// server/controller/UserController.php
// Espone un'API JSON per leggere (GET) e aggiornare (POST) i dati del profilo utente.
// Viene chiamato via fetch() da JavaScript lato client, NON tramite un form HTML diretto.

require_once __DIR__ . '/../model/UserModel.php';
require_once __DIR__ . '/../../database/connessione.php';
/** @var mysqli $conn */

// La sessione deve essere attiva (già avviata al momento del login)
session_start();

// Verifica che l'utente sia autenticato — se no, risponde con errore HTTP 401
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    http_response_code(401); // 401 = Non autorizzato
    echo json_encode(['error' => 'Non autorizzato']);
    exit;
}

// Tutte le risposte di questo controller sono in formato JSON
header('Content-Type: application/json');

// Istanzia il Model per accedere ai dati
$model = new UserModel($conn);

// Legge l'ID utente dalla sessione (impostata al momento del login in AuthController)
$id = $_SESSION['user_id'];

// --- Richiesta GET: restituisce i dati del profilo utente ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $user = $model->findById($id);

    // Se per qualche motivo l'utente non esiste più nel DB, risponde con errore
    if (!$user) {
        echo json_encode(['error' => 'Utente non trovato']);
        exit;
    }

    // Risponde con i dati del profilo in formato JSON
    echo json_encode($user);
    exit;
}

// --- Richiesta POST: aggiorna i dati del profilo ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Costruisce l'array dei campi da aggiornare
    // Solo i campi inviati e non vuoti vengono inclusi (aggiornamento parziale)
    $fields = [];
    if ($v = trim($_POST['nome']         ?? '')) $fields['Nome']        = $v;
    if ($v = trim($_POST['cognome']      ?? '')) $fields['Cognome']     = $v;
    if ($v = trim($_POST['email']        ?? '')) $fields['Email']       = $v;
    if ($v = trim($_POST['data_nascita'] ?? '')) $fields['DataNascita'] = $v;

    // --- Gestione upload avatar ---
    // Questa logica rimane nel controller perché riguarda la gestione della richiesta HTTP,
    // non l'accesso al database (che è responsabilità del Model)
    $avatarUrl = null;
    if (!empty($_FILES['avatar']['tmp_name'])) {

        // Estrae l'estensione del file caricato (es. "jpg", "png")
        $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);

        // Crea un nome file univoco legato all'ID utente (sovrascrive il precedente avatar)
        $filename = 'avatar_' . $id . '.' . $ext;

        // Percorso assoluto sul server dove salvare il file
        $dest = __DIR__ . '/../../client/src/img/avatars/' . $filename;

        // Sposta il file dalla cartella temporanea PHP alla destinazione finale
        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $dest)) {

            // URL pubblico dell'avatar (quello che il browser userà per mostrarlo)
            $avatarUrl = '/client/src/img/avatars/' . $filename;

            // Aggiunge l'URL dell'avatar ai campi da aggiornare nel DB
            $fields['AvatarUrl'] = $avatarUrl;
        }
    }

    // Delega l'aggiornamento al Model — il controller NON scrive query SQL
    $model->update($id, $fields);

    // Risponde con successo e l'eventuale URL del nuovo avatar
    // Il JavaScript lato client userà avatarUrl per aggiornare l'immagine nella pagina
    echo json_encode(['ok' => true, 'avatarUrl' => $avatarUrl]);
    exit;
}

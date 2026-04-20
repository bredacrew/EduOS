<?php
// server/controller/AuthController.php
// Gestisce SOLO il login.
// Responsabilità: validare i dati, verificare le credenziali, creare la sessione.
// NON esegue query SQL direttamente: delega al UserModel.

// Includiamo il Model che sa come interrogare la tabella Utenti
require_once '../model/UserModel.php';

// Includiamo la connessione al database (invariata)
require_once '../../database/connessione.php';
/** @var mysqli $conn */

// Avvia la sessione con opzioni di sicurezza
session_start([
    'cookie_httponly' => true,   // il cookie non è accessibile da JavaScript
    'cookie_secure'   => false,  // mettere true in produzione (richiede HTTPS)
    'cookie_samesite' => 'Strict', // protegge da attacchi CSRF
]);

// Funzione di utilità per reindirizzare con parametri GET opzionali
function redirect(string $location, array $params = []): never {
    // Costruisce la query string solo se ci sono parametri (es. ?error=...)
    $query = $params ? ('?' . http_build_query($params)) : '';
    header("Location: $location$query");
    exit; // Fondamentale: ferma l'esecuzione dopo il redirect
}

// Legge il tipo di azione inviata dal form (solo da POST per sicurezza)
$action = $_POST['action'] ?? '';

if ($action === 'login') {

    // Legge e pulisce i dati dal form
    $email    = trim($_POST['email']    ?? '');
    $password = $_POST['password']      ?? '';

    // Validazione base: i campi non devono essere vuoti
    if (empty($email) || empty($password)) {
        redirect('../../client/view/login.html', ['error' => 'Compila tutti i campi', 'email' => $email]);
    }

    // Istanzia il Model passandogli la connessione aperta
    $model = new UserModel($conn);

    // Chiede al Model di cercare l'utente — nessuna query SQL qui nel controller
    $user = $model->findByEmail($email);

    // Verifica che l'utente esista E che la password corrisponda all'hash nel DB
    if (!$user || !password_verify($password, $user['Password'])) {
        redirect('../../client/view/login.html', ['error' => 'Credenziali non valide', 'email' => $email]);
    }

    // Rigenera l'ID di sessione per prevenire session fixation attack
    session_regenerate_id(true);

    // Popola la sessione con i dati dell'utente autenticato
    $_SESSION = [
        'user_id'       => $user['IdUtente'],
        'email'         => $user['Email'],
        'nome'          => $user['Nome'],
        'cognome'       => $user['Cognome'],
        'admin'         => $user['IsAmministratore'],
        'logged_in'     => true,
        'last_activity' => time(), // timestamp usato per gestire timeout inattività
    ];

    // Login riuscito: manda l'utente alla homepage
    redirect('../../client/view/homepage.html');
}

// Se arriva una richiesta non riconosciuta, torna al login con errore
redirect('../../client/view/login.html', ['error' => 'Richiesta non valida']);

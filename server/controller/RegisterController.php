<?php
// server/controller/RegisterController.php
// Gestisce la registrazione di un nuovo utente.
// Responsabilità: validare i dati del form, hashare la password, delegare il salvataggio al Model.

// Includiamo il Model per l'accesso ai dati
require_once __DIR__ . '/../model/UserModel.php';

// Includiamo la connessione al database
require_once __DIR__ . '/../../database/connessione.php';
/** @var mysqli $conn */ //Da controllare

// Funzione di utilità per reindirizzare con parametri GET opzionali
function redirect(string $location, array $params = []): never {
    $query = $params ? ('?' . http_build_query($params)) : '';
    header("Location: $location$query");
    exit;
}

// Legge e pulisce i dati inviati dal form di registrazione
$nome     = trim($_POST['nome']            ?? '');
$cognome  = trim($_POST['cognome']         ?? '');
$email    = trim($_POST['email']           ?? '');
$password = $_POST['password']             ?? '';
$confirm  = $_POST['confirm-password']     ?? '';
$data     = trim($_POST['data_nascita']    ?? '');

// Controllo che i campi obbligatori siano compilati
if (!$nome || !$cognome || !$email || !$password) {
    redirect('../../client/view/register.html', ['error' => 'Compila tutti i campi']);
}

// Verifica che i due campi password coincidano
if ($password !== $confirm) {
    redirect('../../client/view/register.html', ['error' => 'Le password non coincidono']);
}

// Hasha la password con bcrypt — mai salvare password in chiaro nel DB
$hash = password_hash($password, PASSWORD_DEFAULT);

// Delega il salvataggio al Model — il controller NON scrive query SQL
$model = new UserModel($conn);
$model->create($nome, $cognome, $email, $hash, $data);

// Registrazione riuscita: rimanda al login con messaggio di conferma
redirect('../../client/view/login.html', ['msg' => 'Registrazione completata']);

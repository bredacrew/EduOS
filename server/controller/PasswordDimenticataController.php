<?php
// server/controller/PasswordDimenticataController.php
// Gestisce il flusso "password dimenticata" in due fasi:
//
//   action=request  → l'utente inserisce la sua email; il controller genera un
//                     token sicuro, lo salva nel DB e simula l'invio di una email.
//                     (In produzione si userebbe PHPMailer / SMTP reale.)
//
//   action=reset    → l'utente arriva dal link con il token, inserisce la nuova
//                     password; il controller verifica il token e aggiorna la password.
//
// SCELTA MVC: nessuna query SQL è scritta qui. Tutto ciò che riguarda il DB
// è delegato ai metodi di UserModel (saveResetToken, resetPassword).

require_once __DIR__ . '/../model/UserModel.php';
require_once __DIR__ . '/../../database/connessione.php';
/** @var mysqli $conn */

// ---------------------------------------------------------------------------
// Funzione helper per redirect con parametri GET opzionali.
// Dichiarata qui (e non nel file globale) perché questo controller
// è l'unico ad usarla in questo contesto.
// ---------------------------------------------------------------------------
function redirect(string $location, array $params = []): never {
    $query = $params ? ('?' . http_build_query($params)) : '';
    header("Location: $location$query");
    exit; // exit immediato dopo header() è fondamentale per bloccare l'output
}

// Legge l'azione richiesta (solo da POST per sicurezza)
$action = $_POST['action'] ?? '';

// ===========================================================================
// FASE 1 — Richiesta link di reset
// L'utente ha inserito la sua email nel form di PasswordDimenticata.html
// ===========================================================================
if ($action === 'request') {

    // Sanifica l'input: trim() rimuove spazi iniziali/finali
    $email = trim($_POST['email'] ?? '');

    // Validazione base
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        redirect('../../client/view/PasswordDimenticata.html', ['error' => 'Inserisci un\'indirizzo email valido']);
    }

    // Genera un token crittograficamente sicuro (64 caratteri esadecimali)
    // random_bytes() usa la sorgente di entropia del sistema operativo
    $token = bin2hex(random_bytes(32));

    // Salva il token nel DB tramite il Model.
    // Se l'email non esiste, saveResetToken() restituisce false MA non lo diciamo
    // all'utente per non rivelare quali email sono registrate (security by design).
    $model = new UserModel($conn);
    $model->saveResetToken($email, $token);

    // -----------------------------------------------------------------------
    // In un'applicazione reale qui si invierebbe una email all'utente con
    // il link: .../resetPassword.php?token=<token>
    // Esempio con PHPMailer:
    //   $mailer->send($email, 'Reset EduOS', "Clicca: https://tuodominio.it/reset?token=$token");
    //
    // Per ora viene simulato: il link è visibile sulla pagina di conferma.
    // -----------------------------------------------------------------------
    $resetLink = "../../client/view/resetPassword.php?token=" . urlencode($token);

    // Redireziona a una pagina di conferma neutra (non rivela se l'email esiste)
    redirect('../../client/view/PasswordDimenticata.html', [
        'msg'  => 'Se la tua email è registrata, riceverai un link di reset.',
        'link' => $resetLink // solo per demo/sviluppo, da rimuovere in produzione
    ]);
}

// ===========================================================================
// FASE 2 — Impostazione della nuova password
// L'utente ha cliccato il link ricevuto via email e ha compilato il form
// di resetPassword.php con la nuova password
// ===========================================================================
if ($action === 'reset') {

    $token   = $_POST['token']            ?? '';
    $password = $_POST['password']        ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';

    // Validazione: token presente
    if (empty($token)) {
        redirect('../../client/view/PasswordDimenticata.html', ['error' => 'Token non valido']);
    }

    // Validazione: le due password coincidono
    if ($password !== $confirm) {
        redirect('../../client/view/resetPassword.php',
            ['token' => $token, 'error' => 'Le password non coincidono']);
    }

    // Validazione: lunghezza minima
    if (strlen($password) < 8) {
        redirect('../../client/view/resetPassword.php',
            ['token' => $token, 'error' => 'La password deve avere almeno 8 caratteri']);
    }

    // Hasha la nuova password con bcrypt prima di salvarla
    $hash  = password_hash($password, PASSWORD_DEFAULT);
    $model = new UserModel($conn);

    // Il Model aggiorna la password e invalida il token in un'unica query atomica
    $ok = $model->resetPassword($token, $hash);

    if (!$ok) {
        // Il token era scaduto o già usato
        redirect('../../client/view/PasswordDimenticata.html',
            ['error' => 'Il link di reset è scaduto o non valido. Richiedi un nuovo link.']);
    }

    // Password aggiornata con successo → rimanda al login
    redirect('../../client/view/login.html', ['msg' => 'Password aggiornata con successo']);
}

// Richiesta non riconosciuta → torna alla pagina di recupero
redirect('../../client/view/PasswordDimenticata.html', ['error' => 'Richiesta non valida']);

<?php
// auth_controller.php
require_once "../../database/connessione.php";

session_start([
        'cookie_httponly' => true,
        'cookie_secure'   => true,       // solo https in produzione
        'cookie_samesite' => 'Strict',
]);

// =============================================
// CONFIGURAZIONE DATABASE
// =============================================
define('DB_HOST',     'localhost');
define('DB_NAME',     'my_eduos');
define('DB_USER',     'eduos');
define('DB_PASS',     '');   // ← cambia
define('DB_CHARSET',  'utf8mb4_0900_ai_ci');

try {
    $pdo = new PDO(
            "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
            DB_USER,
            DB_PASS,
            [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
            ]
    );
} catch (PDOException $e) {
    die("Errore connessione DB: " . $e->getMessage());
}

// =============================================
// FUNZIONI DI UTILITÀ
// =============================================
function redirect(string $location, array $params = []): never {
    $query = $params ? ('?' . http_build_query($params)) : '';
    header("Location: $location$query");
    exit;
}

function hash_password(string $plain): string {
    return password_hash($plain, PASSWORD_ARGON2ID);
    // oppure PASSWORD_DEFAULT (sceglie l'algoritmo migliore automaticamente)
}

// =============================================
// LOGICA PRINCIPALE
// =============================================
$action = $_POST['action'] ?? '';

if ($action === 'login') {
    $email    = trim($_POST['email']    ?? '');
    $password = $_POST['password']      ?? '';

    if (empty($email) || empty($password)) {
        redirect('../../client/public/login', ['error' => 'Compila tutti i campi']);
    }

    // Cerchiamo l'utente
    $stmt = $conn->prepare("SELECT IdUtente, Nome, Cognome, Email, Password, IsAmministratore 
                                FROM Utenti 
                                WHERE email = ?
                                LIMIT 1");
    $stmt = bind_param("s",$email);
    $stmt->execute();

    $result->get_result();
    $user = $result->fetch_assoc();

    if (!$user || !password_verify($password, $user['password'])) {
        // Per sicurezza: stesso messaggio anche se utente non esiste
        redirect('../../client/public/login', ['error' => 'Credenziali non valide']);
    }

    // =====================================
    // LOGIN RIUSCITO
    // =====================================

    // Rigeneriamo l'ID sessione (protezione session fixation)
    session_regenerate_id(true);

    // Dati da mettere in sessione
    $_SESSION = [
            'user_id'    => $user['idUtente'],
            'email'      => $user['email'],
            'nome'       => $user['nome'],
            'cognome'      => $user['cognome'],
            'admin'      => $user['isAmministratore'],
            'logged_in'  => true,
            'last_activity' => time(),
    ];

    redirect('../../client/public/dashboard');
}

// =============================================
// LOGOUT (opzionale – puoi chiamare da altro file)
// =============================================
if ($action === 'logout') {
    $_SESSION = [];
    $params = session_get_cookie_params();
    setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
    );
    session_destroy();
    redirect('../../client/public/login', ['msg' => 'Logout effettuato']);
}

// Azione non riconosciuta
redirect('../../client/public/login', ['error' => 'Richiesta non valida']);
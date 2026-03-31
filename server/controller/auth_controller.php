<?php
// auth_controller.php
require_once "../../database/connessione.php";

session_start([
    'cookie_httponly' => true,
    'cookie_secure'   => true,
    'cookie_samesite' => 'Strict',
]);

function redirect(string $location, array $params = []): never {
    $query = $params ? ('?' . http_build_query($params)) : '';
    header("Location: $location$query");
    exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'login') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password']   ?? '';

    if (empty($email) || empty($password)) {
        redirect('../../client/view/login.html', ['error' => 'Compila tutti i campi', 'email' => $email]);
    }

    $stmt = $conn->prepare("SELECT IdUtente, Nome, Cognome, Email, Password, IsAmministratore 
                            FROM Utenti 
                            WHERE Email = ?
                            LIMIT 1");

    if ($stmt === false) {
        redirect('../../client/view/login.html', ['error' => 'Errore interno']);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user   = $result->fetch_assoc();

    if (!$user || !password_verify($password, $user['Password'])) {
        redirect('../../client/view/login.html', ['error' => 'Credenziali non valide', 'email' => $email]);
    }

    session_regenerate_id(true);

    $_SESSION = [
        'user_id'       => $user['IdUtente'],
        'email'         => $user['Email'],
        'nome'          => $user['Nome'],
        'cognome'       => $user['Cognome'],
        'admin'         => $user['IsAmministratore'],
        'logged_in'     => true,
        'last_activity' => time(),
    ];

    redirect('../../client/view/homepage.html');
}

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
    redirect('../../client/view/login.html', ['msg' => 'Logout effettuato']);
}

redirect('../../client/view/login.html', ['error' => 'Richiesta non valida']);
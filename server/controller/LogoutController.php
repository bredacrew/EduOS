<?php
// server/controller/LogoutController.php
// Gestisce SOLO il logout.
// Responsabilità: distruggere la sessione e il suo cookie in modo sicuro,
// poi reindirizzare al login.

// Avvia la sessione (necessario per poterla leggere e poi distruggere)
session_start();

// Svuota completamente l'array di sessione
// (rimuove tutti i dati: user_id, logged_in, nome, ecc.)
$_SESSION = [];

// Recupera i parametri con cui era stato creato il cookie di sessione
// (path, domain, secure, httponly) per poterlo eliminare correttamente
$params = session_get_cookie_params();

// Elimina il cookie di sessione dal browser dell'utente
// impostando una data di scadenza nel passato → il browser lo cancella subito
setcookie(
        session_name(),      // nome del cookie (di solito "PHPSESSID")
        '',                  // valore vuoto
        time() - 42000,      // timestamp nel passato → scaduto
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
);

// Distrugge definitivamente la sessione lato server
session_destroy();

// Reindirizza al login con un messaggio di conferma visibile all'utente
header("Location: ../../client/view/login.html?msg=Logout effettuato");
exit;

<?php
// server/model/UserModel.php
// Model per la tabella Utenti.
//
// RESPONSABILITÀ: leggere e scrivere dati nel database.
// NON deve sapere nulla di: sessioni, $_POST, header(), JSON, email, token casuali.
// Tutto ciò che riguarda la logica di business appartiene al Controller.

class UserModel {

    // Connessione mysqli iniettata dal costruttore (Dependency Injection)
    private mysqli $conn;

    /**
     * Il costruttore riceve la connessione già aperta dal controller.
     * SCELTA: la connessione viene passata "dall'esterno" anziché essere creata qui,
     * così il Model rimane testabile in isolamento (si può passare un mock).
     */
    public function __construct(mysqli $conn) {
        $this->conn = $conn;
    }

    // =========================================================================
    // LETTURA
    // =========================================================================

    /**
     * Cerca un utente per email.
     * Restituisce un array associativo con tutti i campi, oppure null se non esiste.
     * Usato da AuthController per verificare le credenziali al login.
     */
    public function findByEmail(string $email): ?array {
        // prepare() previene SQL injection separando la query dai dati
        $stmt = $this->conn->prepare(
            "SELECT IdUtente, Nome, Cognome, Email, Password, IsAmministratore
             FROM Utenti
             WHERE Email = ?
             LIMIT 1"
        );
        $stmt->bind_param("s", $email); // "s" = stringa
        $stmt->execute();

        $row = $stmt->get_result()->fetch_assoc();
        return $row ?: null; // restituisce null invece di false per chiarezza
    }

    /**
     * Cerca un utente per ID numerico.
     * Restituisce solo i campi pubblici (senza la password).
     * Usato da UserController per mostrare il profilo.
     */
    public function findById(int $id): ?array {
        $stmt = $this->conn->prepare(
            "SELECT Nome, Cognome, Email, DataNascita, AvatarUrl
             FROM Utenti
             WHERE IdUtente = ?
             LIMIT 1"
        );
        $stmt->bind_param("i", $id); // "i" = intero
        $stmt->execute();

        $row = $stmt->get_result()->fetch_assoc();
        return $row ?: null;
    }

    /**
     * Cerca un utente dal token di reset password.
     * Verifica anche che il token non sia scaduto (reset_expire > NOW()).
     * Restituisce i dati dell'utente se il token è valido, null altrimenti.
     */
    public function findByResetToken(string $token): ?array {
        $stmt = $this->conn->prepare(
            "SELECT IdUtente, Email
             FROM Utenti
             WHERE reset_token = ?
               AND reset_expire > NOW()
             LIMIT 1"
        );
        $stmt->bind_param("s", $token);
        $stmt->execute();

        $row = $stmt->get_result()->fetch_assoc();
        return $row ?: null;
    }

    // =========================================================================
    // SCRITTURA
    // =========================================================================

    /**
     * Inserisce un nuovo utente nel database.
     * Riceve dati già validati e password già hashata (la responsabilità
     * dell'hashing appartiene al Controller, non al Model).
     * Restituisce l'ID auto-incrementato del nuovo utente.
     */
    public function create(
        string $nome,
        string $cognome,
        string $email,
        string $passwordHash,
        string $dataNascita
    ): int {
        $stmt = $this->conn->prepare(
            "INSERT INTO Utenti(Nome, Cognome, Email, Password, DataRegistrazione, IsAmministratore, DataNascita)
             VALUES(?, ?, ?, ?, NOW(), 0, ?)"
        );
        // "sssss" = cinque parametri stringa nell'ordine dei "?"
        $stmt->bind_param("sssss", $nome, $cognome, $email, $passwordHash, $dataNascita);
        $stmt->execute();

        return $this->conn->insert_id; // ID dell'utente appena creato
    }

    /**
     * Aggiorna solo i campi specificati in $fields.
     * $fields è un array associativo, es: ['Nome' => 'Mario', 'Email' => 'x@y.it']
     * Questo approccio permette aggiornamenti parziali senza sovrascrivere campi non inviati.
     * Restituisce true se almeno una riga è stata modificata.
     */
    public function update(int $id, array $fields): bool {
        // Protezione: non fare nulla se non ci sono campi da aggiornare
        if (empty($fields)) return false;

        // Costruisce dinamicamente "Nome = ?, Email = ?, ..." dalla lista di chiavi
        $setClauses = array_map(fn($col) => "$col = ?", array_keys($fields));

        // I valori nell'ordine dei "?", con l'ID utente in fondo (per il WHERE)
        $values   = array_values($fields);
        $values[] = $id;

        // "s" per ogni campo stringa + "i" per l'ID intero in fondo
        $types = str_repeat('s', count($fields)) . 'i';

        $sql  = "UPDATE Utenti SET " . implode(', ', $setClauses) . " WHERE IdUtente = ?";
        $stmt = $this->conn->prepare($sql);

        // "..." (spread operator) spacchetta l'array come argomenti separati
        $stmt->bind_param($types, ...$values);
        return $stmt->execute();
    }

    /**
     * Salva un token di reset password per l'utente con la email indicata.
     * Il token ha una scadenza di 1 ora (gestita direttamente in SQL con DATE_ADD).
     *
     * SCELTA: la scadenza è gestita nel DB (non in PHP) per evitare problemi
     * di fuso orario tra il server PHP e il server database.
     *
     * Restituisce true se un utente con quella email esiste ed è stato aggiornato.
     */
    public function saveResetToken(string $email, string $token): bool {
        $stmt = $this->conn->prepare(
            "UPDATE Utenti
             SET reset_token  = ?,
                 reset_expire = DATE_ADD(NOW(), INTERVAL 1 HOUR)
             WHERE Email = ?"
        );
        $stmt->bind_param("ss", $token, $email);
        $stmt->execute();

        // affected_rows > 0 significa che l'email esisteva nella tabella
        return $stmt->affected_rows > 0;
    }

    /**
     * Aggiorna la password dell'utente che possiede il token specificato,
     * poi invalida il token azzerandolo per impedirne il riuso.
     *
     * Restituisce true se l'aggiornamento è andato a buon fine.
     */
    public function resetPassword(string $token, string $newHash): bool {
        $stmt = $this->conn->prepare(
            "UPDATE Utenti
             SET Password     = ?,
                 reset_token  = NULL,
                 reset_expire  = NULL
             WHERE reset_token = ?
               AND reset_expire > NOW()"
        );
        $stmt->bind_param("ss", $newHash, $token);
        $stmt->execute();

        // Se nessuna riga è stata aggiornata, il token era invalido o scaduto
        return $stmt->affected_rows > 0;
    }
}

-- Tabella voti collegata agli utenti
-- Esegui SHOW TABLES; per verificare il nome esatto della tabella utenti
-- e aggiorna la FOREIGN KEY di conseguenza (o rimuovila se non necessaria)
CREATE TABLE IF NOT EXISTS Voti (
    IdVoto      INT AUTO_INCREMENT PRIMARY KEY,
    IdUtente    INT          NOT NULL,
    Materia     VARCHAR(100) NOT NULL,
    Voto        DECIMAL(4,2) NOT NULL,
    Tipo        ENUM('Scritto','Orale','Pratico') NOT NULL DEFAULT 'Scritto',
    DataVoto    DATE         NULL,
    Note        TEXT         NULL,
    CreatedAt   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_utente (IdUtente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/**
 * Verifica se l'utente è loggato.
 * Reindirizza a login.html se la sessione è scaduta o assente.
 *
 * Utilizzo: includi questo script nelle pagine protette.
 * Aggiunge automaticamente credentials: 'include' per inviare il cookie di sessione.
 */
(async function () {
    try {
        const res = await fetch('../../database/model/get_user.php', {
            credentials: 'include'
        });

        if (res.status === 401) {
            window.location.href = 'login.html';
        }
        // Se 200: utente loggato, non fare nulla
    } catch (err) {
        console.error('Errore verifica sessione:', err);
    }
})();
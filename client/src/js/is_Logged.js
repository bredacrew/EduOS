(async function () {
    try {
        const res = await fetch('../../../database/model/get_user.php');

        if (res.status === 401) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.error('Errore caricamento utente:', err);
    }
})();

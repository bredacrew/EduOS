(async function () {
    try {
        const res = await fetch('../../../database/model/get_user.php');

        if (res.status === 401) {
            window.location.href = '../../client/view/login.html?msg=Login non effettuato';
        } else {
            window.location.href = '../../client/view/homepage.html?Login effettuato';
        }
    } catch (err) {
        console.error('Errore caricamento utente:', err);
    }
})();
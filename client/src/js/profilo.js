(function () {
    // ── Tendina profilo (freccia in alto a destra) ──
    const trigger  = document.getElementById('chevron-icon');
    const dropdown = document.getElementById('profile-dropdown');
    const chevron  = document.getElementById('chevron-icon');

    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        chevron.classList.toggle('rotated', isOpen);
    });

    document.addEventListener('click', function () {
        dropdown.classList.remove('open');
        chevron.classList.remove('rotated');
    });

    // ── Logout dalla tendina ──
    // Quando sarà collegato al DB, qui chiamerai la funzione di logout
    const dropdownLogout = document.querySelector('.dropdown-logout');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUtente();
        });
    }

     function logoutUtente() {
        // TODO: aggiungi qui la chiamata al DB per invalidare la sessione
        // es: await supabase.auth.signOut()
        window.location.href = 'client/login.php';
    }
})();

    function logoutUtente(){
    // qui potrai mettere supabase.auth.signOut()
    localStorage.removeItem("utenteLoggato");

    window.location.href = "client/login.php";
}

    function loginRedirect(){
    window.location.href = "client/login.php";
}

    function controllaLogin(){

    const utente = localStorage.getItem("utenteLoggato");

    const btn = document.getElementById("auth-button");
    const dropdown = document.getElementById("auth-dropdown");

    if(utente){

    btn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
    dropdown.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Logout';

    btn.onclick = logoutUtente;
    dropdown.onclick = logoutUtente;

}else{

    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i>';
    dropdown.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';

    btn.onclick = loginRedirect;
    dropdown.onclick = loginRedirect;

}

}

    // controlla quando carica la pagina
    controllaLogin();

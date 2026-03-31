(function () {

    // ── Carica dati utente dalla sessione ──
    async function caricaUtente() {
        try {
            const res  = await fetch('../../database/get_user.php');
            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const user = await res.json();
            if (user.error) return;

            // Greeting
            const ora = new Date().getHours();
            let saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
            const greetingEl = document.querySelector('.greeting-text h1');
            if (greetingEl) greetingEl.textContent = saluto + ', ' + (user.Nome || '');

            // Profile card
            const profileNome    = document.getElementById('profileNome');
            const profileCognome = document.getElementById('profileCognome');
            const profileData    = document.getElementById('profileData');
            if (profileNome)    profileNome.textContent    = (user.Nome    || '').toUpperCase();
            if (profileCognome) profileCognome.textContent = (user.Cognome || '').toUpperCase();
            if (profileData && user.DataNascita) {
                const parti = user.DataNascita.split('-');
                profileData.textContent = parti[2] + '/' + parti[1] + '/' + parti[0];
            }

            // Settings panel
            const avatarStrong = document.querySelector('.settings-avatar-info strong');
            if (avatarStrong) avatarStrong.textContent = (user.Nome || '') + ' ' + (user.Cognome || '');

            // Pre-compila i campi del form impostazioni
            const inputNome    = document.querySelector('#stab-profilo input[placeholder="Inserisci nome"]');
            const inputCognome = document.querySelector('#stab-profilo input[placeholder="Inserisci cognome"]');
            const inputEmail   = document.querySelector('#stab-profilo input[placeholder="email@esempio.com"]');
            const inputData    = document.getElementById('inputDataNascita');
            if (inputNome)    inputNome.value    = user.Nome    || '';
            if (inputCognome) inputCognome.value = user.Cognome || '';
            if (inputEmail)   inputEmail.value   = user.Email   || '';
            if (inputData)    inputData.value    = user.DataNascita || '';

            // Avatar
            if (user.AvatarUrl) {
                impostaAvatar(user.AvatarUrl);
            }

        } catch (err) {
            console.error('Errore caricamento utente:', err);
        }
    }

    function impostaAvatar(src) {
        const imgStyle     = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';
        const avatarLg     = document.querySelector('.avatar-lg');
        const avatarRingEl = document.querySelector('.avatar-ring');
        const avatarImg    = document.getElementById('settingsAvatarImg');
        const avatarIcon   = document.getElementById('settingsAvatarIcon');

        if (avatarLg)     avatarLg.innerHTML     = '<img src="' + src + '" style="' + imgStyle + '" />';
        if (avatarRingEl) avatarRingEl.innerHTML = '<img src="' + src + '" style="' + imgStyle + '" />';
        if (avatarImg)  { avatarImg.src = src; avatarImg.style.display = 'block'; }
        if (avatarIcon)   avatarIcon.style.display = 'none';
    }

    caricaUtente();

    // ── Overlay impostazioni ──
    const avatarRing = document.querySelector('.avatar-ring');
    if (avatarRing) {
        avatarRing.addEventListener('click', function () {
            document.getElementById('settingsOverlay').classList.add('open');
        });
        avatarRing.style.cursor = 'pointer';
    }

    document.getElementById('settingsCloseBtn').addEventListener('click', function () {
        document.getElementById('settingsOverlay').classList.remove('open');
    });

    document.getElementById('settingsOverlay').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('open');
    });

    // ── Carica immagine profilo (anteprima) ──
    const uploadBtn  = document.getElementById('uploadAvatarBtn');
    const fileInput  = document.getElementById('avatarFileInput');
    const avatarImg  = document.getElementById('settingsAvatarImg');
    const avatarIcon = document.getElementById('settingsAvatarIcon');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarImg.src = e.target.result;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    // ── Salva modifiche profilo ──
    const saveBtn = document.querySelector('.settings-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            const nome    = document.querySelector('#stab-profilo input[placeholder="Inserisci nome"]').value.trim();
            const cognome = document.querySelector('#stab-profilo input[placeholder="Inserisci cognome"]').value.trim();
            const email   = document.querySelector('#stab-profilo input[placeholder="email@esempio.com"]').value.trim();
            const data    = document.getElementById('inputDataNascita')?.value || '';
            const file    = fileInput?.files[0];

            const formData = new FormData();
            if (nome)    formData.append('nome',         nome);
            if (cognome) formData.append('cognome',      cognome);
            if (email)   formData.append('email',        email);
            if (data)    formData.append('data_nascita', data);
            if (file)    formData.append('avatar',       file);

            try {
                const res  = await fetch('../../database/save_user.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();

                if (result.error) {
                    alert('Errore: ' + result.error);
                    return;
                }

                // Aggiorna UI
                const h3    = document.getElementById('profileNome');
                const p     = document.getElementById('profileCognome');
                const dataEl = document.getElementById('profileData');

                if (nome && h3)    h3.textContent = nome.toUpperCase();
                if (cognome && p)  p.textContent  = cognome.toUpperCase();
                if (data && dataEl) {
                    const parti = data.split('-');
                    dataEl.textContent = parti[2] + '/' + parti[1] + '/' + parti[0];
                }

                const greetingEl = document.querySelector('.greeting-text h1');
                if (nome && greetingEl) {
                    const ora = new Date().getHours();
                    let saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
                    greetingEl.textContent = saluto + ', ' + nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
                }

                if (result.avatarUrl) impostaAvatar(result.avatarUrl);

                document.getElementById('settingsOverlay').classList.remove('open');

            } catch (err) {
                alert('Errore di connessione al server.');
                console.error(err);
            }
        });
    }

    // ── Logout ──
    function logoutUtente() {
        fetch('../../server/controller/auth_controller.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=logout'
        }).then(() => {
            window.location.href = 'login.html';
        });
    }

    const authBtn = document.getElementById('auth-button');
    if (authBtn) {
        authBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUtente();
        });
    }

})();

function settingsShowTab(name, el) {
    document.querySelectorAll('.settings-tab').forEach(function (t) {
        t.style.display = 'none';
    });
    document.querySelectorAll('.settings-nav-item').forEach(function (n) {
        n.classList.remove('active');
    });
    document.getElementById('stab-' + name).style.display = 'block';
    el.classList.add('active');
}

// ── Dropdown profilo topbar ──
const profileTrigger  = document.getElementById('profile-dropdown-trigger');
const profileDropdown = document.getElementById('topbar-profile-dropdown');

profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    profileTrigger.classList.toggle('open');
    profileDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    profileTrigger.classList.remove('open');
    profileDropdown.classList.remove('open');
});

document.getElementById('openSettingsFromDropdown').addEventListener('click', () => {
    document.getElementById('settingsOverlay').classList.add('open');
    profileDropdown.classList.remove('open');
    profileTrigger.classList.remove('open');
});

// ── Dropdown statistiche ──
const statsRangeBtn  = document.getElementById('stats-range-btn');
const statsDropdown  = document.getElementById('stats-dropdown');
const statsViewLabel = document.getElementById('stats-view-label');

statsRangeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    statsRangeBtn.classList.toggle('open');
    statsDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    statsRangeBtn.classList.remove('open');
    statsDropdown.classList.remove('open');
});

document.querySelectorAll('.stats-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.stats-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        statsViewLabel.textContent = item.textContent.trim().toUpperCase();
        statsRangeBtn.classList.remove('open');
        statsDropdown.classList.remove('open');
    });
});
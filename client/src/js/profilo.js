(function () {

    // ── Overlay impostazioni: apre cliccando avatar-ring in alto a destra ──
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

    // ── Carica immagine profilo ──
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

            // ── COLLEGAMENTO DB: upload immagine
            // Decommentare questo blocco quando colleghiamo il database.
            //
            // async function uploadAvatar(file) {
            //     const utenteId = supabase.auth.user().id;
            //     const estensione = file.name.split('.').pop();
            //     const percorso = utenteId + '/avatar.' + estensione;
            //
            //     const { data, error } = await supabase.storage
            //         .from('avatars')
            //         .upload(percorso, file, { upsert: true });
            //
            //     if (error) {
            //         console.error('Errore upload avatar:', error.message);
            //         return;
            //     }
            //
            //     const { data: urlData } = supabase.storage
            //         .from('avatars')
            //         .getPublicUrl(percorso);
            //
            //     const urlPubblico = urlData.publicUrl;
            //
            //     const { error: dbError } = await supabase
            //         .from('utenti')
            //         .update({ avatar_url: urlPubblico })
            //         .eq('id', utenteId);
            //
            //     if (dbError) {
            //         console.error('Errore salvataggio URL avatar:', dbError.message);
            //     }
            // }
            //
            // uploadAvatar(file);
        });
    }

    // ── Salva modifiche profilo ──
    const saveBtn = document.querySelector('.settings-save-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            const nome    = document.querySelector('#stab-profilo input[placeholder="Inserisci nome"]').value.trim();
            const cognome = document.querySelector('#stab-profilo input[placeholder="Inserisci cognome"]').value.trim();
            const email   = document.querySelector('#stab-profilo input[placeholder="email@esempio.com"]').value.trim();
            const data    = document.getElementById('inputDataNascita') ? document.getElementById('inputDataNascita').value : '';

            // Aggiorna solo i campi compilati
            const h3           = document.getElementById('profileNome');
            const p            = document.getElementById('profileCognome');
            const dataEl       = document.getElementById('profileData');

            if (nome && h3)    h3.textContent = nome.toUpperCase();
            if (cognome && p)  p.textContent  = cognome.toUpperCase();

            // Formatta la data in italiano es. 01/01/1990
            if (data && dataEl) {
                const parti = data.split('-');
                dataEl.textContent = parti[2] + '/' + parti[1] + '/' + parti[0];
            }

            // Aggiorna il nome nel greeting "Buongiorno, Nome"
            if (nome) {
                const greetingEl = document.querySelector('.greeting-text h1');
                if (greetingEl) {
                    greetingEl.textContent = 'Buongiorno, ' + nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
                }
            }

            // Aggiorna il nome nell'avatar info del pannello
            const avatarStrong = document.querySelector('.settings-avatar-info strong');
            if (avatarStrong) {
                const nomeAttuale    = nome    ? nome    : (h3 ? h3.textContent : '');
                const cognomeAttuale = cognome ? cognome : (p  ? p.textContent  : '');
                avatarStrong.textContent = nomeAttuale + ' ' + cognomeAttuale;
            }

            // Aggiorna l'avatar nella profile-card e in alto a destra (avatar-ring)
            const avatarImgSrc = document.getElementById('settingsAvatarImg');
            const avatarLg     = document.querySelector('.avatar-lg');
            const avatarRingEl = document.querySelector('.avatar-ring');

            if (avatarImgSrc && avatarImgSrc.style.display === 'block' && avatarImgSrc.src) {
                const imgStyle = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';

                if (avatarLg)     avatarLg.innerHTML     = '<img src="' + avatarImgSrc.src + '" style="' + imgStyle + '" />';
                if (avatarRingEl) avatarRingEl.innerHTML = '<img src="' + avatarImgSrc.src + '" style="' + imgStyle + '" />';
            }

            // ── COLLEGAMENTO DB: salva tutti i campi
            // Decommentare questo blocco quando colleghiamo il database.
            //
            // async function salvaProfilo() {
            //     const utenteId = supabase.auth.user().id;
            //
            //     const aggiornamenti = {};
            //     if (nome)    aggiornamenti.nome          = nome;
            //     if (cognome) aggiornamenti.cognome       = cognome;
            //     if (email)   aggiornamenti.email         = email;
            //     if (data)    aggiornamenti.data_nascita  = data;
            //
            //     const { error } = await supabase
            //         .from('utenti')
            //         .update(aggiornamenti)
            //         .eq('id', utenteId);
            //
            //     if (error) {
            //         console.error('Errore salvataggio profilo:', error.message);
            //         alert('Errore durante il salvataggio. Riprova.');
            //         return;
            //     }
            //
            //     if (email) {
            //         const { error: authError } = await supabase.auth.updateUser({ email: email });
            //         if (authError) console.error('Errore aggiornamento email auth:', authError.message);
            //     }
            // }
            //
            // salvaProfilo();

            // Chiudi il pannello
            document.getElementById('settingsOverlay').classList.remove('open');
        });
    }

    // ── Logout dalla tendina ──
    const dropdownLogout = document.querySelector('.dropdown-logout');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUtente();
        });
    }

    function logoutUtente() {
        // TODO: sostituisci con → await supabase.auth.signOut()
        window.location.href = 'client/public/login.php';
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

function logoutUtente() {
    localStorage.removeItem("utenteLoggato");
    window.location.href = "client/public/login.php";
}

function loginRedirect() {
    window.location.href = "client/public/login.php";
}

function controllaLogin() {
    const btn = document.getElementById("auth-button");
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i><span class="nav-label">Logout</span>';
        btn.onclick = logoutUtente;
    }
}

// Dropdown profilo topbar
const profileTrigger = document.getElementById('profile-dropdown-trigger');
const profileDropdown = document.getElementById('topbar-profile-dropdown');
const topbarChevron = document.getElementById('topbar-chevron-icon');

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
controllaLogin();

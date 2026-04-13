const params = new URLSearchParams(window.location.search);

// Mostra errore
if (params.get('error')) {
    const el = document.getElementById('msg-error');
    el.textContent = params.get('error');
    el.style.display = 'block';
}

// Mostra messaggio success (es. dopo logout)
if (params.get('msg')) {
    const el = document.getElementById('msg-success');
    el.textContent = params.get('msg');
    el.style.display = 'block';
}

// Pre-compila email se passata nell'URL
if (params.get('email')) {
    document.getElementById('email').value = params.get('email');
}
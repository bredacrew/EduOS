fetch('sidebar.html')
    .then(r => r.text())
    .then(html => {
        document.getElementById('sidebar-container').innerHTML = html;

        // Evidenzia il nav item attivo in base alla pagina corrente
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === currentPage) {
                item.classList.add('active');
            }
        });

        // Logout
        const authBtn = document.getElementById('auth-button');
        if (authBtn) {
            authBtn.addEventListener('click', function (e) {
                e.preventDefault();
                fetch('/server/controller/auth_controller.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=logout'
                }).then(() => {
                    window.location.href = '/client/view/login.html';
                });
            });
        }
    });
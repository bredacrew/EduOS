fetch('sidebar.html')
    .then(r => r.text())
    .then(html => {
        document.getElementById('sidebar-container').innerHTML = html;

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
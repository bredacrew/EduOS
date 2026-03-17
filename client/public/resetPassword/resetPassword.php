<!-- DA VEDERE! -->
<?php
$token = $_GET['token'] ?? '';
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password • EduOS</title>

    <link rel="stylesheet" href="../../src/css/style.css">

</head>

<body>

<div class="login-container">

    <div class="logo">
        <img src="../../src/img/logo/Logo-Senza_sfondo.png" class="logo-img">
    </div>

    <h2 style="margin-bottom:20px">Nuova Password</h2>

    <form action="../../../server/autenticazione/resetPasswordController.php" method="post">

        <input type="hidden" name="action" value="reset">
        <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">

        <div class="form-group">
            <label>Nuova Password</label>
            <input type="password" name="password" required>
        </div>

        <div class="form-group">
            <label>Conferma Password</label>
            <input type="password" name="confirm_password" required>
        </div>

        <button class="btn-login">Aggiorna Password</button>

    </form>

</div>

</body>
</html>
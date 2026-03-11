<!-- | -->
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>EduOS - Registrazione</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            background: #0a0f1a;
            color: #e0f0f0;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 16px;
        }

        .register-container {
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        .logo {
            margin: 20px 0 40px 0;
        }

        .logo-img {
            width: 400px;
            max-width: 95vw;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        label {
            display: block;
            color: #b0d0d0;
            font-size: 0.9rem;
            margin-bottom: 8px;
            font-weight: 500;
        }

        input {
            width: 100%;
            padding: 14px 16px;
            background: #111827;
            border: 1px solid #1e3a4a;
            border-radius: 8px;
            color: #e0f0f0;
            font-size: 1rem;
            transition: all 0.2s ease;
        }

        input:focus {
            outline: none;
            border-color: #0d7a68;
            box-shadow: 0 0 0 3px rgba(13, 122, 104, 0.2);
        }

        .btn-register {
            width: 100%;
            padding: 14px;
            background: #0d7a68;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 8px;
        }

        .btn-register:hover {
            background: #0e8f7a;
            transform: translateY(-1px);
        }

        .btn-register:active {
            transform: translateY(0);
        }

        .extra-links {
            margin-top: 24px;
            font-size: 0.92rem;
            color: #88aacc;
            line-height: 1.6;
        }

        .extra-links a {
            color: #0d7a68;
            text-decoration: none;
            font-weight: 500;
        }

        .extra-links a:hover {
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .logo-img {
                width: 340px;
            }
            .logo {
                margin: 15px 0 30px 0;
            }
        }
    </style>
</head>
<body>

<div class="register-container">

    <div class="logo">
        <img
            src="../../src/img/logo/Logo-Senza_sfondo.png"
            alt="EduOS Logo"
            class="logo-img"
        >
    </div>

    <form>
        <div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome" placeholder="Mario" required autocomplete="given-name">
        </div>

        <div class="form-group">
            <label for="cognome">Cognome</label>
            <input type="text" id="cognome" name="cognome" placeholder="Rossi" required autocomplete="family-name">
        </div>

        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="mario.rossi@esempio.it" required autocomplete="email">
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="new-password">
        </div>

        <div class="form-group">
            <label for="confirm-password">Conferma Password</label>
            <input type="password" id="confirm-password" name="confirm-password" placeholder="••••••••" required autocomplete="new-password">
        </div>

        <button type="submit" class="btn-register">Registrati</button>
    </form>

    <div class="extra-links">
        Hai già un account? <a href="../login">Accedi</a>
    </div>

</div>

</body>
</html>
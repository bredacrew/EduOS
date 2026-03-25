<!-- | -->
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard • EduOs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link rel="stylesheet" href="../src/css/homepage.css">
</head>
<body>

<div class="shell">
    <div class="app-frame">

        <!-- SIDEBAR -->
        <div class="sidebar">
            <!-- LOGO -->
            <a href="../../index.php" class="logo-wrap">
                <img src="../src/img/logo/Logo-Senza_sfondo.png" alt="Logo EduOs">
            </a>

            <div class="nav-icons">

                <!-- HOME -->
                <a href="homepage.php" class="nav-item active">
                    <i class="fa-solid fa-house"></i>
                </a>

                <!-- PIANI -->
                <a href="piani.php" class="nav-item">
                    <i class="fa-solid fa-calendar-days"></i>
                </a>

                <!-- CHI SIAMO -->
                <a href="chiSiamo.php" class="nav-item">
                    <i class="fa-solid fa-chart-bar"></i>
                </a>

                <!-- IMPOSTAZIONI -->
                <div class="nav-item">
                    <i class="fa-solid fa-gear"></i>
                </div>

            </div>

            <!-- LOGOUT -->
            <a href="#" class="nav-logout" id="auth-button">
                <i class="fa-solid fa-right-to-bracket"></i>
            </a>

        </div>

        <!-- MAIN -->
        <div class="main">

            <!-- TOPBAR -->
            <div class="topbar">
                <div class="search-wrap">
                    <div class="search-inner">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" placeholder="Cerca eventi, corsi...">
                    </div>
                </div>

                <div class="topbar-right">
                    <div class="avatar-ring"><i class="fa-solid fa-user"></i></div>
                    <i class="fa-solid fa-chevron-down topbar-chevron" id="chevron-icon"></i>

                    <div class="profile-dropdown" id="profile-dropdown">
                        <a href="#" class="dropdown-logout" id="auth-dropdown">
                            <i class="fa-solid fa-right-to-bracket"></i>
                            Login
                        </a>
                    </div>
                </div>
            </div>

            <!-- BODY -->
            <div class="body">

                <!-- LEFT -->
                <div class="col-main">
                    <div class="greeting-card">
                        <div class="greeting-icon"><i class="fa-solid fa-calendar-days"></i></div>
                        <div class="greeting-text"><h1>Buongiorno, Nome</h1></div>
                    </div>

                    <div class="stats-card">
                        <div class="stats-header">
                            <h2>Statistiche Accademiche</h2>
                            <select class="stats-select">
                                <option>MESE / ANNO</option>
                                <option>QUESTA SETTIMANA</option>
                            </select>
                        </div>
                        <div class="graph-area">
                            <i class="fa-solid fa-chart-line"></i>
                            <p>Dati grafico dal database</p>
                        </div>
                    </div>
                </div>

                <!-- RIGHT -->
                <div class="col-right">
                    <div class="profile-card">
                        <div class="profile-label">
                            PROFILO
                            <div class="profile-edit"><i class="fa-solid fa-pencil"></i></div>
                        </div>
                        <div class="profile-body">
                            <div class="avatar-lg"><i class="fa-solid fa-user"></i></div>
                            <div class="profile-info">
                                <h3>NOME</h3>
                                <p>COGNOME</p>
                            </div>
                        </div>
                    </div>

                    <div class="calendar-card">
                        <div class="cal-header">
                            <h3>CALENDARIO</h3>
                            <div style="position:relative;">
                                <div class="cal-range" id="cal-range-btn">
                                    <span id="cal-view-label">SETTIMANA</span>
                                    <span class="cal-chevron">▼</span>
                                </div>
                                <div class="cal-dropdown-menu" id="cal-dropdown">
                                    <div class="cal-menu-item active" data-view="week">
                                        Settimana
                                    </div>
                                    <div class="cal-menu-item" data-view="month">
                                        Mese
                                    </div>
                                    <div class="cal-menu-item" data-view="year">
                                        Anno
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="cal-inner">
                            <div id="mini-calendar"></div>
                            <div class="events-section">
                                <div class="events-label">Eventi</div>
                                <div id="events-list"></div>
                                <p id="no-events" class="no-events" style="display:none;">Nessun evento questa settimana</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</div>

<script src="../src/js/calendar.js"></script>
<script src="../src/js/profilo.js"></script>
</body>
</html>
(function () {
    const GIORNI  = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
    const MESI    = ['Gen','Feb','Mar','Apr','Mag','Giu',
        'Lug','Ago','Set','Ott','Nov','Dic'];

    // Calcola il lunedì della settimana corrente
    const oggi = new Date();
    const dow = oggi.getDay();
    const diffToLun = (dow === 0) ? -6 : 1 - dow;
    const lunedi = new Date(oggi);
    lunedi.setDate(oggi.getDate() + diffToLun);

    // Genera i 7 giorni Lun–Dom
    const giorni = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lunedi);
        d.setDate(lunedi.getDate() + i);
        return d;
    });

    // Intervallo testuale (es. "9 – 15 Mar")
    const inizio = giorni[0], fine = giorni[6];
    const stessoMese = inizio.getMonth() === fine.getMonth();
    document.getElementById('week-range').textContent = stessoMese
        ? `${inizio.getDate()} – ${fine.getDate()} ${MESI[inizio.getMonth()]}`
        : `${inizio.getDate()} ${MESI[inizio.getMonth()]} – ${fine.getDate()} ${MESI[fine.getMonth()]}`;

    // Costruisce le celle
    const cal = document.getElementById('mini-calendar');
    giorni.forEach((d, i) => {
        const isOggi = d.toDateString() === oggi.toDateString();
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell';
        cell.innerHTML = `
            <span class="cal-day-label">${GIORNI[i]}</span>
            <span class="cal-day-num${isOggi ? ' today' : ''}">${d.getDate()}</span>`;
        cal.appendChild(cell);
    });

    // ── Sostituisci con eventi dal database ──
    // Formato: { titolo: 'Nome evento', orario: 'Lun 10:00' }
    const eventi = [];

    const listaEl = document.getElementById('events-list');
    const nessunoEl = document.getElementById('no-events');

    if (eventi.length === 0) {
        nessunoEl.style.display = 'block';
    } else {
        eventi.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <div class="event-dot"></div>
                <div class="event-info">
                    <div class="event-name">${ev.titolo}</div>
                    <div class="event-time">${ev.orario}</div>
                </div>`;
            listaEl.appendChild(item);
        });
    }
})();
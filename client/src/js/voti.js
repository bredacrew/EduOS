(function () {
    'use strict';

    // ── API endpoints ──
    const API_GET    = '../../../database/model/get_voti.php';
    const API_SAVE   = '../../../database/model/save_voto.php';
    const API_DELETE = '../../../database/model/delete_voto.php';

    // ── Stato ──
    let voti   = [];
    let editId = null;
    let chart  = null;

    // ── Elementi DOM ──
    const tbody           = document.getElementById('votiTbody');
    const emptyRow        = document.getElementById('emptyRow');
    const mediaGenerale   = document.getElementById('mediaGenerale');
    const mediaGenSub     = document.getElementById('mediaGeneraleSub');
    const materieList     = document.getElementById('materieList');
    const filterMateria   = document.getElementById('filterMateria');
    const filterTipo      = document.getElementById('filterTipo');
    const searchInput     = document.getElementById('searchInput');
    const modal           = document.getElementById('votoModal');
    const modalTitle      = document.getElementById('modalTitle');
    const modalError      = document.getElementById('modalError');
    const inputMateria    = document.getElementById('inputMateria');
    const inputVoto       = document.getElementById('inputVoto');
    const inputTipo       = document.getElementById('inputTipo');
    const inputData       = document.getElementById('inputData');
    const inputNote       = document.getElementById('inputNote');
    const materieDatalist = document.getElementById('materieDatalist');

    // ── Colori per materia ──
    const PALETTE = [
        '#0ecfcf','#64b4ff','#b464ff','#f7c948','#4ecdc4','#ff6b9d',
        '#80e27e','#ffb347','#87ceeb','#dda0dd'
    ];

    function colorForMateria(nome) {
        const materie = [...new Set(voti.map(v => v.materia))];
        const idx = materie.indexOf(nome);
        return PALETTE[idx >= 0 ? idx % PALETTE.length : 0];
    }

    // ── Utilità ──
    function formatData(iso) {
        if (!iso) return '—';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }

    function votoClass(v) {
        if (v >= 6)   return 'voto-alto';
        if (v >= 5)   return 'voto-medio';
        return 'voto-basso';
    }

    function mediaClass(v) {
        if (v >= 6)   return 'media-alta';
        if (v >= 5)   return 'media-media';
        return 'media-bassa';
    }

    // ── Badge stato materia ──
    // >= 6  → verde  "In regola"
    // 5–5.9 → arancione "A rischio"
    // < 5   → rosso  "Da recuperare"
    function statoMateria(media) {
        if (media >= 6) return { cls: 'stato-ok',      icon: 'fa-circle-check',      testo: 'In regola' };
        if (media >= 5) return { cls: 'stato-rischio',  icon: 'fa-triangle-exclamation', testo: 'A rischio' };
        return           { cls: 'stato-recupero',  icon: 'fa-circle-xmark',      testo: 'Da recuperare' };
    }

    function tipoClass(t) {
        const map = { 'Scritto': 'tipo-scritto', 'Orale': 'tipo-orale', 'Pratico': 'tipo-pratico' };
        return map[t] || 'tipo-scritto';
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function showError(msg) {
        modalError.textContent = msg;
        modalError.style.display = 'block';
    }

    // ── Filtra voti ──
    function getFiltered() {
        const q    = searchInput.value.trim().toLowerCase();
        const mat  = filterMateria.value;
        const tipo = filterTipo.value;

        return voti.filter(v => {
            if (q    && !v.materia.toLowerCase().includes(q)) return false;
            if (mat  && v.materia !== mat)  return false;
            if (tipo && v.tipo    !== tipo) return false;
            return true;
        });
    }

    // ── Render tabella ──
    function renderTabella() {
        const filtered = getFiltered();

        Array.from(tbody.querySelectorAll('tr:not(#emptyRow)')).forEach(r => r.remove());

        if (filtered.length === 0) {
            emptyRow.style.display = '';
            return;
        }

        emptyRow.style.display = 'none';

        const sorted = [...filtered].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

        sorted.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escHtml(v.materia)}</td>
                <td><span class="voto-badge ${votoClass(v.voto)}">${v.voto}</span></td>
                <td><span class="tipo-badge ${tipoClass(v.tipo)}">${escHtml(v.tipo)}</span></td>
                <td>${formatData(v.data)}</td>
                <td class="note-cell" title="${escHtml(v.note || '')}">${escHtml(v.note || '—')}</td>
                <td class="action-cell">
                    <button class="btn-icon" data-edit="${v.id}" title="Modifica"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon del" data-del="${v.id}" title="Elimina"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => openEdit(btn.dataset.edit));
        });
        tbody.querySelectorAll('[data-del]').forEach(btn => {
            btn.addEventListener('click', () => deleteVoto(btn.dataset.del));
        });
    }

    // ── Render medie sidebar ──
    function renderMedie() {
        if (voti.length === 0) {
            mediaGenerale.textContent = '—';
            mediaGenerale.className   = 'summary-value';
            mediaGenSub.textContent   = 'Nessun voto inserito';
            materieList.innerHTML     = '<p class="empty-hint">Nessuna materia</p>';
            return;
        }

        const mg = voti.reduce((s, v) => s + v.voto, 0) / voti.length;
        mediaGenerale.textContent = mg.toFixed(1);
        mediaGenerale.className   = 'summary-value ' + mediaClass(mg);
        mediaGenSub.textContent   = `${voti.length} vot${voti.length === 1 ? 'o' : 'i'} inserit${voti.length === 1 ? 'o' : 'i'}`;

        // Raggruppa per materia
        const map = {};
        voti.forEach(v => {
            if (!map[v.materia]) map[v.materia] = [];
            map[v.materia].push(v.voto);
        });

        // Ordina: prima le materie da recuperare, poi a rischio, poi in regola
        const ordine = { 'stato-recupero': 0, 'stato-rischio': 1, 'stato-ok': 2 };
        const entries = Object.entries(map).map(([nome, arr]) => {
            const media = arr.reduce((s, x) => s + x, 0) / arr.length;
            const stato = statoMateria(media);
            return { nome, media, stato };
        }).sort((a, b) => ordine[a.stato.cls] - ordine[b.stato.cls] || a.nome.localeCompare(b.nome));

        materieList.innerHTML = '';
        entries.forEach(({ nome, media, stato }) => {
            const row = document.createElement('div');
            row.className = `materia-row ${stato.cls}`;
            row.innerHTML = `
                <div class="materia-info">
                    <span class="materia-nome" title="${escHtml(nome)}">${escHtml(nome)}</span>
                    <span class="materia-stato-label">
                        <i class="fa-solid ${stato.icon}"></i> ${stato.testo}
                    </span>
                </div>
                <span class="materia-media ${mediaClass(media)}">${media.toFixed(1)}</span>`;
            materieList.appendChild(row);
        });
    }

    // ── Render grafico andamento ──
    function renderChart() {
        const canvas = document.getElementById('votiChart');
        if (!canvas) return;

        if (chart) { chart.destroy(); chart = null; }
        if (voti.length === 0) return;

        const sorted = [...voti]
            .filter(v => v.data)
            .sort((a, b) => a.data.localeCompare(b.data))
            .slice(-8);

        if (sorted.length === 0) return;

        const labels = sorted.map(v => v.materia.slice(0, 6) + (v.materia.length > 6 ? '.' : ''));
        const data   = sorted.map(v => v.voto);
        const colors = sorted.map(v => colorForMateria(v.materia));

        Chart.defaults.color = '#5a9aa8';

        chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data,
                    borderColor: '#0ecfcf',
                    backgroundColor: 'rgba(14,207,207,0.08)',
                    pointBackgroundColor: colors,
                    pointBorderColor: colors,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0d1f2d',
                        borderColor: 'rgba(14,207,207,0.3)',
                        borderWidth: 1,
                        titleColor: '#0ecfcf',
                        bodyColor: '#d4eef0',
                        callbacks: {
                            title: (items) => sorted[items[0].dataIndex].materia,
                            label: ctx => ' Voto: ' + ctx.parsed.y
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(14,207,207,0.06)' },
                        ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 10 } }
                    },
                    y: {
                        min: 0, max: 10,
                        grid: { color: 'rgba(14,207,207,0.08)' },
                        ticks: {
                            color: '#5a9aa8',
                            font: { family: "'Rajdhani', sans-serif", size: 10 },
                            stepSize: 2
                        }
                    }
                }
            }
        });
    }

    // ── Aggiorna filtro materie ──
    function updateFilterMaterie() {
        const materie = [...new Set(voti.map(v => v.materia))].sort();
        const current = filterMateria.value;
        filterMateria.innerHTML = '<option value="">Tutte le materie</option>';
        materie.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m; opt.textContent = m;
            if (m === current) opt.selected = true;
            filterMateria.appendChild(opt);
        });

        materieDatalist.innerHTML = '';
        materie.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            materieDatalist.appendChild(opt);
        });
    }

    // ── Render completo ──
    function render() {
        updateFilterMaterie();
        renderTabella();
        renderMedie();
        renderChart();
    }

    // ── Carica voti dal DB ──
    async function loadVoti() {
        try {
            const res = await fetch(API_GET);
            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                voti = data;
            }
        } catch (e) {
            console.error('Errore caricamento voti:', e);
        }
        render();
    }

    // ── Modal ──
    function openModal() {
        modal.classList.add('open');
        modalError.style.display = 'none';
        modalError.textContent   = '';
    }

    function closeModal() {
        modal.classList.remove('open');
        editId = null;
        inputMateria.value = '';
        inputVoto.value    = '';
        inputTipo.value    = 'Scritto';
        inputData.value    = '';
        inputNote.value    = '';
    }

    function openNew() {
        editId = null;
        modalTitle.textContent = 'AGGIUNGI VOTO';
        inputData.value = new Date().toISOString().slice(0, 10);
        openModal();
        inputMateria.focus();
    }

    function openEdit(id) {
        const v = voti.find(x => x.id === id);
        if (!v) return;
        editId = id;
        modalTitle.textContent = 'MODIFICA VOTO';
        inputMateria.value = v.materia;
        inputVoto.value    = v.voto;
        inputTipo.value    = v.tipo;
        inputData.value    = v.data || '';
        inputNote.value    = v.note || '';
        openModal();
    }

    // ── Salva voto (INSERT o UPDATE) ──
    async function saveVoto() {
        const materia = inputMateria.value.trim();
        const voto    = parseFloat(inputVoto.value);
        const tipo    = inputTipo.value;
        const data    = inputData.value;
        const note    = inputNote.value.trim();

        if (!materia) { showError('Inserisci il nome della materia.'); return; }
        if (isNaN(voto) || voto < 1 || voto > 10) { showError('Il voto deve essere tra 1 e 10.'); return; }

        const payload = { materia, voto, tipo, data, note };
        if (editId) payload.id = editId;

        try {
            const res  = await fetch(API_SAVE, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.error) { showError(json.error); return; }

            closeModal();
            await loadVoti();   // ricarica tutto dal DB
        } catch (e) {
            showError('Errore di connessione al server.');
            console.error(e);
        }
    }

    // ── Elimina voto ──
    async function deleteVoto(id) {
        if (!confirm('Eliminare questo voto?')) return;

        try {
            const res  = await fetch(API_DELETE, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id })
            });
            const json = await res.json();

            if (json.error) { alert('Errore: ' + json.error); return; }

            await loadVoti();   // ricarica tutto dal DB
        } catch (e) {
            alert('Errore di connessione al server.');
            console.error(e);
        }
    }

    // ── Event listeners ──
    document.getElementById('btnAddVoto').addEventListener('click', openNew);
    document.getElementById('btnSave').addEventListener('click', saveVoto);
    document.getElementById('btnCancel').addEventListener('click', closeModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    searchInput.addEventListener('input', renderTabella);
    filterMateria.addEventListener('change', renderTabella);
    filterTipo.addEventListener('change', renderTabella);

    // ── Init ──
    loadVoti();

})();

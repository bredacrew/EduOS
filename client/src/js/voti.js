(function () {
    'use strict';

    // ── API endpoints ──
    const API_GET    = '../../../database/model/get_voti.php';
    const API_SAVE   = '../../../database/model/save_voto.php';
    const API_DELETE = '../../../database/model/delete_voto.php';

    // ── Stato ──
    let voti      = [];
    let editId    = null;
    let chart     = null;
    let periodoMode   = 'quadrimestre'; // 'quadrimestre' | 'pentamestre'
    let periodoAttivo = 'tutti';        // 'tutti' | '1' | '2' (| '3' per pentamestre)
    let noMedia   = false;
    let votoColor = null; // null = auto, altrimenti hex

    // ── Palette colori voto ──
    const VOTO_COLORS = [
        { hex: null,      label: 'Auto' },
        { hex: '#0ecfcf', label: 'Ciano' },
        { hex: '#4ecdc4', label: 'Verde acqua' },
        { hex: '#64b4ff', label: 'Azzurro' },
        { hex: '#7f77dd', label: 'Viola' },
        { hex: '#e07a5f', label: 'Arancio' },
        { hex: '#f7b432', label: 'Giallo' },
        { hex: '#e05c7e', label: 'Rosa' },
        { hex: '#e05555', label: 'Rosso' },
        { hex: '#80e27e', label: 'Verde' },
    ];

    // ── Periodi ──
    const PERIODI = {
        quadrimestre: [
            { id: 'tutti', label: 'Tutti' },
            { id: '1',     label: '1° Quadrimestre' },
            { id: '2',     label: '2° Quadrimestre' },
        ],
        pentamestre: [
            { id: 'tutti', label: 'Tutti' },
            { id: '1',     label: '1° Pentamestre' },
            { id: '2',     label: '2° Pentamestre' },
            { id: '3',     label: '3° Pentamestre' },
        ],
    };

    function getPeriodoLabel(id) {
        if (!id || id === 'tutti') return '—';
        const list = PERIODI[periodoMode];
        const found = list.find(p => p.id === id);
        return found ? found.label.replace('1° ', '').replace('2° ', '').replace('3° ', '') + ' ' + periodoMode.charAt(0).toUpperCase() + periodoMode.slice(1) : id;
    }

    // ── DOM ──
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
    const inputArgomenti  = document.getElementById('inputArgomenti');
    const inputPeriodo    = document.getElementById('inputPeriodo');
    const materieDatalist = document.getElementById('materieDatalist');
    const toggleNoMedia   = document.getElementById('toggleNoMedia');
    const colorPickerEl   = document.getElementById('votoColorPicker');
    const periodoTabs     = document.getElementById('periodoTabs');

    // ── Periodo tabs ──
    function buildPeriodoTabs() {
        periodoTabs.innerHTML = '';
        const list = PERIODI[periodoMode];
        list.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'periodo-tab' + (p.id === periodoAttivo ? ' active' : '');
            btn.textContent = p.label;
            btn.dataset.pid = p.id;
            btn.addEventListener('click', () => {
                periodoAttivo = p.id;
                buildPeriodoTabs();
                render();
            });
            periodoTabs.appendChild(btn);
        });
    }

    function buildPeriodoSelect() {
        inputPeriodo.innerHTML = '';
        PERIODI[periodoMode].filter(p => p.id !== 'tutti').forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.label;
            inputPeriodo.appendChild(opt);
        });
    }

    // Modo (quadrimestre / pentamestre) selector
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            periodoMode = btn.dataset.mode;
            periodoAttivo = 'tutti';
            buildPeriodoTabs();
            buildPeriodoSelect();
            render();
        });
    });

    // ── Colore voto picker ──
    function buildColorPicker(selectedHex) {
        colorPickerEl.innerHTML = '';

        VOTO_COLORS.forEach(c => {
            if (c.hex === null) {
                // Bottone "Auto"
                const btn = document.createElement('div');
                btn.className = 'voto-color-swatch' + (selectedHex === null ? ' sel' : '');
                btn.style.cssText = 'background:rgba(14,207,207,0.12);border:1px dashed rgba(14,207,207,0.4);display:flex;align-items:center;justify-content:center;';
                btn.innerHTML = '<i class="fa-solid fa-rotate" style="font-size:10px;color:#0ecfcf;pointer-events:none;"></i>';
                btn.title = 'Automatico (in base al voto)';
                btn.addEventListener('click', () => { votoColor = null; buildColorPicker(null); });
                colorPickerEl.appendChild(btn);
            } else {
                const btn = document.createElement('div');
                btn.className = 'voto-color-swatch' + (selectedHex === c.hex ? ' sel' : '');
                btn.style.background = c.hex;
                btn.title = c.label;
                btn.addEventListener('click', () => { votoColor = c.hex; buildColorPicker(c.hex); });
                colorPickerEl.appendChild(btn);
            }
        });

        // Picker colore custom
        const wrap = document.createElement('div');
        wrap.className = 'voto-color-custom-wrap' + (selectedHex && !VOTO_COLORS.find(c => c.hex === selectedHex) ? ' sel' : '');
        wrap.title = 'Colore personalizzato';
        const inputColor = document.createElement('input');
        inputColor.type = 'color';
        inputColor.value = (selectedHex && !VOTO_COLORS.find(c => c.hex === selectedHex)) ? selectedHex : '#0ecfcf';
        inputColor.addEventListener('input', e => {
            votoColor = e.target.value;
            wrap.style.background = e.target.value;
            document.querySelectorAll('.voto-color-swatch').forEach(s => s.classList.remove('sel'));
            wrap.classList.add('sel');
        });
        inputColor.addEventListener('click', e => e.stopPropagation());
        const icon = document.createElement('div');
        icon.className = 'custom-icon';
        icon.innerHTML = '<i class="fa-solid fa-palette"></i>';
        wrap.style.background = (selectedHex && !VOTO_COLORS.find(c => c.hex === selectedHex)) ? selectedHex : 'transparent';
        wrap.appendChild(inputColor);
        wrap.appendChild(icon);
        colorPickerEl.appendChild(wrap);
    }

    // ── Toggle no media ──
    toggleNoMedia.addEventListener('click', () => {
        noMedia = !noMedia;
        toggleNoMedia.classList.toggle('on', noMedia);
    });

    // ── Utilità ──
    function formatData(iso) {
        if (!iso) return '—';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }

    function getVotoColor(v, customColor) {
        if (customColor) return customColor;
        if (v >= 6)  return '#4ecdc4';
        if (v >= 5)  return '#f7c948';
        return '#e05555';
    }

    function getVotoClass(v, customColor) {
        if (customColor) return 'voto-custom';
        if (v >= 6)  return 'voto-alto';
        if (v >= 5)  return 'voto-medio';
        return 'voto-basso';
    }

    function mediaClass(v) {
        if (v >= 6)  return 'media-alta';
        if (v >= 5)  return 'media-media';
        return 'media-bassa';
    }

    function statoMateria(media) {
        if (media >= 6) return { cls: 'stato-ok',      icon: 'fa-circle-check',         testo: 'In regola' };
        if (media >= 5) return { cls: 'stato-rischio',  icon: 'fa-triangle-exclamation', testo: 'A rischio' };
        return           { cls: 'stato-recupero',  icon: 'fa-circle-xmark',         testo: 'Da recuperare' };
    }

    function tipoClass(t) {
        const map = { 'Scritto': 'tipo-scritto', 'Orale': 'tipo-orale', 'Pratico': 'tipo-pratico' };
        return map[t] || 'tipo-scritto';
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function showError(msg) {
        modalError.textContent = msg;
        modalError.style.display = 'block';
    }

    // ── Filtra ──
    function getFiltered() {
        const q    = searchInput.value.trim().toLowerCase();
        const mat  = filterMateria.value;
        const tipo = filterTipo.value;

        return voti.filter(v => {
            if (q    && !v.materia.toLowerCase().includes(q)) return false;
            if (mat  && v.materia !== mat)  return false;
            if (tipo && v.tipo    !== tipo) return false;
            if (periodoAttivo !== 'tutti' && (v.periodo || '') !== periodoAttivo) return false;
            return true;
        });
    }

    // ── Tabella ──
    function renderTabella() {
        const filtered = getFiltered();
        Array.from(tbody.querySelectorAll('tr:not(#emptyRow)')).forEach(r => r.remove());

        if (filtered.length === 0) { emptyRow.style.display = ''; return; }
        emptyRow.style.display = 'none';

        const sorted = [...filtered].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

        sorted.forEach(v => {
            const color   = getVotoColor(v.voto, v.colore);
            const cls     = getVotoClass(v.voto, v.colore);
            const noMedBadge = v.no_media ? `<span class="no-media-badge"><i class="fa-solid fa-minus"></i> escluso</span>` : '';
            const periodoTxt = v.periodo ? `<span class="periodo-badge">${getPeriodoLabel(v.periodo)}</span>` : '—';

            const badgeStyle = v.colore
                ? `background:${hexToRgba(v.colore, 0.15)};color:${v.colore};border:1px solid ${hexToRgba(v.colore, 0.35)};`
                : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    ${escHtml(v.materia)}
                    ${noMedBadge}
                </td>
                <td>
                    <span class="voto-badge ${cls}" style="${badgeStyle}">${v.voto}</span>
                </td>
                <td><span class="tipo-badge ${tipoClass(v.tipo)}">${escHtml(v.tipo)}</span></td>
                <td>${formatData(v.data)}</td>
                <td>${periodoTxt}</td>
                <td class="note-cell" title="${escHtml(v.note || '')}">
                    ${v.argomenti ? `<span style="color:var(--text-secondary);">${escHtml(v.argomenti.slice(0,40))}${v.argomenti.length > 40 ? '…' : ''}</span>` : escHtml(v.note || '—')}
                </td>
                <td class="action-cell">
                    <button class="btn-icon" data-edit="${v.id}" title="Modifica"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon del" data-del="${v.id}" title="Elimina"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('[data-edit]').forEach(btn =>
            btn.addEventListener('click', () => openEdit(btn.dataset.edit))
        );
        tbody.querySelectorAll('[data-del]').forEach(btn =>
            btn.addEventListener('click', () => deleteVoto(btn.dataset.del))
        );
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // ── Medie sidebar ──
    function renderMedie() {
        // Considera solo voti del periodo attivo e che fanno media
        const votiValidi = voti.filter(v => {
            if (periodoAttivo !== 'tutti' && (v.periodo || '') !== periodoAttivo) return false;
            return !v.no_media;
        });

        if (votiValidi.length === 0) {
            const tuttiPeriodo = voti.filter(v => periodoAttivo === 'tutti' || (v.periodo || '') === periodoAttivo);
            mediaGenerale.textContent = '—';
            mediaGenerale.className   = 'summary-value';
            mediaGenSub.textContent   = tuttiPeriodo.length > 0 ? 'Tutti esclusi dalla media' : 'Nessun voto inserito';
            materieList.innerHTML     = '<p class="empty-hint">Nessuna materia</p>';
            return;
        }

        const mg = votiValidi.reduce((s, v) => s + v.voto, 0) / votiValidi.length;
        mediaGenerale.textContent = mg.toFixed(2);
        mediaGenerale.className   = 'summary-value ' + mediaClass(mg);
        mediaGenSub.textContent   = `${votiValidi.length} vot${votiValidi.length === 1 ? 'o' : 'i'} in media`;

        const map = {};
        votiValidi.forEach(v => {
            if (!map[v.materia]) map[v.materia] = [];
            map[v.materia].push(v.voto);
        });

        // Materie con voti esclusi dalla media
        const escluse = new Set();
        voti.filter(v => v.no_media && (periodoAttivo === 'tutti' || (v.periodo || '') === periodoAttivo))
            .forEach(v => { if (!map[v.materia]) escluse.add(v.materia); });

        const ordine = { 'stato-recupero': 0, 'stato-rischio': 1, 'stato-ok': 2 };
        const entries = Object.entries(map).map(([nome, arr]) => {
            const media = arr.reduce((s, x) => s + x, 0) / arr.length;
            const stato = statoMateria(media);
            return { nome, media, stato, esclusa: false };
        }).sort((a, b) => ordine[a.stato.cls] - ordine[b.stato.cls] || a.nome.localeCompare(b.nome));

        materieList.innerHTML = '';
        entries.forEach(({ nome, media, stato }) => {
            const row = document.createElement('div');
            row.className = `materia-row ${stato.cls}`;
            row.innerHTML = `
                <div class="materia-info">
                    <span class="materia-nome" title="${escHtml(nome)}">${escHtml(nome)}</span>
                    <span class="materia-stato-label"><i class="fa-solid ${stato.icon}"></i> ${stato.testo}</span>
                </div>
                <span class="materia-media ${mediaClass(media)}">${media.toFixed(1)}</span>`;
            materieList.appendChild(row);
        });
    }

    // ── Grafico ──
    function renderChart() {
        const canvas = document.getElementById('votiChart');
        if (!canvas) return;
        if (chart) { chart.destroy(); chart = null; }

        const source = voti.filter(v => {
            if (periodoAttivo !== 'tutti' && (v.periodo || '') !== periodoAttivo) return false;
            return v.data;
        }).sort((a, b) => a.data.localeCompare(b.data)).slice(-10);

        if (source.length === 0) return;

        const labels = source.map(v => v.materia.slice(0, 6) + (v.materia.length > 6 ? '.' : ''));
        const data   = source.map(v => v.voto);
        const colors = source.map(v => getVotoColor(v.voto, v.colore));

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
                    pointRadius: 5, pointHoverRadius: 7,
                    borderWidth: 2, tension: 0.35, fill: true,
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
                            title: items => source[items[0].dataIndex].materia,
                            label: ctx => ' Voto: ' + ctx.parsed.y + (source[ctx.dataIndex]?.no_media ? ' (escluso)' : '')
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(14,207,207,0.06)' }, ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 10 } } },
                    y: { min: 0, max: 10, grid: { color: 'rgba(14,207,207,0.08)' }, ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 10 }, stepSize: 2 } }
                }
            }
        });
    }

    // ── Sync calendario ──
    const VOTO_CAT = {
        id:    'voti_cat',
        name:  'Voti',
        color: { hex: '#f7b432', bg: 'rgba(247,180,50,0.15)', text: '#f7d080' }
    };

    function syncVotiCalendario(votiAggiornati) {
        let evs = [], cats = [];
        try { evs  = JSON.parse(localStorage.getItem('eduos_events')     || '[]'); } catch(e) {}
        try { cats = JSON.parse(localStorage.getItem('eduos_categories') || '[]'); } catch(e) {}

        if (!cats.find(c => c.id === VOTO_CAT.id)) {
            cats.push(VOTO_CAT);
            localStorage.setItem('eduos_categories', JSON.stringify(cats));
        }

        evs = evs.filter(e => !String(e.id).startsWith('voto_'));
        votiAggiornati.forEach(v => {
            if (!v.data) return;
            evs.push({
                id: 'voto_' + v.id,
                ti: v.materia + ' — ' + v.voto + (v.no_media ? ' (escluso)' : ''),
                s: v.data, e: v.data, st: null, et: null, c: VOTO_CAT.id
            });
        });
        localStorage.setItem('eduos_events', JSON.stringify(evs));
    }

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
            const opt = document.createElement('option'); opt.value = m;
            materieDatalist.appendChild(opt);
        });
    }

    function render() {
        updateFilterMaterie();
        renderTabella();
        renderMedie();
        renderChart();
    }

    // ── Carica dal DB ──
    async function loadVoti() {
        try {
            const res = await fetch(API_GET);
            if (res.status === 401) { window.location.href = 'login.html'; return; }
            const data = await res.json();
            if (Array.isArray(data)) {
                voti = data.map(v => ({
                    ...v,
                    voto:     parseFloat(v.voto),
                    no_media: !!parseInt(v.no_media || 0),
                }));
                syncVotiCalendario(voti);
            }
        } catch (e) { console.error('Errore caricamento voti:', e); }
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
        editId    = null;
        noMedia   = false;
        votoColor = null;
        inputMateria.value  = '';
        inputVoto.value     = '';
        inputTipo.value     = 'Scritto';
        inputData.value     = '';
        inputNote.value     = '';
        inputArgomenti.value = '';
        toggleNoMedia.classList.remove('on');
        buildColorPicker(null);
    }

    function openNew() {
        editId    = null;
        noMedia   = false;
        votoColor = null;
        modalTitle.textContent = 'AGGIUNGI VOTO';
        inputData.value = new Date().toISOString().slice(0, 10);
        buildColorPicker(null);
        buildPeriodoSelect();
        openModal();
        inputMateria.focus();
    }

    function openEdit(id) {
        const v = voti.find(x => String(x.id) === String(id));
        if (!v) return;
        editId    = id;
        noMedia   = !!v.no_media;
        votoColor = v.colore || null;
        modalTitle.textContent  = 'MODIFICA VOTO';
        inputMateria.value      = v.materia;
        inputVoto.value         = v.voto;
        inputTipo.value         = v.tipo;
        inputData.value         = v.data || '';
        inputNote.value         = v.note || '';
        inputArgomenti.value    = v.argomenti || '';
        toggleNoMedia.classList.toggle('on', noMedia);
        buildColorPicker(votoColor);
        buildPeriodoSelect();
        if (v.periodo) inputPeriodo.value = v.periodo;
        openModal();
    }

    // ── Salva ──
    async function saveVoto() {
        const materia    = inputMateria.value.trim();
        const votoVal    = parseFloat(inputVoto.value);
        const tipo       = inputTipo.value;
        const data       = inputData.value;
        const note       = inputNote.value.trim();
        const argomenti  = inputArgomenti.value.trim();
        const periodo    = inputPeriodo.value || '';

        if (!materia) { showError('Inserisci il nome della materia.'); return; }
        if (isNaN(votoVal) || votoVal < 1 || votoVal > 10) { showError('Il voto deve essere tra 1 e 10.'); return; }

        const payload = {
            materia, voto: votoVal, tipo, data, note, argomenti,
            periodo, no_media: noMedia ? 1 : 0,
            colore: votoColor || null,
        };
        if (editId) payload.id = editId;

        try {
            const res  = await fetch(API_SAVE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.error) { showError(json.error); return; }
            closeModal();
            await loadVoti();
        } catch (e) {
            showError('Errore di connessione al server.');
            console.error(e);
        }
    }

    // ── Elimina ──
    async function deleteVoto(id) {
        if (!confirm('Eliminare questo voto?')) return;
        try {
            const res  = await fetch(API_DELETE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id })
            });
            const json = await res.json();
            if (json.error) { alert('Errore: ' + json.error); return; }
            await loadVoti();
        } catch (e) { alert('Errore di connessione al server.'); }
    }

    // ── Event listeners ──
    document.getElementById('btnAddVoto').addEventListener('click', openNew);
    document.getElementById('btnSave').addEventListener('click', saveVoto);
    document.getElementById('btnCancel').addEventListener('click', closeModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === this) closeModal(); });
    searchInput.addEventListener('input', renderTabella);
    filterMateria.addEventListener('change', renderTabella);
    filterTipo.addEventListener('change', renderTabella);

    // ── Init ──
    buildPeriodoTabs();
    buildPeriodoSelect();
    buildColorPicker(null);
    loadVoti();

})();
/* ═══════════════════════════════════════════════════════════════
   calendario.js — EduOs
   Fix: time picker scroll, mini→main sync, palette estesa,
        colore custom categorie, info evento, mobile
   ═══════════════════════════════════════════════════════════════ */

const CAT_COLORS = [
    {hex:'#0ecfcf', bg:'rgba(14,207,207,.15)',  text:'#7fe8e8'},
    {hex:'#7f77dd', bg:'rgba(127,119,221,.16)', text:'#b0aaf0'},
    {hex:'#e05c7e', bg:'rgba(224,92,126,.15)',  text:'#f0a0b8'},
    {hex:'#e07a5f', bg:'rgba(224,122,95,.15)',  text:'#f0b090'},
    {hex:'#3da35d', bg:'rgba(61,163,93,.15)',   text:'#7ed49a'},
    {hex:'#e8b84b', bg:'rgba(232,184,75,.15)',  text:'#f0d07a'},
    {hex:'#4b8fe8', bg:'rgba(75,143,232,.15)',  text:'#90c0f8'},
    {hex:'#c45ce8', bg:'rgba(196,92,232,.15)',  text:'#e090f8'},
    {hex:'#e84b4b', bg:'rgba(232,75,75,.15)',   text:'#f8a0a0'},
    {hex:'#4be8a4', bg:'rgba(75,232,164,.15)',  text:'#90f8d0'},
    {hex:'#f080c0', bg:'rgba(240,128,192,.15)', text:'#f8b0d8'},
    {hex:'#80d0ff', bg:'rgba(128,208,255,.15)', text:'#b8e8ff'},
];

const TODAY = new Date();
let mY = TODAY.getFullYear(), mM = TODAY.getMonth();
let curView = 'month', weekOffset = 0;
let scv = null, tvis = false, nid = 100, selColor = CAT_COLORS[0];
let editingId = null;
let ctrlDays = [], isCtrl = false;
let editingCatId = null;
let selColorEdit = CAT_COLORS[0];
let selColorEditCustom = null;

const MO  = ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'];
const MOS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const DW  = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

/* ── STORAGE ── */
function ldEvs()  { try { const r = localStorage.getItem('eduos_events'); if (r) return JSON.parse(r); } catch(e) {} return []; }
function svEvs()  { try { localStorage.setItem('eduos_events', JSON.stringify(evs)); } catch(e) {} }
function ldCats() { try { const r = localStorage.getItem('eduos_categories'); if (r) return JSON.parse(r); } catch(e) {} return [{id:'personal', name:'Personale', color:CAT_COLORS[0]}]; }
function svCats() { try { localStorage.setItem('eduos_categories', JSON.stringify(cats)); } catch(e) {} }

let evs  = ldEvs();
let cats = ldCats();

/* ── HELPERS ── */
function ds(y, m, d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function tds() { return ds(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()); }
function forDay(y, m, d) { const s = ds(y,m,d); return evs.filter(e => e.s <= s && e.e >= s); }
function getCat(id) { return cats.find(c => c.id === id) || cats[0] || {id:'personal',name:'Personale',color:CAT_COLORS[0]}; }

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function colorFromHex(hex) {
    return { hex, bg: hexToRgba(hex, 0.15), text: hexToRgba(hex, 0.9) };
}

function weekOffsetForDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const todayDay = (TODAY.getDay() + 6) % 7;
    const weekMon = new Date(TODAY); weekMon.setDate(TODAY.getDate() - todayDay); weekMon.setHours(0,0,0,0);
    const targetDay = (d.getDay() + 6) % 7;
    const targetMon = new Date(d); targetMon.setDate(d.getDate() - targetDay); targetMon.setHours(0,0,0,0);
    return Math.round((targetMon - weekMon) / (7 * 86400000));
}

/* ── CATEGORY TAGS ── */
function renderCatTags() {
    const c = document.getElementById('catTags'); c.innerHTML = '';
    cats.forEach(cat => {
        const s = document.createElement('span'); s.className = 'ct'; s.textContent = cat.name;
        s.style.background = cat.color.bg; s.style.color = cat.color.text; s.style.borderColor = cat.color.hex + '55';
        s.addEventListener('click', (e) => openEditCat(cat.id, e.currentTarget));
        c.appendChild(s);
    });
    const add = document.createElement('span'); add.className = 'ct add'; add.textContent = '+ Aggiungi';
    add.onclick = openCatModal; c.appendChild(add);
}

function renderPopCats() {
    const c = document.getElementById('popCats'); c.innerHTML = '';
    cats.forEach(cat => {
        const btn = document.createElement('button'); btn.className = 'pc'; btn.textContent = cat.name; btn.dataset.cid = cat.id;
        btn.onclick = () => selC(cat.id, btn); c.appendChild(btn);
    });
}

/* ── MINI CALENDAR ──
   navToDay sincronizza sia mini che main */
function renderMini() {
    document.getElementById('miniLbl').textContent = `${MOS[mM].toUpperCase()} ${mY}`;
    const gb = document.getElementById('miniGb'); gb.innerHTML = '';
    const fd    = (new Date(mY, mM, 1).getDay() + 6) % 7;
    const days  = new Date(mY, mM+1, 0).getDate();
    const prev  = new Date(mY, mM, 0).getDate();
    let cells = [];
    for (let i = fd-1; i >= 0; i--) cells.push({d: prev-i, o:true});
    for (let d = 1; d <= days; d++) cells.push({d, o:false});
    let nd = 1; while (cells.length % 7 !== 0) cells.push({d: nd++, o:true});
    cells.forEach(c => {
        const div = document.createElement('div'); div.className = 'md'; div.textContent = c.d;
        if (c.o) { div.classList.add('mother'); }
        else {
            const it = c.d === TODAY.getDate() && mM === TODAY.getMonth() && mY === TODAY.getFullYear();
            if (it) div.classList.add('mtoday');
            if (forDay(mY, mM, c.d).length) div.classList.add('mev');
            div.onclick = () => navToDay(mY, mM, c.d);
        }
        gb.appendChild(div);
    });
}

function miniPrev() { if (mM === 0) { mM = 11; mY--; } else mM--; renderMini(); if (curView === 'month') renderMain(); }
function miniNext() { if (mM === 11) { mM = 0; mY++; } else mM++; renderMini(); if (curView === 'month') renderMain(); }

function navToDay(y, m, d) {
    // Sincronizza il mese del mini con quello del main
    mY = y; mM = m;
    if (curView === 'month') {
        renderMini();
        renderMain();
        requestAnimationFrame(() => {
            const el = document.getElementById(`gc-${y}-${m}-${d}`);
            if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
        });
    } else {
        weekOffset = weekOffsetForDate(ds(y, m, d));
        const ws = getWS(weekOffset); mY = ws.getFullYear(); mM = ws.getMonth();
        renderMini(); renderMain();
    }
}

/* ── SIDEBAR TODAY ── */
function renderSidebar() {
    const c = document.getElementById('todayList'); c.innerHTML = '';
    const te = evs.filter(e => e.s <= tds() && e.e >= tds());
    if (!te.length) { c.innerHTML = '<div class="no-ev">Nessun evento</div>'; return; }
    te.forEach(e => {
        const cat = getCat(e.c);
        const t   = e.st ? `${e.st} – ${e.et || ''}` : 'Tutto il giorno';
        const item = document.createElement('div'); item.className = 'ev-item';
        item.innerHTML = `<div class="ev-dot" style="background:${cat.color.hex};box-shadow:0 0 6px ${cat.color.hex}88"></div><div class="ev-info"><div class="ev-name">${e.ti}</div><div class="ev-time">${t}</div></div>`;
        item.onclick = () => openEdit(e.id);
        c.appendChild(item);
    });
}

/* ── MONTH VIEW ── */
function buildMonthGrid(y, m) {
    const wrap = document.createElement('div');
    const hdr = document.createElement('div'); hdr.className = 'cal-hdr-row';
    const mn = MO[m];
    hdr.innerHTML = `<div class="cal-hdr-title"><span>${mn.slice(0,3)}</span>${mn.slice(3).toLowerCase()} <span style="font-size:14px;opacity:.5">${y}</span></div>`;
    const r = document.createElement('div'); r.className = 'cal-hdr-right';
    r.innerHTML = `<div class="view-toggle"><button class="vbtn active">Mese</button><button class="vbtn" onclick="switchView('week')">Settimana</button></div>`;
    hdr.appendChild(r); wrap.appendChild(hdr);
    const grid = document.createElement('div'); grid.className = 'month-grid';
    const hd = document.createElement('div'); hd.className = 'grid-hd';
    DW.forEach(d => { const x = document.createElement('div'); x.textContent = d; hd.appendChild(x); });
    grid.appendChild(hd);
    const bd = document.createElement('div'); bd.className = 'grid-bd';
    const fd    = (new Date(y, m, 1).getDay() + 6) % 7;
    const days  = new Date(y, m+1, 0).getDate();
    const prev  = new Date(y, m, 0).getDate();
    let cells = [];
    for (let i = fd-1; i >= 0; i--) cells.push({d: prev-i, y: m===0?y-1:y, m: m===0?11:m-1, o:true});
    for (let d = 1; d <= days; d++) cells.push({d, y, m, o:false});
    let nd = 1; while (cells.length % 7 !== 0) cells.push({d: nd++, y: m===11?y+1:y, m: m===11?0:m+1, o:true});
    const rows = []; for (let ri = 0; ri < cells.length/7; ri++) rows.push(cells.slice(ri*7, (ri+1)*7));
    rows.forEach(row => {
        row.forEach((c, ci) => {
            const cell = document.createElement('div'); cell.className = 'gc';
            if (!c.o) {
                cell.id = `gc-${c.y}-${c.m}-${c.d}`;
                cell.onclick = ev => {
                    if (ev.ctrlKey || ev.metaKey) return;
                    ev.stopPropagation();
                    openP(c.y, c.m, c.d, cell);
                };
                cell.addEventListener('click', ev => {
                    if (!ev.ctrlKey && !ev.metaKey) return;
                    ev.stopPropagation();
                    const s = ds(c.y, c.m, c.d);
                    const idx = ctrlDays.indexOf(s);
                    if (idx === -1) { ctrlDays.push(s); cell.classList.add('ctrl-hover'); }
                    else { ctrlDays.splice(idx, 1); cell.classList.remove('ctrl-hover'); }
                    if (ctrlDays.length >= 2) {
                        ctrlDays.sort();
                        openPMulti(ctrlDays[0], ctrlDays[ctrlDays.length-1], cell);
                        ctrlDays = [];
                        document.querySelectorAll('.ctrl-hover').forEach(el => el.classList.remove('ctrl-hover'));
                    }
                });
            }
            const num = document.createElement('div'); num.className = 'cn'; num.textContent = c.d;
            const it = !c.o && c.d === TODAY.getDate() && c.m === TODAY.getMonth() && c.y === TODAY.getFullYear();
            if (it) num.classList.add('ctoday');
            if (c.o) num.classList.add('cother');
            cell.appendChild(num);
            if (!c.o) {
                const cStr = ds(c.y, c.m, c.d);
                const dayEvs = forDay(c.y, c.m, c.d).sort((a,b) => {
                    const aM = a.s !== a.e ? 0 : 1, bM = b.s !== b.e ? 0 : 1;
                    return aM - bM || (a.st||'').localeCompare(b.st||'');
                });
                const wrap2 = document.createElement('div'); wrap2.className = 'ev-row-wrap';
                let shown = 0;
                dayEvs.forEach(ev => {
                    if (shown >= 3) return;
                    const cat = getCat(ev.c);
                    const isMulti = ev.s !== ev.e;
                    let pos;
                    if (!isMulti) { pos = 'ev-single'; }
                    else if (ev.s === cStr) { pos = 'ev-start'; }
                    else if (ev.e === cStr) { pos = 'ev-end'; }
                    else { pos = ci === 0 ? 'ev-start' : 'ev-middle'; }
                    const pill = document.createElement('div'); pill.className = `ev-pill ${pos}`;
                    pill.style.background = cat.color.bg; pill.style.color = cat.color.text;
                    if (pos === 'ev-start') { pill.style.borderLeft = `3px solid ${cat.color.hex}`; pill.style.boxShadow = `0 2px 8px ${cat.color.hex}30`; }
                    if (pos === 'ev-middle' || pos === 'ev-end') { pill.style.borderLeft = `3px solid ${cat.color.hex}60`; }
                    const showText = (pos === 'ev-single' || pos === 'ev-start' || ci === 0);
                    if (showText) pill.textContent = ev.ti;
                    pill.title = ev.ti;
                    pill.onclick = e => { e.stopPropagation(); openEdit(ev.id); };
                    wrap2.appendChild(pill); shown++;
                });
                if (dayEvs.length > 3) {
                    const more = document.createElement('div'); more.className = 'ev-more';
                    more.textContent = `+${dayEvs.length - 3} altri`;
                    wrap2.appendChild(more);
                }
                cell.appendChild(wrap2);
            }
            bd.appendChild(cell);
        });
    });
    grid.appendChild(bd); wrap.appendChild(grid);
    return wrap;
}

/* ── WEEK VIEW ── */
function getWS(off) {
    const d = new Date(TODAY);
    const dayOfWeek = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayOfWeek + off * 7);
    d.setHours(0,0,0,0);
    return d;
}

function buildWeekView(off) {
    const ws = getWS(off);
    const we = new Date(ws); we.setDate(ws.getDate() + 6);
    const days = [];
    for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(ws.getDate() + i); days.push(d); }
    const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    const mS = ws.getMonth(), mE = we.getMonth();
    const titleHtml = mS === mE
        ? `<span>${MO[mS].slice(0,3)}</span>${MO[mS].slice(3).toLowerCase()}`
        : `<span>${MO[mS].slice(0,3)}</span> – <span>${MO[mE].slice(0,3)}</span>`;
    const wrap = document.createElement('div');
    const hdr = document.createElement('div'); hdr.className = 'cal-hdr-row';
    hdr.innerHTML = `<div class="cal-hdr-title">${titleHtml}</div>`;
    const rr = document.createElement('div'); rr.className = 'cal-hdr-right';
    rr.innerHTML = `<div class="week-nav"><button class="wn-btn" onclick="weekPrev()">&#8249;</button><span class="week-range-label">${fmt(ws)} – ${fmt(we)}</span><button class="wn-btn" onclick="weekNext()">&#8250;</button></div><div class="view-toggle"><button class="vbtn" onclick="switchView('month')">Mese</button><button class="vbtn active">Settimana</button></div>`;
    hdr.appendChild(rr); wrap.appendChild(hdr);
    const grid = document.createElement('div'); grid.className = 'week-grid';
    const hd = document.createElement('div'); hd.className = 'week-hd';
    hd.appendChild(document.createElement('div'));
    days.forEach(day => {
        const th = document.createElement('div'); th.className = 'wh-day';
        const it = day.getDate() === TODAY.getDate() && day.getMonth() === TODAY.getMonth() && day.getFullYear() === TODAY.getFullYear();
        th.innerHTML = `<div class="wh-day-name">${DW[(day.getDay()+6)%7]}</div><div class="wh-day-num${it?' wtoday':''}" onclick="openP(${day.getFullYear()},${day.getMonth()},${day.getDate()},this)">${day.getDate()}</div>`;
        hd.appendChild(th);
    });
    grid.appendChild(hd);
    const body = document.createElement('div'); body.className = 'week-body';
    const tCol = document.createElement('div'); tCol.className = 'wtime-col';
    for (let h = 0; h < 24; h++) {
        const sl = document.createElement('div'); sl.className = 'wtime-slot';
        sl.textContent = h === 0 ? '' : `${String(h).padStart(2,'0')}:00`;
        tCol.appendChild(sl);
    }
    body.appendChild(tCol);
    days.forEach(day => {
        const dStr = ds(day.getFullYear(), day.getMonth(), day.getDate());
        const col = document.createElement('div'); col.className = 'wday-col';
        col.onclick = () => openP(day.getFullYear(), day.getMonth(), day.getDate(), col);
        for (let h = 0; h < 24; h++) { const sl = document.createElement('div'); sl.className = 'wslot'; col.appendChild(sl); }
        const evDiv = document.createElement('div'); evDiv.className = 'wday-events';
        evs.filter(e => e.s <= dStr && e.e >= dStr && !e.st).forEach(ev => {
            const cat = getCat(ev.c);
            const el = document.createElement('div'); el.className = 'wev-allday';
            el.style.background = cat.color.bg; el.style.color = cat.color.text; el.style.borderLeftColor = cat.color.hex;
            el.style.boxShadow = `inset 0 0 30px ${cat.color.hex}10`;
            el.innerHTML = `<div class="wev-name">${ev.ti}</div><div class="wev-time">Tutto il giorno</div>`;
            el.onclick = e => { e.stopPropagation(); openEdit(ev.id); };
            evDiv.appendChild(el);
        });
        evs.filter(e => e.s === dStr && e.st).forEach(ev => {
            const cat = getCat(ev.c);
            const [sh, sm] = ev.st.split(':').map(Number);
            const [eh, em] = (ev.et || '23:59').split(':').map(Number);
            const top    = (sh * 60 + sm) / 60 * 48;
            const height = Math.max(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 48, 24);
            const el = document.createElement('div'); el.className = 'wev';
            el.style.top = `${top}px`; el.style.height = `${height}px`;
            el.style.background = cat.color.bg; el.style.color = cat.color.text;
            el.style.borderLeftColor = cat.color.hex; el.style.boxShadow = `0 2px 12px ${cat.color.hex}25`;
            el.innerHTML = `<div class="wev-name">${ev.ti}</div><div class="wev-time">${ev.st}${ev.et ? ' – '+ev.et : ''}</div>`;
            el.onclick = e => { e.stopPropagation(); openEdit(ev.id); };
            evDiv.appendChild(el);
        });
        col.appendChild(evDiv); body.appendChild(col);
    });
    grid.appendChild(body); wrap.appendChild(grid);
    return wrap;
}

function renderMain() {
    const area = document.getElementById('calArea'); area.innerHTML = '';
    if (curView === 'month') area.appendChild(buildMonthGrid(mY, mM));
    else area.appendChild(buildWeekView(weekOffset));
}

function switchView(v) {
    curView = v;
    if (v === 'week') { const ws = getWS(weekOffset); mY = ws.getFullYear(); mM = ws.getMonth(); renderMini(); }
    renderMain();
}

function weekPrev() { weekOffset--; const ws = getWS(weekOffset); mY = ws.getFullYear(); mM = ws.getMonth(); renderMini(); renderMain(); }
function weekNext() { weekOffset++; const ws = getWS(weekOffset); mY = ws.getFullYear(); mM = ws.getMonth(); renderMini(); renderMain(); }

/* ═══════════════════════════════════════════════════
   POPUP EVENTO — con campi info aggiuntivi
   ═══════════════════════════════════════════════════ */
function openP(y, m, d, el) {
    editingId = null; _resetPopup(ds(y,m,d), ds(y,m,d)); _positionPopup(el); _showPopup();
}
function openPMulti(startStr, endStr, el) {
    editingId = null; _resetPopup(startStr, endStr); _positionPopup(el); _showPopup();
}
function openNew() {
    editingId = null; _resetPopup(tds(), tds());
    const p = document.getElementById('popup');
    p.style.top = '72px'; p.style.right = '24px'; p.style.left = 'auto';
    _showPopup();
}

function openEdit(id) {
    const ev = evs.find(e => e.id === id); if (!ev) return;
    editingId = id;
    document.getElementById('pTi').value = ev.ti;
    document.getElementById('pS').value  = ev.s;
    document.getElementById('pE').value  = ev.e;
    document.getElementById('pLuogo').value      = ev.luogo || '';
    document.getElementById('pDescrizione').value = ev.descrizione || '';
    document.getElementById('pLink').value        = ev.link || '';
    document.getElementById('pArgomenti').value   = ev.argomenti || '';

    if (ev.st) {
        setPickerFromTime('SH','SM', ev.st);
        setPickerFromTime('EH','EM', ev.et || '');
        document.getElementById('chkAllDay').checked = false;
        document.getElementById('timeSelWrap').style.display = 'flex';
        tvis = true;
        document.getElementById('tR').style.display = 'flex';
        document.getElementById('bT').textContent = '− Ora';
    } else {
        tvis = false;
        document.getElementById('tR').style.display = 'none';
        document.getElementById('bT').textContent = '+ Ora';
    }
    scv = ev.c;
    renderPopCats();
    setTimeout(() => { const btn = document.querySelector(`.pc[data-cid="${ev.c}"]`); if (btn) selC(ev.c, btn); }, 0);
    document.getElementById('popIcon').className = 'fa-solid fa-pen-to-square';
    document.getElementById('btnCreate').style.display = 'none';
    document.getElementById('popActions').style.display = 'flex';
    const p = document.getElementById('popup');
    p.style.top = '72px'; p.style.right = '24px'; p.style.left = 'auto';
    document.getElementById('ovl').classList.add('on');
    p.classList.add('on');
    setTimeout(() => document.getElementById('pTi').focus(), 50);
}

function _resetPopup(startStr, endStr) {
    document.getElementById('pTi').value         = '';
    document.getElementById('pS').value           = startStr;
    document.getElementById('pE').value           = endStr;
    document.getElementById('pLuogo').value       = '';
    document.getElementById('pDescrizione').value = '';
    document.getElementById('pLink').value        = '';
    document.getElementById('pArgomenti').value   = '';
    if (document.getElementById('chkAllDay')) {
        document.getElementById('chkAllDay').checked = false;
        document.getElementById('timeSelWrap').style.display = 'flex';
    }
    document.getElementById('tR').style.display = 'none';
    tvis = false;
    document.getElementById('bT').textContent = '+ Ora';
    scv = null;
    renderPopCats();
    document.getElementById('popIcon').className = 'fa-solid fa-plus';
    document.getElementById('btnCreate').style.display = 'block';
    document.getElementById('popActions').style.display = 'none';
    hideWarning();
}

function _positionPopup(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return;
    const r = el.getBoundingClientRect();
    const p = document.getElementById('popup');
    let t = r.bottom + 8, l = r.left;
    if (l + 370 > window.innerWidth - 12) l = window.innerWidth - 370 - 12;
    if (t + 420 > window.innerHeight - 12) t = r.top - 420 - 8;
    if (t < 65) t = 65;
    p.style.top = `${t}px`; p.style.left = `${l}px`; p.style.right = 'auto';
}

function _showPopup() {
    document.getElementById('ovl').classList.add('on');
    document.getElementById('popup').classList.add('on');
    setTimeout(() => document.getElementById('pTi').focus(), 50);
}

function closeP() {
    document.getElementById('ovl').classList.remove('on');
    document.getElementById('popup').classList.remove('on');
    editingId = null; hideWarning();
}

function selC(cid, btn) {
    scv = cid;
    document.querySelectorAll('.pc').forEach(b => { b.classList.remove('sel'); b.style.background=''; b.style.color=''; b.style.borderColor=''; });
    const cat = getCat(cid); btn.classList.add('sel');
    btn.style.background = cat.color.bg; btn.style.color = cat.color.text; btn.style.borderColor = cat.color.hex + '88';
}

function syncE() {
    const s = document.getElementById('pS').value, e = document.getElementById('pE').value;
    if (s > e) document.getElementById('pE').value = s;
    if (tvis && !document.getElementById('chkAllDay').checked) enforceEndAfterStart();
}

function onEndDateChange() {
    if (tvis && !document.getElementById('chkAllDay').checked) enforceEndAfterStart();
}

function togT() {
    tvis = !tvis;
    document.getElementById('tR').style.display = tvis ? 'flex' : 'none';
    document.getElementById('bT').textContent = tvis ? '− Ora' : '+ Ora';
    if (tvis) {
        document.getElementById('chkAllDay').checked = false;
        document.getElementById('timeSelWrap').style.display = 'flex';
        applyTimeDefaults();
    } else { hideWarning(); }
}

function createEv() {
    const ti = document.getElementById('pTi').value.trim();
    if (!ti) { document.getElementById('pTi').style.boxShadow = '0 0 0 1px #e05c7e'; return; }
    if (tvis && !document.getElementById('chkAllDay').checked && !isEndValid()) { showWarning(); return; }
    evs.push({
        id:          nid++,
        ti,
        s:           document.getElementById('pS').value,
        e:           document.getElementById('pE').value,
        st:          tvis ? (document.getElementById('chkAllDay').checked ? null : getTimeFromPicker('SH','SM')) : null,
        et:          tvis ? (document.getElementById('chkAllDay').checked ? null : getTimeFromPicker('EH','EM')) : null,
        c:           scv || cats[0].id,
        luogo:       document.getElementById('pLuogo').value.trim() || null,
        descrizione: document.getElementById('pDescrizione').value.trim() || null,
        link:        document.getElementById('pLink').value.trim() || null,
        argomenti:   document.getElementById('pArgomenti').value.trim() || null,
    });
    svEvs(); closeP(); renderAll();
}

function saveEv() {
    const ti = document.getElementById('pTi').value.trim(); if (!ti) return;
    if (tvis && !document.getElementById('chkAllDay').checked && !isEndValid()) { showWarning(); return; }
    const idx = evs.findIndex(e => e.id === editingId); if (idx === -1) return;
    evs[idx] = {
        ...evs[idx], ti,
        s:           document.getElementById('pS').value,
        e:           document.getElementById('pE').value,
        st:          tvis ? (document.getElementById('chkAllDay').checked ? null : getTimeFromPicker('SH','SM')) : null,
        et:          tvis ? (document.getElementById('chkAllDay').checked ? null : getTimeFromPicker('EH','EM')) : null,
        c:           scv || evs[idx].c,
        luogo:       document.getElementById('pLuogo').value.trim() || null,
        descrizione: document.getElementById('pDescrizione').value.trim() || null,
        link:        document.getElementById('pLink').value.trim() || null,
        argomenti:   document.getElementById('pArgomenti').value.trim() || null,
    };
    svEvs(); closeP(); renderAll();
}

function deleteEv() {
    if (editingId === null) return;
    evs = evs.filter(e => e.id !== editingId);
    svEvs(); closeP(); renderAll();
}

function renderAll() { renderMain(); renderMini(); renderSidebar(); }

/* ═══════════════════════════════════════════════════
   MODAL NUOVA CATEGORIA — palette estesa + colore custom
   ═══════════════════════════════════════════════════ */
let selColorCustomHex = null; // per nuova categoria

function openCatModal() {
    document.getElementById('catName').value = '';
    selColor = CAT_COLORS[0];
    selColorCustomHex = null;
    buildColorPicker();
    document.getElementById('catModal').classList.add('on');
    setTimeout(() => document.getElementById('catName').focus(), 80);
}
function closeCatModal() { document.getElementById('catModal').classList.remove('on'); }

function buildColorPicker() {
    const cp = document.getElementById('colorPicker'); cp.innerHTML = '';
    CAT_COLORS.forEach(c => {
        const sw = document.createElement('div'); sw.className = 'cswatch';
        sw.style.background = c.hex;
        if (c.hex === selColor.hex && !selColorCustomHex) sw.classList.add('sel');
        sw.onclick = () => { selColor = c; selColorCustomHex = null; buildColorPicker(); };
        cp.appendChild(sw);
    });
    // Custom color input
    const customWrap = document.createElement('div');
    customWrap.className = 'cswatch cswatch-custom' + (selColorCustomHex ? ' sel' : '');
    customWrap.style.background = selColorCustomHex || 'rgba(14,207,207,0.1)';
    customWrap.style.border = selColorCustomHex ? '2px solid rgba(255,255,255,0.75)' : '2px dashed rgba(14,207,207,0.4)';
    customWrap.style.cssText += ';display:flex;align-items:center;justify-content:center;';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = selColorCustomHex || '#0ecfcf';
    colorInput.style.cssText = 'position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;';
    colorInput.addEventListener('input', e => {
        selColorCustomHex = e.target.value;
        selColor = colorFromHex(e.target.value);
        buildColorPicker();
    });
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-palette';
    icon.style.cssText = 'font-size:16px;color:rgba(14,207,207,0.7);pointer-events:none;position:relative;z-index:1;';
    if (selColorCustomHex) icon.style.color = selColorCustomHex;
    customWrap.style.position = 'relative';
    customWrap.appendChild(colorInput);
    customWrap.appendChild(icon);
    cp.appendChild(customWrap);
}

function saveCat() {
    const name = document.getElementById('catName').value.trim(); if (!name) return;
    cats.push({id:'cat_'+Date.now(), name, color: selColor});
    svCats(); renderCatTags(); renderPopCats(); closeCatModal();
}
document.getElementById('catModal').addEventListener('click', function(e) { if (e.target === this) closeCatModal(); });

/* ── MODAL MODIFICA CATEGORIA — palette estesa + colore custom ── */
function openEditCat(catId, triggerEl) {
    const cat = cats.find(c => c.id === catId); if (!cat) return;
    editingCatId    = catId;
    selColorEdit    = cat.color;
    selColorEditCustom = null;
    document.getElementById('editCatName').value = cat.name;
    buildColorPickerEdit();
    const evCount = evs.filter(e => e.c === catId).length;
    const warnEl = document.getElementById('editCatWarn');
    if (evCount > 0) {
        warnEl.textContent = `Attenzione: ${evCount} evento${evCount > 1 ? 'i' : ''} usa${evCount > 1 ? 'no' : ''} questa categoria.`;
        warnEl.style.display = 'block';
    } else { warnEl.style.display = 'none'; }
    document.getElementById('editCatModal').classList.add('on');
    setTimeout(() => document.getElementById('editCatName').focus(), 80);
}

function closeEditCatModal() {
    document.getElementById('editCatModal').classList.remove('on');
    editingCatId = null;
}

function buildColorPickerEdit() {
    const cp = document.getElementById('colorPickerEdit'); cp.innerHTML = '';
    CAT_COLORS.forEach(c => {
        const sw = document.createElement('div'); sw.className = 'cswatch';
        sw.style.background = c.hex;
        if (c.hex === selColorEdit.hex && !selColorEditCustom) sw.classList.add('sel');
        sw.onclick = () => { selColorEdit = c; selColorEditCustom = null; buildColorPickerEdit(); };
        cp.appendChild(sw);
    });
    // Custom
    const customWrap = document.createElement('div');
    customWrap.className = 'cswatch cswatch-custom' + (selColorEditCustom ? ' sel' : '');
    customWrap.style.background = selColorEditCustom || 'rgba(14,207,207,0.1)';
    customWrap.style.border = selColorEditCustom ? '2px solid rgba(255,255,255,0.75)' : '2px dashed rgba(14,207,207,0.4)';
    customWrap.style.cssText += ';display:flex;align-items:center;justify-content:center;';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = selColorEditCustom || selColorEdit.hex || '#0ecfcf';
    colorInput.style.cssText = 'position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;';
    colorInput.addEventListener('input', e => {
        selColorEditCustom = e.target.value;
        selColorEdit = colorFromHex(e.target.value);
        buildColorPickerEdit();
    });
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-palette';
    icon.style.cssText = 'font-size:16px;color:rgba(14,207,207,0.7);pointer-events:none;position:relative;z-index:1;';
    if (selColorEditCustom) icon.style.color = selColorEditCustom;
    customWrap.style.position = 'relative';
    customWrap.appendChild(colorInput);
    customWrap.appendChild(icon);
    cp.appendChild(customWrap);
}

function saveEditCat() {
    const name = document.getElementById('editCatName').value.trim(); if (!name) return;
    const idx = cats.findIndex(c => c.id === editingCatId); if (idx === -1) return;
    cats[idx] = { ...cats[idx], name, color: selColorEdit };
    svCats(); renderCatTags(); renderPopCats(); renderAll(); closeEditCatModal();
}

function deleteEditCat() {
    if (!editingCatId) return;
    const evCount = evs.filter(e => e.c === editingCatId).length;
    if (evCount > 0) {
        const fallback = cats.find(c => c.id !== editingCatId);
        if (fallback) evs = evs.map(e => e.c === editingCatId ? {...e, c: fallback.id} : e);
        svEvs();
    }
    cats = cats.filter(c => c.id !== editingCatId);
    svCats(); renderCatTags(); renderPopCats(); renderAll(); closeEditCatModal();
}

document.getElementById('editCatModal').addEventListener('click', function(e) { if (e.target === this) closeEditCatModal(); });

/* ═══════════════════════════════════════════════════
   TIME PICKER — FIX SCROLL
   Il problema era che scrollTop veniva impostato prima
   che il DOM fosse visibile. Ora usiamo requestAnimationFrame
   e scrollIntoView per centrare l'elemento selezionato.
   ═══════════════════════════════════════════════════ */
const timePickers = { SH:0, SM:0, EH:1, EM:0 };
const ITEM_H = 46; // altezza singolo item in px

function buildTimeCols() {
    buildCol('colSH', 24, 'SH');
    buildCol('colSM', 60, 'SM');
    buildCol('colEH', 24, 'EH');
    buildCol('colEM', 60, 'EM');
}

function buildCol(colId, count, key) {
    const col = document.getElementById(colId); col.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'time-item';
        item.textContent = String(i).padStart(2,'0');
        item.dataset.val = i;
        item.addEventListener('click', () => selectTimeItem(colId, key, i));
        col.appendChild(item);
    }
}

/* FIX: usa scrollIntoView con block:'center' per portare
   l'elemento selezionato al centro del pannello visibile */
function scrollToSelected(colId, val) {
    const col = document.getElementById(colId);
    if (!col) return;
    const wrap = col.parentElement;
    if (!wrap) return;
    // Imposta lo scroll direttamente sul wrap
    const targetScroll = val * ITEM_H - (wrap.clientHeight / 2 - ITEM_H / 2);
    wrap.scrollTop = Math.max(0, targetScroll);
}

function selectTimeItem(colId, key, val) {
    timePickers[key] = val;
    const col = document.getElementById(colId);
    col.querySelectorAll('.time-item').forEach(el =>
        el.classList.toggle('sel', parseInt(el.dataset.val) === val)
    );
    scrollToSelected(colId, val);

    if (key === 'SH' || key === 'SM') enforceEndAfterStart();

    if (key === 'EH' || key === 'EM') {
        const sameDate = document.getElementById('pS').value === document.getElementById('pE').value;
        const startMins = timePickers.SH * 60 + timePickers.SM;
        const endMins   = timePickers.EH * 60 + timePickers.EM;
        if (sameDate && endMins <= startMins) {
            const fixedMins = Math.min(startMins + 30, 23 * 60 + 59);
            _setPickerSilent('colEH', 'EH', Math.floor(fixedMins / 60));
            _setPickerSilent('colEM', 'EM', fixedMins % 60);
            showWarning();
            setTimeout(hideWarning, 2200);
        } else { hideWarning(); }
        enforceEndAfterStart();
    }
}

function enforceEndAfterStart() {
    const sameDate = document.getElementById('pS').value === document.getElementById('pE').value;
    const colEH = document.getElementById('colEH'), colEM = document.getElementById('colEM');
    if (!sameDate) {
        if (colEH) colEH.querySelectorAll('.time-item').forEach(el => el.classList.remove('time-disabled'));
        if (colEM) colEM.querySelectorAll('.time-item').forEach(el => el.classList.remove('time-disabled'));
        hideWarning(); return;
    }
    if (colEH) colEH.querySelectorAll('.time-item').forEach(el => {
        el.classList.toggle('time-disabled', parseInt(el.dataset.val) < timePickers.SH);
    });
    if (colEM) colEM.querySelectorAll('.time-item').forEach(el => {
        const sameHour = timePickers.EH === timePickers.SH;
        el.classList.toggle('time-disabled', sameHour && parseInt(el.dataset.val) <= timePickers.SM);
    });
}

function _setPickerSilent(colId, key, val) {
    timePickers[key] = val;
    const col = document.getElementById(colId); if (!col) return;
    col.querySelectorAll('.time-item').forEach(el =>
        el.classList.toggle('sel', parseInt(el.dataset.val) === val)
    );
    // FIX: usa rAF per aspettare che il DOM sia pronto prima di scrollare
    requestAnimationFrame(() => scrollToSelected(colId, val));
}

function applyTimeDefaults() {
    const now = new Date();
    const nextH  = (now.getHours() + 1) % 24;
    const afterH = (now.getHours() + 2) % 24;
    _setPickerSilent('colSH', 'SH', nextH);
    _setPickerSilent('colSM', 'SM', 0);
    _setPickerSilent('colEH', 'EH', afterH);
    _setPickerSilent('colEM', 'EM', 0);
    enforceEndAfterStart();
    hideWarning();
}

function getTimeFromPicker(hKey, mKey) {
    return `${String(timePickers[hKey]).padStart(2,'0')}:${String(timePickers[mKey]).padStart(2,'0')}`;
}

function setPickerFromTime(hKey, mKey, timeStr) {
    if (!timeStr) return;
    const [h, m] = timeStr.split(':').map(Number);
    _setPickerSilent('col' + hKey, hKey, h || 0);
    _setPickerSilent('col' + mKey, mKey, m || 0);
    if (mKey === 'EM') enforceEndAfterStart();
}

function onAlldayChange() {
    const isAll = document.getElementById('chkAllDay').checked;
    document.getElementById('timeSelWrap').style.display = isAll ? 'none' : 'flex';
    if (isAll) hideWarning();
}

function isEndValid() {
    const sameDate = document.getElementById('pS').value === document.getElementById('pE').value;
    if (!sameDate) return true;
    return (timePickers.EH * 60 + timePickers.EM) > (timePickers.SH * 60 + timePickers.SM);
}

function showWarning() { document.getElementById('timeWarning').classList.add('visible'); }
function hideWarning() { const w = document.getElementById('timeWarning'); if (w) w.classList.remove('visible'); }

/* ── MOBILE: swipe per chiudere popup, tap outside ── */
(function setupMobile() {
    let startY = 0, startX = 0;
    const popup = document.getElementById('popup');

    popup.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    }, { passive: true });

    popup.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - startY;
        const dx = Math.abs(e.changedTouches[0].clientX - startX);
        if (dy > 80 && dx < 50) closeP(); // swipe down
    }, { passive: true });

    // Time picker: touch scroll (il browser scroll nativo funziona con overflow-y:auto)
    // Aggiungiamo listener per aggiornare la selezione dopo lo scroll
    ['colSH','colSM','colEH','colEM'].forEach(colId => {
        const colEl = document.getElementById(colId);
        if (!colEl) return;
        const wrap = colEl.parentElement;
        if (!wrap) return;
        let scrollTimer = null;
        wrap.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const idx = Math.round(wrap.scrollTop / ITEM_H);
                const key = colId.replace('col','');
                if (timePickers[key] !== idx) selectTimeItem(colId, key, idx);
            }, 120);
        }, { passive: true });
    });
})();

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeP(); closeCatModal(); closeEditCatModal(); ctrlDays = [];
        document.querySelectorAll('.ctrl-hover').forEach(el => el.classList.remove('ctrl-hover'));
    }
});

/* ── BOOT ── */
renderCatTags();
renderMini();
renderMain();
renderSidebar();
buildTimeCols();

/* ── CARICA VOTI DAL DB ── */
(async function caricaVotiNelCalendario() {
    const VOTO_CAT = {
        id:    'voti_cat',
        name:  'Voti',
        color: { hex: '#f7b432', bg: 'rgba(247,180,50,0.15)', text: '#f7d080' }
    };
    try {
        const res = await fetch('../../../database/model/get_voti.php');
        if (!res.ok) return;
        const testo = await res.text();
        let votiDB;
        try { votiDB = JSON.parse(testo); } catch(e) { return; }
        if (!Array.isArray(votiDB) || votiDB.length === 0) return;
        if (!cats.find(c => c.id === VOTO_CAT.id)) { cats.push(VOTO_CAT); svCats(); }
        evs = evs.filter(e => !String(e.id).startsWith('voto_'));
        votiDB.forEach(v => {
            if (!v.data) return;
            evs.push({ id:'voto_'+v.id, ti:v.materia+' — '+parseFloat(v.voto), s:v.data, e:v.data, st:null, et:null, c:VOTO_CAT.id });
        });
        svEvs(); renderAll();
    } catch(e) { console.error('[CALENDARIO] Errore:', e); }
})();
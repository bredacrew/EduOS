// ── PROFILO ──
function settingsShowTab(name, el) {
    document.querySelectorAll('.settings-tab').forEach(function (t) {
        t.style.display = 'none';
    });
    document.querySelectorAll('.settings-nav-item').forEach(function (n) {
        n.classList.remove('active');
    });
    document.getElementById('stab-' + name).style.display = 'block';
    el.classList.add('active');
}

(function () {

    // ── Carica dati utente dalla sessione ──
    async function caricaUtente() {
        try {
            const res = await fetch('../../../database/model/get_user.php');
            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const user = await res.json();
            if (user.error) return;

            // Greeting
            const ora = new Date().getHours();
            let saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
            const greetingEl = document.querySelector('.greeting-text h1');
            if (greetingEl) greetingEl.textContent = saluto + ', ' + (user.Nome || '');

            // Profile card
            const profileNome = document.getElementById('profileNome');
            const profileCognome = document.getElementById('profileCognome');
            const profileData = document.getElementById('profileData');
            if (profileNome) profileNome.textContent = (user.Nome || '').toUpperCase();
            if (profileCognome) profileCognome.textContent = (user.Cognome || '').toUpperCase();
            if (profileData && user.DataNascita) {
                const parti = user.DataNascita.split('-');
                profileData.textContent = parti[2] + '/' + parti[1] + '/' + parti[0];
            }

            // Settings panel
            const avatarStrong = document.querySelector('.settings-avatar-info strong');
            if (avatarStrong) avatarStrong.textContent = (user.Nome || '') + ' ' + (user.Cognome || '');

            // Pre-compila i campi del form impostazioni
            const inputNome = document.querySelector('#stab-profilo input[placeholder="Inserisci nome"]');
            const inputCognome = document.querySelector('#stab-profilo input[placeholder="Inserisci cognome"]');
            const inputEmail = document.querySelector('#stab-profilo input[placeholder="email@esempio.com"]');
            const inputData = document.getElementById('inputDataNascita');
            if (inputNome) inputNome.value = user.Nome || '';
            if (inputCognome) inputCognome.value = user.Cognome || '';
            if (inputEmail) inputEmail.value = user.Email || '';
            if (inputData) inputData.value = user.DataNascita || '';

            // Avatar
            if (user.AvatarUrl) {
                impostaAvatar(user.AvatarUrl);
            }

        } catch (err) {
            console.error('Errore caricamento utente:', err);
        }
    }

    function impostaAvatar(src) {
        const imgStyle = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';
        const avatarLg = document.querySelector('.avatar-lg');
        const avatarRingEl = document.getElementById('topbar-avatar');
        const avatarImg = document.getElementById('settingsAvatarImg');
        const avatarIcon = document.getElementById('settingsAvatarIcon');

        // Cache-busting per forzare ricarica immagine
        const srcBusted = src + '?t=' + Date.now();

        if (avatarLg) avatarLg.innerHTML = '<img src="' + srcBusted + '" style="' + imgStyle + '" />';
        if (avatarRingEl) avatarRingEl.innerHTML = '<img src="' + srcBusted + '" style="' + imgStyle + '" />';
        if (avatarImg) {
            avatarImg.src = srcBusted;
            avatarImg.style.display = 'block';
        }
        if (avatarIcon) avatarIcon.style.display = 'none';
    }

    caricaUtente();

    // ── Overlay impostazioni ──
    const avatarRing = document.querySelector('.avatar-ring');
    if (avatarRing) {
        avatarRing.addEventListener('click', function () {
            document.getElementById('settingsOverlay').classList.add('open');
        });
        avatarRing.style.cursor = 'pointer';
    }

    document.getElementById('settingsCloseBtn').addEventListener('click', function () {
        document.getElementById('settingsOverlay').classList.remove('open');
    });

    document.getElementById('settingsOverlay').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('open');
    });

    // ── Carica immagine profilo (anteprima) ──
    const uploadBtn = document.getElementById('uploadAvatarBtn');
    const fileInput = document.getElementById('avatarFileInput');
    const avatarImg = document.getElementById('settingsAvatarImg');
    const avatarIcon = document.getElementById('settingsAvatarIcon');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarImg.src = e.target.result;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    // ── Salva modifiche profilo ──
    const saveBtn = document.querySelector('.settings-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            const nome = document.querySelector('#stab-profilo input[placeholder="Inserisci nome"]').value.trim();
            const cognome = document.querySelector('#stab-profilo input[placeholder="Inserisci cognome"]').value.trim();
            const email = document.querySelector('#stab-profilo input[placeholder="email@esempio.com"]').value.trim();
            const data = document.getElementById('inputDataNascita')?.value || '';
            const file = fileInput?.files[0];

            const formData = new FormData();
            if (nome) formData.append('nome', nome);
            if (cognome) formData.append('cognome', cognome);
            if (email) formData.append('email', email);
            if (data) formData.append('data_nascita', data);
            if (file) formData.append('avatar', file);

            try {
                const res = await fetch('/database/save_user.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();

                if (result.error) {
                    alert('Errore: ' + result.error);
                    return;
                }

                // Aggiorna UI
                const h3 = document.getElementById('profileNome');
                const p = document.getElementById('profileCognome');
                const dataEl = document.getElementById('profileData');

                if (nome && h3) h3.textContent = nome.toUpperCase();
                if (cognome && p) p.textContent = cognome.toUpperCase();
                if (data && dataEl) {
                    const parti = data.split('-');
                    dataEl.textContent = parti[2] + '/' + parti[1] + '/' + parti[0];
                }

                const greetingEl = document.querySelector('.greeting-text h1');
                if (nome && greetingEl) {
                    const ora = new Date().getHours();
                    let saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
                    greetingEl.textContent = saluto + ', ' + nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
                }

                if (result.avatarUrl) impostaAvatar(result.avatarUrl);

                document.getElementById('settingsOverlay').classList.remove('open');

            } catch (err) {
                alert('Errore di connessione al server.');
                console.error(err);
            }
        });
    }

    // ── Dropdown profilo topbar ──
    const profileTrigger = document.getElementById('profile-dropdown-trigger');
    const profileDropdown = document.getElementById('topbar-profile-dropdown');

    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileTrigger.classList.toggle('open');
        profileDropdown.classList.toggle('open');
    });

    document.getElementById('openSettingsFromDropdown').addEventListener('click', () => {
        document.getElementById('settingsOverlay').classList.add('open');
        profileDropdown.classList.remove('open');
        profileTrigger.classList.remove('open');
    });

    // ── Dropdown statistiche ──
    const statsRangeBtn  = document.getElementById('stats-range-btn');
    const statsDropdown  = document.getElementById('stats-dropdown');
    const statsViewLabel = document.getElementById('stats-view-label');

    // ── Grafico voti ──
    let statsChart    = null;
    let statsVotiData = [];   // voti caricati dal DB
    let statsView     = 'voti';

    const MATERIE_COLORS = [
        'rgba(14,207,207,0.85)',
        'rgba(100,180,255,0.85)',
        'rgba(180,100,255,0.85)',
        'rgba(255,160,80,0.85)',
        'rgba(80,220,140,0.85)',
        'rgba(255,100,130,0.85)',
    ];

    function buildChartVoti(voti) {
        // Ultimi 8 voti ordinati per data
        const sorted = [...voti]
            .filter(v => v.data)
            .sort((a, b) => a.data.localeCompare(b.data))
            .slice(-8);

        const labels = sorted.map(v => v.materia);
        const data   = sorted.map(v => v.voto);
        const colors = sorted.map((_, i) => MATERIE_COLORS[i % MATERIE_COLORS.length]);

        return {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Voto',
                    data,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.85', '1')),
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
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
                        callbacks: { label: ctx => ' Voto: ' + ctx.parsed.y }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(14,207,207,0.06)' },
                        ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 12 } }
                    },
                    y: {
                        min: 0, max: 10,
                        grid: { color: 'rgba(14,207,207,0.08)' },
                        ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 12 }, stepSize: 2 }
                    }
                }
            }
        };
    }

    function buildChartMedia(voti) {
        const map = {};
        voti.forEach(v => {
            if (!map[v.materia]) map[v.materia] = [];
            map[v.materia].push(v.voto);
        });
        const labels = Object.keys(map).sort();
        const data   = labels.map(m => {
            const arr = map[m];
            return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
        });
        const colors = labels.map((_, i) => MATERIE_COLORS[i % MATERIE_COLORS.length]);

        return {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Media',
                    data,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.85', '1')),
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
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
                        callbacks: { label: ctx => ' Media: ' + ctx.parsed.y }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(14,207,207,0.06)' },
                        ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 12 } }
                    },
                    y: {
                        min: 0, max: 10,
                        grid: { color: 'rgba(14,207,207,0.08)' },
                        ticks: { color: '#5a9aa8', font: { family: "'Rajdhani', sans-serif", size: 12 }, stepSize: 2 }
                    }
                }
            }
        };
    }

    function renderStatsChart() {
        const canvas = document.getElementById('statsChart');
        if (!canvas) return;

        if (statsChart) { statsChart.destroy(); statsChart = null; }

        // ── Media totale ──
        const mediaEl = document.getElementById('statsMediaTotale');
        if (mediaEl) {
            if (statsVotiData.length === 0) {
                mediaEl.textContent = '—';
                mediaEl.className   = '';
            } else {
                const mg = statsVotiData.reduce((s, v) => s + v.voto, 0) / statsVotiData.length;
                mediaEl.textContent = mg.toFixed(1);
                mediaEl.className   = mg >= 6 ? 'stats-media-ok' : mg >= 5 ? 'stats-media-rischio' : 'stats-media-bassa';
            }
        }

        if (statsVotiData.length === 0) return;

        const cfg = statsView === 'media'
            ? buildChartMedia(statsVotiData)
            : buildChartVoti(statsVotiData);

        Chart.defaults.color = '#5a9aa8';
        statsChart = new Chart(canvas, cfg);
    }

    // Carica voti dal DB e disegna il grafico
    async function loadStatsChart() {
        try {
            const res = await fetch('../../../database/model/get_voti.php');
            if (res.status === 401) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                // Forza i voti a numeri (dal DB arrivano come stringhe)
                statsVotiData = data.map(v => ({ ...v, voto: parseFloat(v.voto) }));
                syncVotiCalendario(statsVotiData);
            }
        } catch (e) {
            console.error('Errore caricamento voti per statistiche:', e);
        }
        renderStatsChart();
    }

    // ── Sincronizzazione voti → calendario (condivisa con voti.js) ──
    function syncVotiCalendario(votiAggiornati) {
        const VOTO_CAT = {
            id:    'voti_cat',
            name:  'Voti',
            color: { hex: '#f7b432', bg: 'rgba(247,180,50,0.15)', text: '#f7d080' }
        };

        let evs  = [];
        let cats = [];
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
                ti: `${v.materia} — ${v.voto}`,
                s:  v.data,
                e:  v.data,
                st: null,
                et: null,
                c:  VOTO_CAT.id
            });
        });

        localStorage.setItem('eduos_events', JSON.stringify(evs));

        // Aggiorna la lista eventi nel mini-calendario della homepage
        // (render() è definita nel blocco CALENDARIO più in basso)
        if (typeof renderEventsHP === 'function') renderEventsHP();
    }

    loadStatsChart();

    statsRangeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        statsRangeBtn.classList.toggle('open');
        statsDropdown.classList.toggle('open');
    });

    document.querySelectorAll('.stats-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.stats-menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            statsViewLabel.textContent = item.textContent.trim().toUpperCase();
            statsRangeBtn.classList.remove('open');
            statsDropdown.classList.remove('open');
            statsView = item.dataset.view;
            renderStatsChart();
        });
    });

    // ── Chiudi tutti i dropdown al click fuori ──
    document.addEventListener('click', () => {
        profileTrigger.classList.remove('open');
        profileDropdown.classList.remove('open');
        statsRangeBtn.classList.remove('open');
        statsDropdown.classList.remove('open');
    });

})();



// ── CALENDARIO ──
(function(){
    const GG=['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
    const GGS=['L','M','M','G','V','S','D'];
    const MM=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
    const MMS=['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

    const oggi=new Date();
    let view='week';
    let sel=null;
    let nav=new Date(oggi);
    const eventi=[];

    // dropdown
    const db = document.getElementById('cal-range-btn');
    const dm = document.getElementById('cal-dropdown');
    const dl = document.getElementById('cal-view-label');
    db.addEventListener('click',e=>{e.stopPropagation();const o=dm.classList.toggle('open');db.classList.toggle('open',o);});
    document.addEventListener('click',()=>{dm.classList.remove('open');db.classList.remove('open');});
    dm.querySelectorAll('.cal-menu-item').forEach(it=>{
        it.addEventListener('click',e=>{
            e.stopPropagation();
            dm.querySelectorAll('.cal-menu-item').forEach(x=>x.classList.remove('active'));
            it.classList.add('active');
            view=it.dataset.view;
            dl.textContent=it.textContent.trim().toUpperCase();
            dm.classList.remove('open');db.classList.remove('open');
            sel=null;nav=new Date(oggi);render();
        });
    });

    function setView(v,date){
        view=v;nav=date?new Date(date):new Date(oggi);
        dl.textContent=v==='week'?'SETTIMANA':v==='month'?'MESE':'ANNO';
        dm.querySelectorAll('.cal-menu-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
        render();
    }

    function getLun(d){const dow=d.getDay(),diff=dow===0?-6:1-dow,l=new Date(d);l.setDate(d.getDate()+diff);return l;}
    function sameDay(a,b){return a&&b&&a.toDateString()===b.toDateString();}

    function makeDn(d,extra){
        const isT=d.toDateString()===oggi.toDateString();
        const isS=sameDay(d,sel);
        let c='cal-day-num';
        if(isT)c+=' today';
        if(isS&&!isT)c+=' selected';
        if(extra)c+=' '+extra;
        const el=document.createElement('div');
        el.className=c;el.textContent=d.getDate();
        el.addEventListener('click',()=>{
            if(view==='month'){
                sel=new Date(d);
                nav=new Date(d);
                setView('week',d);
                return;
            }
            sel=sameDay(d,sel)?null:new Date(d);
            render();
        });
        return el;
    }

    function renderWeek(){
        document.querySelector('.cal-inner').classList.remove('year-view');
        const vc=document.getElementById('mini-calendar');vc.innerHTML='';
        const lun=getLun(nav);
        const days=Array.from({length:7},(_,i)=>{const dd=new Date(lun);dd.setDate(lun.getDate()+i);return dd;});
        const fine=days[6];

        // nav row
        const nr=document.createElement('div');nr.className='cal-nav-row';
        const label=lun.getMonth()===fine.getMonth()
            ?`${lun.getDate()} – ${fine.getDate()} ${MMS[lun.getMonth()]} ${lun.getFullYear()}`
            :`${lun.getDate()} ${MMS[lun.getMonth()]} – ${fine.getDate()} ${MMS[fine.getMonth()]} ${fine.getFullYear()}`;
        nr.innerHTML=`<button class="cal-nav-btn" id="pw">&#8249;</button><span class="cal-nav-label">${label}</span><button class="cal-nav-btn" id="nw">&#8250;</button>`;
        vc.appendChild(nr);

        // header giorni
        const gh=document.createElement('div');gh.className='cal-grid-header';
        GG.forEach(g=>{const s=document.createElement('div');s.className='cal-day-label';s.textContent=g;gh.appendChild(s);});
        vc.appendChild(gh);

        // celle giorni
        const gb=document.createElement('div');gb.className='cal-grid-body';
        days.forEach(d=>gb.appendChild(makeDn(d)));
        vc.appendChild(gb);

        document.getElementById('pw').addEventListener('click',()=>{nav.setDate(nav.getDate()-7);render();});
        document.getElementById('nw').addEventListener('click',()=>{nav.setDate(nav.getDate()+7);render();});
    }

    function renderMonth(){
        document.querySelector('.cal-inner').classList.remove('year-view');
        const vc=document.getElementById('mini-calendar');vc.innerHTML='';
        const y=nav.getFullYear(),m=nav.getMonth();

        const nr=document.createElement('div');nr.className='cal-nav-row';
        nr.innerHTML=`<button class="cal-nav-btn" id="pm">&#8249;</button><span class="cal-nav-label">${MM[m]} ${y}</span><button class="cal-nav-btn" id="nm">&#8250;</button>`;
        vc.appendChild(nr);

        const gh=document.createElement('div');gh.className='cal-grid-header';
        GG.forEach(g=>{const s=document.createElement('div');s.className='cal-day-label';s.textContent=g;gh.appendChild(s);});
        vc.appendChild(gh);

        const gb=document.createElement('div');gb.className='cal-grid-body';
        const first=new Date(y,m,1),last=new Date(y,m+1,0);
        const off=first.getDay()===0?6:first.getDay()-1;
        for(let i=0;i<off;i++){const p=new Date(y,m,1-off+i);gb.appendChild(makeDn(p,'other-month'));}
        for(let d=1;d<=last.getDate();d++)gb.appendChild(makeDn(new Date(y,m,d)));
        const tot=off+last.getDate(),rem=tot%7===0?0:7-(tot%7);
        for(let i=1;i<=rem;i++)gb.appendChild(makeDn(new Date(y,m+1,i),'other-month'));
        vc.appendChild(gb);

        document.getElementById('pm').addEventListener('click',()=>{nav.setMonth(nav.getMonth()-1);render();});
        document.getElementById('nm').addEventListener('click',()=>{nav.setMonth(nav.getMonth()+1);render();});

        document.getElementById('no-events').style.display='none';
        document.getElementById('events-list').innerHTML='';
        document.querySelector('.events-label') && (document.querySelector('.events-label').style.display='none');
        return true;
    }

    function miniMonth(y,m){
        const wrap=document.createElement('div');wrap.className='cal-mini-grid';
        GGS.forEach(g=>{const h=document.createElement('div');h.className='cal-mini-header';h.textContent=g;wrap.appendChild(h);});
        const first=new Date(y,m,1),last=new Date(y,m+1,0);
        const off=first.getDay()===0?6:first.getDay()-1;
        for(let i=0;i<off;i++){const e=document.createElement('div');e.className='cal-mini-day other-mini';e.textContent='';wrap.appendChild(e);}
        for(let d=1;d<=last.getDate();d++){
            const e=document.createElement('div');
            const isT=oggi.getFullYear()===y&&oggi.getMonth()===m&&oggi.getDate()===d;
            e.className='cal-mini-day'+(isT?' today-mini':'');
            e.textContent=d;
            wrap.appendChild(e);
        }
        return wrap;
    }

    function renderYear(){
        document.querySelector('.cal-inner').classList.add('year-view');
        const vc=document.getElementById('mini-calendar');vc.innerHTML='';
        const y=nav.getFullYear();

        const nr=document.createElement('div');nr.className='cal-nav-row';
        nr.innerHTML=`<button class="cal-nav-btn" id="py">&#8249;</button><span class="cal-nav-label">${y}</span><button class="cal-nav-btn" id="ny">&#8250;</button>`;
        vc.appendChild(nr);

        const yg=document.createElement('div');yg.className='cal-year-grid';
        for(let m=0;m<12;m++){
            const card=document.createElement('div');
            const isCM=oggi.getFullYear()===y&&oggi.getMonth()===m;
            card.className='cal-month-card'+(isCM?' current-month':'');
            const title=document.createElement('div');title.className='cal-month-card-title';title.textContent=MMS[m];
            card.appendChild(title);
            card.appendChild(miniMonth(y,m));
            card.addEventListener('click',()=>{nav=new Date(y,m,1);setView('month',new Date(y,m,1));});
            yg.appendChild(card);
        }
        vc.appendChild(yg);

        document.getElementById('py').addEventListener('click',()=>{nav.setFullYear(nav.getFullYear()-1);render();});
        document.getElementById('ny').addEventListener('click',()=>{nav.setFullYear(nav.getFullYear()+1);render();});

        // nascondi eventi in vista anno
        document.getElementById('no-events').style.display='none';
        document.getElementById('events-list').innerHTML='';
        document.querySelector('.events-label') && (document.querySelector('.events-label').style.display='none');
        return true;
    }

    function renderEvents() {
        document.querySelector('.events-label') && (document.querySelector('.events-label').style.display = '');
        const listaEl = document.getElementById('events-list');
        const nessunoEl = document.getElementById('no-events');
        listaEl.innerHTML = '';

        // Legge gli eventi salvati dal calendario
        let allEvs = [];
        try {
            const raw = localStorage.getItem('eduos_events');
            if (raw) allEvs = JSON.parse(raw);
        } catch(e) {}

        // Filtra per settimana corrente o giorno selezionato
        let rel;
        if (sel) {
            const selStr = [sel.getFullYear(), String(sel.getMonth()+1).padStart(2,'0'), String(sel.getDate()).padStart(2,'0')].join('-');
            rel = allEvs.filter(ev => ev.s <= selStr && ev.e >= selStr);
        } else {
            // Settimana corrente
            const lun = getLun(nav);
            const dom = new Date(lun); dom.setDate(lun.getDate() + 6);
            const lunStr = lun.toISOString().slice(0,10);
            const domStr = dom.toISOString().slice(0,10);
            rel = allEvs.filter(ev => ev.s <= domStr && ev.e >= lunStr);
        }

        if (rel.length === 0) {
            nessunoEl.style.display = 'block';
            nessunoEl.textContent = sel ? 'Nessun evento questo giorno' : 'Nessun evento questa settimana';
        } else {
            nessunoEl.style.display = 'none';
            rel.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'event-item';
                // Colore: usa ev.c per trovare la categoria
                let color = '#0ecfcf';
                try {
                    const cats = JSON.parse(localStorage.getItem('eduos_categories') || '[]');
                    const cat = cats.find(c => c.id === ev.c);
                    if (cat && cat.color && cat.color.hex) color = cat.color.hex;
                } catch(e) {}
                const tempo = ev.st ? `${ev.st}${ev.et ? ' – ' + ev.et : ''}` : 'Tutto il giorno';
                item.innerHTML = `
                <div class="event-dot" style="background:${color};box-shadow:0 0 6px ${color}99;"></div>
                <div class="event-info">
                    <div class="event-name">${ev.ti}</div>
                    <div class="event-time">${tempo}</div>
                </div>`;
                listaEl.appendChild(item);
            });
        }
    }

    function render(){
        if(view==='week'){renderWeek();renderEvents();}
        else if(view==='month'){renderMonth();}
        else{renderYear();}
    }

    // Esposta globalmente per essere richiamata dopo sync voti
    window.renderEventsHP = renderEvents;

    render();
})();
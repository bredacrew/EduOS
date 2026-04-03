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

    render();
})();
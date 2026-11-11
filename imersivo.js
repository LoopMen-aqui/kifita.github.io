/* Kifita · cenas imersivas guiadas pela rolagem:
   1. Mergulho (#voo): a câmera atravessa fotos e palavras em 3D.
   2. Origem (#origem): fotos de infância e formação reveladas como tinta.
   3. Bastidores (#bastidores): trilho lateral em perspectiva com o vídeo de set.
   4. Entradas ao rolar, paralaxe leve nos projetos e barra de progresso em película. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // o CSS mostra tudo estático
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let vw=innerWidth, vh=innerHeight, sy=scrollY, lastSy=sy, vel=0;

  /* ---------- 1. MERGULHO ---------- */
  const voo=document.getElementById('voo'), space=document.getElementById('voo-space');
  const tc=document.getElementById('voo-tc'), vStage=voo&&voo.querySelector('.voo__stage');
  const grid=voo&&voo.querySelector('.voo__grid');
  const items=space?[...space.children].map(el=>({el, z:+el.dataset.z, x:+el.dataset.x, y:+el.dataset.y, w:+(el.dataset.w||0), word:el.classList.contains('voo__w'), last:el.classList.contains('voo__l--wide')})):[];
  const ZMAX=4400, TRAVEL=ZMAX-380;
  function sizeVoo(){ const phone=vw<700; items.forEach(it=>{ if(!it.word){ const w=Math.min(vw*(phone?Math.min(it.w*1.55,it.last?84:46):it.w)/100, it.last?1100:640); it.el.style.width=w+'px'; } it.h=it.el.offsetHeight; it.wd=it.el.offsetWidth; }); }
  function drawVoo(){
    if(!voo) return;
    const r=voo.getBoundingClientRect(), span=voo.offsetHeight-vh, p=clamp(-r.top/span,0,1);
    if(r.bottom<0||r.top>vh) return;
    const C=p*TRAVEL, phone=vw<700, end=clamp((p-.86)/.12,0,1);
    vStage.style.setProperty('--p',p.toFixed(4)); vStage.style.setProperty('--end',end.toFixed(3));
    grid.style.setProperty('--gy',(C*0.35%80).toFixed(1)+'px');
    const g=clamp(vel*0.35,-14,14);
    items.forEach(it=>{
      const z=it.z+C; let op=1;
      if(z>120) op=clamp(1-(z-120)/260,0,1);
      if(z<-2400) op=clamp(1-(-z-2400)/1400,0,1);
      op*= it.last ? 1-.55*end : 1-end;
      const X=(it.word||it.last?it.x:(phone?it.x*.75:it.x*1.22))/100*vw, Y=(phone&&!it.word?it.y*1.6+(it.y>=0?8:-8)*(it.last?0:1):it.y)/100*vh;
      it.el.style.transform=`translate3d(${(X-it.wd/2).toFixed(1)}px,${(Y-it.h/2).toFixed(1)}px,${z.toFixed(1)}px)`;
      if(!it.word&&!it.last){ const near=items.some(w=>w.word&&Math.abs((w.z+C)-z)<420&&(w.z+C)>-1400); if(near) op*=0.55; }
      it.el.style.opacity=op.toFixed(3);
      it.el.style.visibility=op<0.01?'hidden':'visible';
      if(it.word) it.el.style.setProperty('--gx',g.toFixed(1)+'px');
    });
    const secs=p*42, f=Math.floor((secs%1)*24), pad=n=>String(n).padStart(2,'0');
    if(tc) tc.textContent='00:00:'+pad(Math.floor(secs))+':'+pad(f);
  }

  /* ---------- 2. ORIGEM ---------- */
  const ori=document.getElementById('origem');
  const frames=ori?[...ori.querySelectorAll('.ori__f')]:[], txts=ori?[...ori.querySelectorAll('.ori__txt li')]:[];
  const bar=document.getElementById('ori-bar');
  // borda irregular de tinta, fixa por quadro
  const seeds=frames.map((_,i)=>{ let s=(i+1)*9301; return Array.from({length:28},()=>{ s=(s*9301+49297)%233280; return s/233280; }); });
  const rots=[-2.5,1.8,-1.2,2.4,-1.6];
  function blob(i,t){
    if(t>=1) return 'none';
    const R=t*95, n=seeds[i], pts=[];
    for(let k=0;k<n.length;k++){ const a=k/n.length*Math.PI*2, rr=R*(0.82+n[k]*0.36); pts.push((50+Math.cos(a)*rr).toFixed(1)+'% '+(50+Math.sin(a)*rr*1.1).toFixed(1)+'%'); }
    return 'polygon('+pts.join(',')+')';
  }
  function drawOri(){
    if(!ori) return;
    const r=ori.getBoundingClientRect(), span=ori.offsetHeight-vh, p=clamp(-r.top/span,0,1);
    if(r.bottom<0||r.top>vh) return;
    const N=frames.length, seg=p*N, k=Math.min(N-1,Math.floor(seg)), t=seg-k;
    frames.forEach((f,i)=>{
      let reveal = i<k?1 : i===k ? clamp(t/.55,0,1) : 0;
      if(i===0 && k===0) reveal=Math.max(reveal,.0001);
      f.style.setProperty('--clip', reveal>=1?'none':blob(i,reveal));
      f.style.clipPath = reveal>=1?'none':blob(i,reveal);
      f.style.setProperty('--rot',rots[i%rots.length]+'deg');
      f.style.setProperty('--gs',(1-clamp((reveal-.6)/.4,0,1)).toFixed(3));
      f.style.setProperty('--sc',(1.06-.06*reveal).toFixed(3));
      f.style.zIndex=i;
    });
    txts.forEach((li,i)=>li.classList.toggle('on',i===k));
    if(bar) bar.style.setProperty('--p',p.toFixed(4));
  }

  /* ---------- 3. BASTIDORES ---------- */
  const bt=document.getElementById('bastidores'), track=document.getElementById('bt-track'), btBar=document.getElementById('bt-bar');
  const cards=track?[...track.children]:[]; const vids=bt?[...bt.querySelectorAll('video')]:[];
  let trackW=0, btIn=false;
  function sizeBt(){ if(!bt) return; trackW=track.scrollWidth; const extra=Math.max(0,trackW-vw+Math.max(16,(vw-1180)/2)); bt.style.height=(vh+extra*1.1)+'px'; bt._extra=extra; }
  function drawBt(){
    if(!bt) return;
    const r=bt.getBoundingClientRect(), span=bt.offsetHeight-vh, p=span>0?clamp(-r.top/span,0,1):0;
    const visible=r.bottom>0&&r.top<vh;
    if(visible!==btIn){ btIn=visible; vids.forEach(v=>{ if(visible) v.play().catch(()=>{}); else v.pause(); }); }
    if(!visible) return;
    track.style.transform=`translate3d(${(-p*bt._extra).toFixed(1)}px,0,0)`;
    cards.forEach(c=>{ const b=c.getBoundingClientRect(); const d=((b.left+b.width/2)-vw/2)/vw;
      c.style.setProperty('--ry',(clamp(d,-1,1)*-38).toFixed(2)+'deg'); c.style.setProperty('--tz',(-Math.abs(d)*220).toFixed(1)+'px'); c.style.setProperty('--sat',(1-clamp(Math.abs(d),0,1)*.7).toFixed(2)); });
    if(btBar) btBar.style.setProperty('--p',p.toFixed(4));
  }

  /* ---------- 4. entradas, paralaxe e progresso ---------- */
  document.documentElement.classList.add('rv');
  const ups=document.querySelectorAll('.sala-copy,.polaroid,.sobre .bio,.facts,.p-text,.job,.course,.cert-grid,.hours-line,.il-card,.ticks li,.ccard,.tv-head,.em-head,.bc-head,.form-list,.contato-in > div:first-child');
  ups.forEach(el=>el.classList.add('rv-up'));
  const cuts=[...document.querySelectorAll('h2.cut,h3.cut')].filter(el=>!el.closest('.voo,.ori__stage .ori__txt'));
  cuts.forEach(el=>{ el.classList.add('rv-cut'); [...el.querySelectorAll('.l')].forEach((l,i)=>l.style.setProperty('--i',i)); });
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); e.target.querySelectorAll('.l').forEach((l,i)=>l.style.setProperty('--i',i)); io.unobserve(e.target); } }),{rootMargin:'0px 0px -8% 0px'});
  [...ups,...cuts].forEach(el=>io.observe(el));
  const prints=[...document.querySelectorAll('.projects .print:not(.extra)')];
  prints.forEach(p=>p.classList.add('par'));
  const prog=document.createElement('div'); prog.className='reel-progress'; prog.setAttribute('aria-hidden','true'); prog.innerHTML='<i></i>'; document.body.appendChild(prog);
  const hero=document.getElementById('topo');
  // reserva caso o IntersectionObserver atrase: revela o que já está na tela
  let pending=[...ups,...cuts];
  function sweep(){ if(!pending.length) return; pending=pending.filter(el=>{ if(el.classList.contains('in')) return false; const b=el.getBoundingClientRect(); if(b.top<vh*.92&&b.bottom>0&&b.width>0){ el.classList.add('in'); return false; } return true; }); }
  function drawMisc(){
    sweep();
    const max=document.documentElement.scrollHeight-vh; prog.style.setProperty('--p',(sy/max).toFixed(4));
    prog.classList.toggle('on', hero? sy>hero.offsetHeight*0.6 : sy>200);
    prints.forEach(p=>{ const b=p.getBoundingClientRect(); if(b.bottom<-100||b.top>vh+100) return; const d=(b.top+b.height/2-vh/2); p.style.translate=`0 ${(d*-0.06).toFixed(1)}px`; });
  }

  function resize(){ vw=innerWidth; vh=innerHeight; sizeVoo(); sizeBt(); frame(true); }
  function frame(force){ sy=scrollY; vh=innerHeight; vw=innerWidth; vel=vel*.85+(sy-lastSy)*.15; lastSy=sy; drawVoo(); drawOri(); drawBt(); drawMisc(); }
  let ticking=false;
  function loop(){ frame(); if(Math.abs(vel)>0.05) requestAnimationFrame(loop); else { vel=0; frame(); ticking=false; } }
  addEventListener('scroll',()=>{ if(!ticking){ ticking=true; requestAnimationFrame(loop); } },{passive:true});
  addEventListener('resize',()=>{ clearTimeout(resize._t); resize._t=setTimeout(resize,120); });
  // imagens carregadas mudam alturas: recalcula
  addEventListener('load',resize);
  document.querySelectorAll('.voo img,.bt img').forEach(im=>{ if(!im.complete) im.addEventListener('load',()=>{ sizeVoo(); sizeBt(); frame(); },{once:true}); });
  resize();
})();

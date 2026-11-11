/* Kifita · identidade multiartista:
   1. Abertura: contagem de filme 3-2-1, o nome em spray com escorridos e adesivos colados (uma vez por sessão).
   2. Spray: o cursor pinta o topo do site; clique troca a cor.
   3. Sticker bomb: adesivos arrastáveis no topo.
   4. Fitas: faixas cruzadas que correm mais rápido com a rolagem. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE=['#FF4F93','#FF6A1F','#FFD23F','#3BE0C8','#FFFCF3'];
  const en=()=>document.documentElement.lang==='en';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const STILL=/[?&]introstill/.test(location.search); const TEST=STILL||/[?&]introtest/.test(location.search); let vt=0;
  const now0=()=>TEST?vt:performance.now();
  const raf=STILL?(f=>{ vt+=16; f(vt); }):TEST?(f=>setTimeout(()=>{ vt+=16; f(vt); },16)):requestAnimationFrame.bind(window);
  function gauss(){ return (Math.random()+Math.random()+Math.random()-1.5)/1.5; }

  /* ---------- 1. ABERTURA ---------- */
  let seen=false; try{ seen=sessionStorage.getItem('kifita-intro')==='1'; }catch(e){}
  const skipIntro=true; // abertura desativada a pedido
  if(!skipIntro) intro();
  function intro(){
    try{ sessionStorage.setItem('kifita-intro','1'); }catch(e){}
    const root=document.createElement('div'); root.className='intro'; root.setAttribute('role','presentation');
    root.innerHTML='<canvas></canvas><div class="intro__leader"><div class="intro__ring"><b>3</b></div></div>'+
      '<p class="intro__tag">'+(en()?'Illustrator · Audiovisual · Graffiti':'Ilustrador · Audiovisual · Graffiti')+'</p>'+
      '<button type="button" class="intro__skip">'+(en()?'Skip intro':'Pular intro')+'</button>';
    document.body.appendChild(root); document.documentElement.classList.add('intro-lock'); document.documentElement.classList.remove('intro-pending');
    const cv=root.querySelector('canvas'), ctx=cv.getContext('2d'), ring=root.querySelector('.intro__ring'), num=ring.querySelector('b'), leader=root.querySelector('.intro__leader'), tag=root.querySelector('.intro__tag');
    const dpr=Math.min(2,devicePixelRatio||1); let W,H; function size(){ W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); } size();
    let done=false; const timers=[];
    const later=(fn,ms)=>{ if(STILL){ if(fn!==finish) fn(); return; } timers.push(setTimeout(()=>{ if(!done) fn(); },ms)); };
    function finish(){ if(done) return; done=true; timers.forEach(clearTimeout); root.classList.add('out'); document.documentElement.classList.remove('intro-lock'); setTimeout(()=>root.remove(),800); }
    root.querySelector('.intro__skip').addEventListener('click',finish);
    root.addEventListener('click',e=>{ if(e.target===root||e.target===cv) finish(); });
    addEventListener('keydown',function k(e){ if(e.key==='Escape'){ finish(); removeEventListener('keydown',k); } });
    // contagem de filme
    const t0=now0();
    (function leaderTick(now){ if(done) return; const t=(now-t0)/1000; const n=3-Math.floor(t/0.42); if(n<1){ leader.classList.add('gone'); return; }
      num.textContent=n; ring.style.setProperty('--a',((t%0.42)/0.42*360).toFixed(1)+'deg'); raf(leaderTick); })(t0);
    // nome em spray
    later(async()=>{
      try{ await document.fonts.load('400 120px "Bagel Fat One"'); }catch(e){}
      const fs=Math.min(W*0.22,H*0.34,280), text='KIFITA';
      const m=document.createElement('canvas'); m.width=W; m.height=H; const mc=m.getContext('2d');
      mc.font=`400 ${fs}px "Bagel Fat One", "Arial Black", sans-serif`; mc.textAlign='center'; mc.textBaseline='middle';
      const cy=H*0.46; mc.fillStyle='#fff'; mc.fillText(text,W/2,cy);
      const tw=mc.measureText(text).width, x0=W/2-tw/2-10, x1=W/2+tw/2+10, y0=cy-fs*.62, y1=cy+fs*.62;
      const mask=mc.getImageData(0,0,W,H).data; const inside=(x,y)=>{ x|=0; y|=0; return x>=0&&y>=0&&x<W&&y<H&&mask[(y*W+x)*4+3]>40; };
      const grad=x=>{ const t=(x-x0)/(x1-x0); return t<.5?mix('#FF4F93','#FF6A1F',t*2):mix('#FF6A1F','#FFD23F',(t-.5)*2); };
      ctx.lineJoin='round'; ctx.font=mc.font; ctx.textAlign='center'; ctx.textBaseline='middle';
      const T=1250, ts=now0(); let prev=x0-70;
      (function spray(now){ if(done) return; const k=Math.min(1,(now-ts)/T), sweep=x0+(x1-x0)*k;
        ctx.save(); ctx.beginPath(); ctx.rect(0,0,sweep+30,H); ctx.clip(); ctx.lineWidth=fs*.09; ctx.strokeStyle='#FFFCF3'; ctx.strokeText(text,W/2,cy); ctx.restore();
        const cnt=700+Math.max(0,sweep-prev)*45; for(let i=0;i<cnt;i++){ const x=rnd(prev-60,sweep+18), y=rnd(y0,y1); if(inside(x,y)){ ctx.fillStyle=grad(x); ctx.globalAlpha=rnd(.5,1); ctx.beginPath(); ctx.arc(x,y,rnd(.8,2.6),0,7); ctx.fill(); }
          else if(Math.random()<.06){ ctx.fillStyle=grad(x); ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x+gauss()*14,y+gauss()*14,rnd(.4,1.2),0,7); ctx.fill(); } }
        ctx.globalAlpha=1; prev=sweep;
        if(k<1) raf(spray); else drips(); })(ts);
      function drips(){ const ds=[]; for(let i=0;i<9;i++){ const x=rnd(x0+tw*.05,x1-tw*.05); let y=y1; while(y>y0&&!inside(x,y)) y--; if(y>y0) ds.push({x,y,len:rnd(30,fs*.55),w:rnd(3,7),c:grad(x)}); }
        const td=now0(); (function grow(now){ if(done) return; const k=Math.min(1,(now-td)/700);
          ds.forEach(d=>{ const yy=d.y+d.len*easeOut(k); ctx.strokeStyle=d.c; ctx.lineWidth=d.w; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(d.x,d.y-4); ctx.lineTo(d.x,yy); ctx.stroke(); ctx.fillStyle=d.c; ctx.beginPath(); ctx.arc(d.x,yy,d.w*.9,0,7); ctx.fill(); });
          if(k<1) raf(grow); })(td);
        // adesivos e linha de artes
        const picks=[['eu/head-orange.jpg',-14,.16,.22],['img/ilustracoes/il-dog.webp',10,.82,.2],['eu/il-frank.jpg',-6,.78,.72],['img/ilustracoes/il-cromado.webp',8,.2,.7]];
        picks.forEach((p,i)=>later(()=>{ const im=document.createElement('img'); im.className='intro__stk'; im.src=p[0]; im.alt=''; im.style.setProperty('--r',p[1]+'deg'); im.style.left=`calc(${p[2]*100}% - 6vw)`; im.style.top=`calc(${p[3]*100}% - 6vw)`; root.appendChild(im); raf(()=>im.classList.add('on')); },250+i*160));
        later(()=>tag.classList.add('on'),400);
        later(finish,1900);
      }
    },1300);
  }
  function mix(a,b,t){ t=Math.max(0,Math.min(1,t)); const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const A=p(a),B=p(b); return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'; }
  function easeOut(t){ return 1-Math.pow(1-t,3); }

  /* ---------- 2. SPRAY NO TOPO ---------- */
  const hero=document.getElementById('topo'), cv=document.getElementById('spray'), hint=document.getElementById('spray-hint');
  if(hero&&cv&&!reduce){
    const ctx=cv.getContext('2d'); const dpr=Math.min(2,devicePixelRatio||1); let ci=0, painted=false, fading=false;
    function size(){ cv.width=hero.offsetWidth*dpr; cv.height=hero.offsetHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); addEventListener('resize',()=>{ clearTimeout(size._t); size._t=setTimeout(size,150); });
    function puff(x,y,n,r){ ctx.fillStyle=PALETTE[ci]; for(let i=0;i<n;i++){ const a=Math.random()*6.283, d=Math.abs(gauss())*r; ctx.globalAlpha=rnd(.25,.85); ctx.beginPath(); ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,rnd(.6,2),0,7); ctx.fill(); } ctx.globalAlpha=1; if(!painted){ painted=true; hint&&hint.classList.add('gone'); } if(!fading){ fading=true; fade(); } }
    let last=0;
    function fade(){ const now=performance.now(); if(now-last>90){ last=now; ctx.save(); ctx.globalCompositeOperation='destination-out'; ctx.fillStyle='rgba(0,0,0,.035)'; ctx.fillRect(0,0,cv.width,cv.height); ctx.restore(); }
      requestAnimationFrame(fade); }
    const local=e=>{ const b=hero.getBoundingClientRect(); return [e.clientX-b.left,e.clientY-b.top]; };
    const busy=t=>t.closest&&t.closest('a,button,.stk,.nav');
    let px=null, py=null;
    hero.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse'||busy(e.target)||dragging) { px=null; return; } const [x,y]=local(e);
      if(px!==null){ const dx=x-px, dy=y-py, steps=Math.min(8,Math.ceil(Math.hypot(dx,dy)/10)); for(let s=1;s<=steps;s++) puff(px+dx*s/steps,py+dy*s/steps,18,16); } else puff(x,y,24,16); px=x; py=y; });
    hero.addEventListener('pointerleave',()=>{ px=null; });
    hero.addEventListener('pointerdown',e=>{ if(busy(e.target)) return; const [x,y]=local(e);
      if(e.pointerType==='mouse'){ ci=(ci+1)%PALETTE.length; } else { ci=(ci+1)%PALETTE.length; }
      puff(x,y,320,34); for(let i=0;i<6;i++){ const a=Math.random()*6.283, d=rnd(30,70); ctx.fillStyle=PALETTE[ci]; ctx.beginPath(); ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,rnd(2,5),0,7); ctx.fill(); } });
  }

  /* ---------- 3. STICKER BOMB ---------- */
  let dragging=false;
  const bomb=document.getElementById('bomb');
  if(bomb){
    let z=10;
    [...bomb.querySelectorAll('.stk')].forEach((s,i)=>{ s.style.setProperty('--d',i);
      s.addEventListener('pointerdown',e=>{ e.preventDefault(); dragging=true; s.setPointerCapture(e.pointerId); s.classList.add('drag'); s.style.zIndex=++z;
        const b=bomb.getBoundingClientRect(), r=s.getBoundingClientRect(); const ox=e.clientX-r.left, oy=e.clientY-r.top;
        function mv(ev){ const x=ev.clientX-b.left-ox, y=ev.clientY-b.top-oy; s.style.left=Math.max(-40,Math.min(b.width-40,x))+'px'; s.style.top=Math.max(-40,Math.min(b.height-40,y))+'px'; }
        function up(){ dragging=false; s.classList.remove('drag'); s.removeEventListener('pointermove',mv); s.removeEventListener('pointerup',up); s.removeEventListener('pointercancel',up); }
        s.addEventListener('pointermove',mv); s.addEventListener('pointerup',up); s.addEventListener('pointercancel',up); });
      s.addEventListener('keydown',e=>{ const st={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key]; if(!st) return; e.preventDefault(); s.style.left=(s.offsetLeft+st[0])+'px'; s.style.top=(s.offsetTop+st[1])+'px'; });
      s.tabIndex=0; });
  }

  /* ---------- 4. FITAS ---------- */
  const tracks=[...document.querySelectorAll('.fita__track')].map((el,i)=>({el, dir:i%2?1:-1, off:Math.random()*400}));
  if(tracks.length&&!reduce){
    let vis=new Set(), lastY=scrollY, vel=0, lastT=performance.now(), running=false;
    const io=new IntersectionObserver(es=>es.forEach(e=>{ e.isIntersecting?vis.add(e.target):vis.delete(e.target); if(vis.size&&!running){ running=true; lastT=performance.now(); requestAnimationFrame(tick); } }));
    document.querySelectorAll('.tapes').forEach(t=>io.observe(t));
    function tick(now){ const dt=Math.min(50,now-lastT); lastT=now; const y=scrollY; vel=vel*.9+(y-lastY)*.1; lastY=y;
      const sp=(.06+Math.min(1.2,Math.abs(vel)*.05))*dt;
      tracks.forEach(t=>{ if(!vis.has(t.el.closest('.tapes'))) return; const half=t.el.scrollWidth/2; t.off=(t.off+sp*(vel<-.5?-1:1))%half; if(t.off<0) t.off+=half;
        t.el.style.transform=`translate3d(${(t.dir<0?-t.off:t.off-half).toFixed(1)}px,0,0)`; });
      if(vis.size) requestAnimationFrame(tick); else running=false; }
  }
})();

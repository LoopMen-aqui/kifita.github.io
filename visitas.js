/* Kifita · reconhecimento do dono e medição de visitas (Microsoft Clarity)
   - Aparelho liberado no painel secreto = "dono": não é medido, não vê aviso de cookies
     e ganha o atalho K no canto da tela.
   - Qualquer outra pessoa vê um aviso pequeno; o Clarity só é carregado se ela aceitar (LGPD). */
(function(){
  var CLARITY = 'zip8pz05p8';   /* código do projeto no Clarity (ex.: k3x9abc12d) */
  var PAINEL = 'painel-k7.html';
  var KEY = 'kf_owner', CONS = 'kf_consent';
  var store = { get:function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
  var dono = null; try { dono = JSON.parse(store.get(KEY) || 'null'); } catch(e){}
  var ativo = /^[a-z0-9]{6,}$/i.test(CLARITY) && location.protocol.indexOf('http') === 0 && location.hostname !== 'localhost';

  if (dono && dono.id) {
    dono.visits = (dono.visits || 0) + 1; dono.last = Date.now();
    store.set(KEY, JSON.stringify(dono));
    window.KF_DONO = dono;
  }

  function carregarClarity(){
    if (window.clarity || !ativo) return;
    (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window,document,"clarity","script",CLARITY);
    window.clarity('consent');
  }
  if (!window.KF_DONO && store.get(CONS) === 'sim') carregarClarity();

  document.addEventListener('DOMContentLoaded', function(){
    if (window.KF_DONO) {
      var a = document.createElement('a');
      a.href = PAINEL; a.className = 'kf-dono'; a.title = 'Seu painel'; a.textContent = 'K';
      a.setAttribute('aria-label', 'Abrir o seu painel secreto');
      a.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:400;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#1A1B26;color:#FFE15A;font:400 18px "Bagel Fat One",sans-serif;text-decoration:none;box-shadow:0 6px 16px rgba(0,0,0,.35);opacity:.85';
      document.body.appendChild(a);
    } else if (ativo && !store.get(CONS)) {
      /* aviso de cookies, pequeno e no canto */
      var b = document.createElement('div');
      b.className = 'kf-cookie'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Aviso de cookies');
      b.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:450;max-width:340px;background:#FFFCF3;color:#1A1B26;border:2px solid #1A1B26;border-radius:14px;box-shadow:5px 5px 0 #1A1B26;padding:14px 16px;font:14px/1.45 Poppins,system-ui,sans-serif';
      b.innerHTML = '<p style="margin:0 0 10px">Uso cookies só para saber quantas pessoas visitam o site e o que mais chama atenção.</p>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-c="sim" style="border:0;border-radius:999px;padding:8px 16px;background:#1A1B26;color:#fff;font:600 14px Poppins,sans-serif;cursor:pointer">Aceitar</button>'
        + '<button type="button" data-c="nao" style="border:1.5px solid #1A1B26;border-radius:999px;padding:7px 15px;background:transparent;color:#1A1B26;font:600 14px Poppins,sans-serif;cursor:pointer">Recusar</button></div>';
      if (innerWidth < 700) { b.style.bottom = '84px'; b.style.right = '10px'; b.style.left = '10px'; b.style.maxWidth = 'none'; }
      b.addEventListener('click', function(e){ var t = e.target.closest('button'); if (!t) return;
        store.set(CONS, t.getAttribute('data-c')); if (t.getAttribute('data-c') === 'sim') carregarClarity(); b.remove(); });
      document.body.appendChild(b);
    }
    /* senha de teclado: digitar  k i f i t a  abre o painel */
    var buf = '';
    document.addEventListener('keydown', function(e){
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      buf = (buf + (e.key || '').toLowerCase()).slice(-6);
      if (buf === 'kifita') location.href = PAINEL;
    });
  });
})();

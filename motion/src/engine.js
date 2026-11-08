// Moteur d'animation image par image : window.render(t) dessine l'état exact à l'instant t (secondes).
// Attributs : data-in / data-out (s), data-anim (rise|scale|left|right|none), data-count="de,à,décimales" + data-cin + data-cdur,
// data-strike (s) sur un élément contenant .strike, data-fill="t0,t1" (barre .fill), data-check (s) coche une case.
(function(){
  const fmt = new URLSearchParams(location.search).get('fmt') || '16x9';
  document.documentElement.classList.add(fmt === '9x16' ? 'port' : 'land');
  const DUR = parseFloat(document.body.dataset.dur);
  window.DURATION = DUR;
  const clamp = (x)=>Math.max(0,Math.min(1,x));
  const ease = (x)=>{x=clamp(x);return 1-Math.pow(1-x,3);};
  const easeIO = (x)=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
  const els = [...document.querySelectorAll('[data-in]')];
  const counts = [...document.querySelectorAll('[data-count]')];
  const strikes = [...document.querySelectorAll('[data-strike]')];
  const fills = [...document.querySelectorAll('[data-fill]')];
  const checks = [...document.querySelectorAll('[data-check]')];
  const fr = (n,d)=>n.toFixed(d).replace('.',',');
  window.render = function(t){
    for(const el of els){
      const tin = parseFloat(el.dataset.in), tout = el.dataset.out!==undefined?parseFloat(el.dataset.out):1e9;
      const din = parseFloat(el.dataset.din||'0.55'), dout = parseFloat(el.dataset.dout||'0.35');
      const a = ease((t-tin)/din), b = ease((tout-t)/dout);
      const o = Math.min(a,b);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o<=0.001?'hidden':'visible';
      const an = el.dataset.anim||'rise', k = 1-a, kb = 1-b;
      let tr='';
      if(an==='rise') tr=`translateY(${(k*28 - kb*10).toFixed(2)}px)`;
      else if(an==='scale') tr=`scale(${(0.92+0.08*a - kb*0.03).toFixed(4)})`;
      else if(an==='left') tr=`translateX(${(-k*40).toFixed(2)}px)`;
      else if(an==='right') tr=`translateX(${(k*40).toFixed(2)}px)`;
      el.style.transform = tr;
      const bl = an==='none'?0:k*6;
      el.style.filter = bl>0.05?`blur(${bl.toFixed(2)}px)`:'none';
    }
    for(const el of counts){
      const [f,to,d] = el.dataset.count.split(',').map(Number);
      const p = easeIO((t-parseFloat(el.dataset.cin))/parseFloat(el.dataset.cdur||'1.2'));
      el.textContent = fr(f+(to-f)*p, d||0);
    }
    for(const el of strikes){
      const p = ease((t-parseFloat(el.dataset.strike))/0.45);
      const s = el.querySelector('.strike'); if(s) s.style.width = (p*100).toFixed(1)+'%';
      el.style.setProperty('--dim', (1-0.55*p).toFixed(3));
    }
    for(const el of fills){
      const [a,b] = el.dataset.fill.split(',').map(Number);
      el.style.width = (easeIO((t-a)/(b-a))*100).toFixed(1)+'%';
    }
    for(const el of checks){ el.classList.toggle('on', t>=parseFloat(el.dataset.check)); }
    // halo qui dérive lentement + fondu au noir au début et à la fin (boucle propre)
    const h = document.getElementById('halo');
    const ph = t/DUR*Math.PI*2;
    h.style.transform = `translate(${(Math.sin(ph)*6).toFixed(2)}%, ${(Math.cos(ph)*4).toFixed(2)}%)`;
    const fade = Math.min(ease(t/0.5), ease((DUR-t)/0.7));
    document.getElementById('black').style.opacity = (1-fade).toFixed(3);
  };
  window.render(parseFloat(new URLSearchParams(location.search).get('t')||'0'));
})();

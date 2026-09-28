/* Nea Thea — templo, oráculo y friso */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- intro: ΝΕΑ ΘΕΑ → NEA THEA ---------- */
(function intro() {
  const el = $('#greek');
  const target = 'NEA THEA';
  const greek = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
  const start = 'ΝΕΑ ΘΕΑ ';
  el.innerHTML = [...target].map((c, i) => `<span>${c === ' ' ? '&nbsp;' : start[i] || 'Α'}</span>`).join('');
  const spans = $$('span', el);
  document.documentElement.style.overflow = 'hidden';
  const t0 = performance.now();
  const settle = spans.map((_, i) => 700 + i * 120);
  function tick() {
    const e = performance.now() - t0;
    spans.forEach((s, i) => {
      if (target[i] === ' ') return;
      if (e < settle[i]) {
        if (e > 250 && Math.random() < 0.35) s.textContent = greek[(Math.random() * greek.length) | 0];
      } else s.textContent = target[i];
    });
    if (e >= settle[settle.length - 1] + 50) { gsap.ticker.remove(tick); finish(); }
  }
  function finish() {
    const tl = gsap.timeline();
    tl.to('.intro__sub', { opacity: 1, y: -6, duration: .8, ease: 'power2.out' })
      .to('.intro', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'expo.inOut' }, '+=.5')
      .add(() => {
        document.documentElement.style.overflow = '';
        document.body.classList.add('is-ready');
        $('#intro').remove();
        ScrollTrigger.refresh();
      });
  }
  if (reduce) { spans.forEach((s, i) => s.textContent = target[i]); finish(); }
  else gsap.ticker.add(tick);
})();

/* ---------- nav ---------- */
const nav = $('.nav');
ScrollTrigger.create({ start: 80, onUpdate: s => nav.classList.toggle('is-solid', s.scroll() > 80 && !nav.classList.contains('on-dark')) });
function darkZone(sel) {
  ScrollTrigger.create({
    trigger: sel, start: 'top 60px', end: 'bottom 60px',
    onToggle: s => { nav.classList.toggle('on-dark', s.isActive); if (s.isActive) nav.classList.remove('is-solid'); }
  });
}
darkZone('.oracle');

/* ---------- templo: entrar entre las columnas ---------- */
(function temple() {
  const facade = $('.facade');
  // en vertical se encuadran solo las 4 columnas centrales
  const fitBox = () => facade.setAttribute('viewBox', innerWidth / innerHeight < .9 ? '250 0 700 800' : '0 0 1200 800');
  fitBox(); ScrollTrigger.addEventListener('refreshInit', fitBox);
  // punto entre las dos columnas centrales (x=600, y=540 del viewBox) en % del elemento
  const origin = () => {
    const [vx, , vw, vh] = facade.getAttribute('viewBox').split(' ').map(Number);
    const W = facade.clientWidth, H = facade.clientHeight;
    const s = Math.min(W / vw, H / vh);
    const x = ((W - vw * s) / 2 + (600 - vx) * s) / W * 100;
    const y = (H - vh * s + 540 * s) / H * 100;
    return `${x}% ${y}%`;
  };
  gsap.set('.naos', { scale: .74 });
  gsap.set('.naos__text', { y: 30 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.temple', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true,
      onUpdate: s => nav.classList.toggle('on-dark', s.progress > .55 && s.progress < 1)
    }
  });
  tl.to('.temple__hint', { opacity: 0, duration: .08 }, 0)
    .to('.temple__title', { opacity: 0, y: -40, duration: .15 }, 0)
    .fromTo(facade, { scale: 1, transformOrigin: origin }, { scale: 13, transformOrigin: origin, ease: 'power3.in', duration: .8 }, 0)
    .to('.naos', { scale: 1, ease: 'power1.out', duration: .8 }, 0)
    .to(facade, { opacity: 0, duration: .12 }, .68)
    .to('.naos__light', { opacity: 1, duration: .3 }, .6)
    .to('.naos__statue', { x: () => innerWidth > 760 ? innerWidth * .2 : 0, y: () => innerWidth > 760 ? 0 : -innerHeight * .16, duration: .2 }, .74)
    .to('.naos__text', { opacity: 1, y: 0, duration: .2 }, .78)
    .to({}, { duration: .2 });
})();

/* ---------- manifiesto: las palabras se esculpen al leer ---------- */
(function manifest() {
  const p = $('.manifest__text');
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w.trim()) frag.append(w);
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s); }
        });
        n.replaceWith(frag);
      } else walk(n);
    });
  };
  walk(p);
  gsap.to($$('.w', p), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  gsap.fromTo('.manifest__greek', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.manifest', start: 'top bottom', end: 'bottom top', scrub: true } });
})();

/* ---------- columnas que se levantan ---------- */
gsap.set('.pillar', { y: 140, opacity: 0 });
ScrollTrigger.batch('.pillar', {
  start: 'top 92%',
  onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: .12 })
});

/* ---------- reveals simples ---------- */
$$('.sec-head, .stele, .visit__card').forEach(el => {
  gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});

/* ---------- oráculo ---------- */
(function oracle() {
  const box = $('#oracleBox');
  const steps = $$('.oracle__step', box);
  const ans = $('#oracleAnswer');
  let picks = [];
  const R = {
    mirada: {
      natural: ['Lifting coreano de pestañas', 'Tus pestañas ya están ahí: solo hay que despertarlas. Curvatura desde la raíz, sin extensiones y sin rímel.'],
      intenso: ['Lifting coreano + diseño de cejas', 'Una mirada que entra antes que tú en cualquier sala: pestañas elevadas y cejas diseñadas para tu rostro.']
    },
    labios: {
      natural: ['Hidralips', 'Labios jugosos, hidratados y con brillo propio. Nadie sabrá por qué, pero todos lo notarán.'],
      intenso: ['Micropigmentación de labios', 'Color y contorno que no se van con el café. Eliges el tono y tus labios lo llevan cada día.']
    },
    piel: {
      natural: ['Tratamiento facial a medida', 'Tu piel no necesita tapar nada: necesita cuidado. Sara diseñará el ritual que tu piel pide hoy.'],
      intenso: ['Ritual facial intensivo', 'Luz, limpieza profunda e hidratación. Un antes y un después que se ve en el espejo.']
    },
    libre: {
      natural: ['Depilación láser', 'La libertad no se afeita cada mañana. Sesiones cómodas y resultados que se ven pronto.'],
      intenso: ['Depilación láser', 'Di adiós a cuchillas y citas de cera. El ritual estrella del templo, con resultados que duran.']
    }
  };
  const extra = { cero: ' Y lo mejor: al levantarte, ya está hecho.', poco: ' Cinco minutos se vuelven cero.', ritual: ' Un ritual que disfrutarás cada vez que te mires.' };
  box.addEventListener('click', e => {
    const b = e.target.closest('.oracle__opts button');
    if (!b) return;
    const i = picks.length;
    picks.push(b.dataset.v);
    steps[i].classList.remove('is-on');
    if (i < 2) steps[i + 1].classList.add('is-on');
    else reveal();
  });
  function reveal() {
    const [area, time, look] = picks;
    const [title, text] = R[area][look];
    $('#oracleTitle').textContent = title;
    $('#oracleText').textContent = text + extra[time];
    $('#oracleCta').href = 'https://wa.me/34640849050?text=' + encodeURIComponent(`Hola Sara, el oráculo de vuestra web me recomienda: ${title}. ¿Me das cita?`);
    ans.classList.add('is-on');
    if (!reduce) gsap.from('.laurel ellipse', { scale: 0, transformOrigin: '50% 50%', stagger: .06, duration: .8, ease: 'back.out(2)' });
  }
  $('#oracleReset').addEventListener('click', () => {
    picks = [];
    ans.classList.remove('is-on');
    steps[0].classList.add('is-on');
  });
})();

/* ---------- friso arrastrable e infinito ---------- */
(function frieze() {
  const wrap = $('#frieze'), track = $('#friezeTrack');
  track.append(...[...track.children].map(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));
  let x = 0, v = -.5, drag = false, lastX = 0, lastT = 0, half = 0;
  const measure = () => { half = track.scrollWidth / 2; };
  measure(); addEventListener('resize', measure);
  wrap.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; lastT = performance.now(); wrap.classList.add('is-drag'); wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - lastX, now = performance.now();
    x += dx; v = dx / Math.max(1, now - lastT) * 16;
    lastX = e.clientX; lastT = now;
  });
  const up = () => { drag = false; wrap.classList.remove('is-drag'); };
  wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
  gsap.ticker.add(() => {
    if (!drag) { x += v; v += (-.5 - v) * .03; }
    if (half) { if (x < -half) x += half; if (x > 0) x -= half; }
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
})();

// Page chrome shared by every page: nav state, mobile menu, current-page
// marker, staggered reveals, the year, and the hero phone demo.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body, nav = document.querySelector('.nav');

  // nav turns solid once the page moves (subpages are always solid)
  const onScroll = () => nav.classList.toggle('solid', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mark the current page in the nav and the menu
  const here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav nav a, .sheet a').forEach(a => {
    if (a.pathname === here && a.pathname !== '/' && !a.hash) a.setAttribute('aria-current', 'page');
  });

  // mobile menu
  const btn = document.querySelector('.menu');
  const setMenu = open => {
    body.classList.toggle('open', open); body.classList.toggle('locked', open);
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  };
  btn?.addEventListener('click', () => setMenu(!body.classList.contains('open')));
  document.querySelectorAll('.sheet a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && setMenu(false));

  // reveals: each group's children arrive one after another
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const groups = ['.loop-head', '.band .wrap > .kicker', '.band .wrap > h2', '.band .split > div > *', '.agents',
    '.feature > *', '.path > *', '.not', '.qa', '.more', '.final > *', '.doc > *'];
  document.querySelectorAll(groups.join(',')).forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.matches(groups.join(',')));
    el.style.setProperty('--i', Math.min(sibs.indexOf(el), 6));
    el.classList.add('reveal'); io.observe(el);
  });

  document.querySelectorAll('.yr').forEach(y => y.textContent = new Date().getFullYear());

  // example panels: items arrive one by one while on screen, then settle
  document.querySelectorAll('[data-seq]').forEach(box => {
    const items = [...box.children].filter(c => c.tagName !== 'FIGCAPTION');
    if (reduce) { items.forEach(i => i.classList.add('show')); return; }
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      items.forEach((it, k) => setTimeout(() => it.classList.add('show'), 250 + k * 420));
      o.disconnect();
    }, { threshold: .4 }).observe(box);
  });

  // the phone: the assistant answers, shortlists and books, then starts again
  const chat = document.querySelector('#demo .chat');
  if (chat) {
    const items = [...chat.children];
    const at = [500, 1300, 2700, 3300, 5000, 6200, 7000];   // ms after start, per data-t
    const hold = 4200;
    const show = i => {
      items.forEach(el => {
        const t = +el.dataset.t;
        el.classList.toggle('show', t <= i);
        // the typing dots give way to the answer
        if (el.classList.contains('typing')) el.classList.toggle('gone', i >= 2);
      });
    };
    if (reduce) { show(6); return; }
    let timers = [], running = false;
    const run = () => {
      running = true; show(-1);
      at.forEach((ms, i) => timers.push(setTimeout(() => show(i), ms)));
      timers.push(setTimeout(run, at[at.length - 1] + hold));
    };
    const stop = () => { timers.forEach(clearTimeout); timers = []; running = false; };
    // only play while the phone is on screen
    new IntersectionObserver(([e]) => e.isIntersecting ? (running || run()) : stop(), { threshold: .3 }).observe(chat);
  }
})();

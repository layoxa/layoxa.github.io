// leyoxa.com: reveal on scroll, autoplay videos in view, the film dialog, and a live warehouse simulation.
(() => {
  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // background clips play only while on screen
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.15 });
  document.querySelectorAll('video[data-auto]').forEach(v => vio.observe(v));

  // film
  const dlg = document.getElementById('film'), fv = dlg.querySelector('video');
  document.querySelectorAll('[data-film]').forEach(b => b.addEventListener('click', () => {
    dlg.showModal(); fv.currentTime = 0; fv.muted = false; fv.play().catch(() => {});
  }));
  const shut = () => { fv.pause(); dlg.close(); };
  dlg.querySelector('.close').addEventListener('click', shut);
  dlg.addEventListener('click', e => { if (e.target === dlg) shut(); });
  dlg.addEventListener('close', () => fv.pause());

  sim(document.getElementById('sim'));
})();

function sim(cv) {
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const el = id => document.getElementById(id);
  const out = { runs: el('s-runs'), caught: el('s-caught'), replan: el('s-replan'), steps: el('s-steps') };
  const n = { runs: 0, caught: 0, replan: 0, steps: 0 };
  const TICK = 150, ROWS = 24;
  let C, R = ROWS, cell, W, H, shelf, robots = [], obstacles = new Map(), pulses = [], last = 0, running = false, raf;

  const key = (x, y) => y * C + x;
  const free = (x, y) => x >= 0 && y >= 0 && x < C && y < R && !shelf[key(x, y)] && !obstacles.has(key(x, y));

  function layout() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nc = Math.max(16, Math.round(R * W / H));
    cell = H / R;
    if (nc !== C) { C = nc; build(); }
  }

  function build() {
    shelf = new Uint8Array(C * R);
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      const inRow = y % 6 === 2 || y % 6 === 3, inCol = x % 8 >= 2 && x % 8 <= 6;
      if (inRow && inCol && y > 0 && y < R - 1 && x > 0 && x < C - 1) shelf[key(x, y)] = 1;
    }
    obstacles.clear(); pulses = []; robots = [];
    const count = C > 36 ? 40 : 28;
    while (robots.length < count) {
      const p = randFree(); if (!p || robots.some(b => b.x === p[0] && b.y === p[1])) continue;
      robots.push({ x: p[0], y: p[1], px: p[0], py: p[1], path: [], wait: 0, trail: [] });
    }
    robots.forEach(b => newGoal(b));
  }

  function randFree() {
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * C), y = Math.floor(Math.random() * R);
      if (free(x, y)) return [x, y];
    }
  }

  function bfs(sx, sy, gx, gy, block) {
    const prev = new Int32Array(C * R).fill(-1), q = [key(sx, sy)];
    prev[q[0]] = q[0];
    for (let h = 0; h < q.length; h++) {
      const k = q[h], x = k % C, y = (k / C) | 0;
      if (x === gx && y === gy) {
        const path = []; let c = k;
        while (c !== key(sx, sy)) { path.unshift([c % C, (c / C) | 0]); c = prev[c]; }
        return path;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, nk = key(nx, ny);
        if (free(nx, ny) && prev[nk] < 0 && !(block && block.has(nk))) { prev[nk] = k; q.push(nk); }
      }
    }
    return null;
  }

  function newGoal(b) {
    for (let i = 0; i < 6; i++) {
      const g = randFree(); if (!g) continue;
      const p = bfs(b.x, b.y, g[0], g[1]);
      if (p && p.length > 4) { b.path = p; b.goal = g; return; }
    }
    b.path = [];
  }

  function replan(b, avoidRobots) {
    if (!b.goal) return newGoal(b);
    const block = avoidRobots ? new Set(robots.filter(o => o !== b).map(o => key(o.x, o.y))) : null;
    const p = bfs(b.x, b.y, b.goal[0], b.goal[1], block);
    n.replan++;
    if (p) b.path = p; else newGoal(b);
  }

  function pulse(x, y, color) { pulses.push({ x, y, t: performance.now(), color }); }

  function tick() {
    const taken = new Set(robots.map(b => key(b.x, b.y)));
    for (const b of robots.sort(() => Math.random() - .5)) {
      b.px = b.x; b.py = b.y;
      if (!b.path.length) { n.runs++; pulse(b.x, b.y, 'cyan'); newGoal(b); continue; }
      const [nx, ny] = b.path[0];
      if (!free(nx, ny)) { replan(b, false); continue; }
      if (taken.has(key(nx, ny))) {
        b.wait++; n.caught++; pulse(nx, ny, 'red');
        if (b.wait > 1) { replan(b, true); b.wait = 0; }
        continue;
      }
      taken.delete(key(b.x, b.y)); taken.add(key(nx, ny));
      b.x = nx; b.y = ny; b.path.shift(); b.wait = 0; n.steps++;
      b.trail.push([b.px, b.py]); if (b.trail.length > 6) b.trail.shift();
    }
    const now = performance.now();
    for (const [k, t] of obstacles) if (now - t > 12000) obstacles.delete(k);
    if (Math.random() < 0.012) dropAt(...(randFree() || [0, 0]));
    for (const k in out) out[k].textContent = n[k].toLocaleString('en-US');
  }

  function dropAt(x, y) {
    if (!free(x, y) || robots.some(b => b.x === x && b.y === y)) return;
    obstacles.set(key(x, y), performance.now());
    pulse(x, y, 'red');
    for (const b of robots) if (b.path.some(([px, py]) => px === x && py === y)) replan(b, false);
  }

  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    dropAt(Math.floor((e.clientX - r.left) / cell), Math.floor((e.clientY - r.top) / cell));
  });

  function draw(now) {
    if (now - last >= TICK) { tick(); last = now; }
    const f = Math.min(1, (now - last) / TICK), s = cell;
    ctx.clearRect(0, 0, W, H);
    // floor grid
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = 0; y <= R; y++) for (let x = 0; x <= C; x++) ctx.fillRect(x * s - .5, y * s - .5, 1, 1);
    // shelves
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1;
    for (let y = 0; y < R; y += 1) for (let x = 0; x < C; x++) if (shelf[key(x, y)] && !shelf[key(x - 1, y)] && y % 6 === 2) {
      let w = 0; while (shelf[key(x + w, y)]) w++;
      ctx.strokeRect(x * s + 2, y * s + 2, w * s - 4, 2 * s - 4);
      for (let i = 1; i < w; i++) { ctx.beginPath(); ctx.moveTo((x + i) * s, y * s + 2); ctx.lineTo((x + i) * s, (y + 2) * s - 2); ctx.globalAlpha = .35; ctx.stroke(); ctx.globalAlpha = 1; }
    }
    // obstacles
    for (const [k, t] of obstacles) {
      const x = k % C, y = (k / C) | 0, a = 1 - Math.max(0, (now - t - 10000) / 2000);
      ctx.strokeStyle = `rgba(255,77,94,${a})`; ctx.lineWidth = 1.5;
      ctx.strokeRect(x * s + 3, y * s + 3, s - 6, s - 6);
      ctx.beginPath(); ctx.moveTo(x * s + 5, y * s + 5); ctx.lineTo((x + 1) * s - 5, (y + 1) * s - 5);
      ctx.moveTo((x + 1) * s - 5, y * s + 5); ctx.lineTo(x * s + 5, (y + 1) * s - 5); ctx.stroke();
    }
    // planned paths
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(122,232,255,.16)';
    for (const b of robots) {
      if (!b.path.length) continue;
      ctx.beginPath(); ctx.moveTo((b.x + .5) * s, (b.y + .5) * s);
      for (const [x, y] of b.path) ctx.lineTo((x + .5) * s, (y + .5) * s);
      ctx.stroke();
    }
    // robots
    for (const b of robots) {
      const x = (b.px + (b.x - b.px) * f + .5) * s, y = (b.py + (b.y - b.py) * f + .5) * s;
      b.trail.forEach(([tx, ty], i) => { ctx.fillStyle = `rgba(122,232,255,${.05 + i * .03})`; ctx.beginPath(); ctx.arc((tx + .5) * s, (ty + .5) * s, s * .14, 0, 7); ctx.fill(); });
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 1.1);
      g.addColorStop(0, b.wait ? 'rgba(255,77,94,.55)' : 'rgba(122,232,255,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 1.1, 0, 7); ctx.fill();
      ctx.fillStyle = b.wait ? '#ff4d5e' : '#e9fbff'; ctx.beginPath(); ctx.arc(x, y, s * .26, 0, 7); ctx.fill();
    }
    // pulses
    pulses = pulses.filter(p => now - p.t < 900);
    for (const p of pulses) {
      const k = (now - p.t) / 900;
      ctx.strokeStyle = p.color === 'red' ? `rgba(255,77,94,${1 - k})` : `rgba(122,232,255,${.8 - .8 * k})`;
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc((p.x + .5) * s, (p.y + .5) * s, s * (.3 + k * 1.4), 0, 7); ctx.stroke();
    }
    if (running) raf = requestAnimationFrame(draw);
  }

  layout();
  addEventListener('resize', () => { layout(); });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(draw); }
    else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  }).observe(cv);
}

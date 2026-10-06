// The field behind the page: one point cloud that morphs through the studio
// loop as you scroll — the mark, then observe, bottleneck, build, deploy,
// measure, and back to the mark (own). Every shape is generated here; there
// are no image or model assets.
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;
const N = small ? 11000 : 22000;

/* ---------- shapes ---------- */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const fib = (i, n) => { const y = 1 - (i + .5) / n * 2, r = Math.sqrt(1 - y * y), t = i * 2.39996323; return [Math.cos(t) * r, y, Math.sin(t) * r]; };

const SPOKES = Array.from({ length: 9 }, (_, k) => { const a = k / 9 * Math.PI * 2; return [Math.cos(a), Math.sin(a) * .9, Math.sin(a * 2) * .35]; })
  .map(([x, y, z]) => { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; });

function mark(i) {            // own: the Leyoxa mark — shell, nine spokes, a core
  const u = rnd();
  if (u < .62) { const [x, y, z] = fib(i % 13000, 13000); const r = 1.75 + gauss() * .025; return [x * r, y * r, z * r]; }
  if (u < .9) { const d = SPOKES[i % 9], t = Math.pow(rnd(), .8) * 1.72; return [d[0] * t + gauss() * .012, d[1] * t + gauss() * .012, d[2] * t + gauss() * .012]; }
  const [x, y, z] = fib(i % 2000, 2000); const r = .26 * Math.cbrt(rnd()); return [x * r, y * r, z * r];
}
const CL = Array.from({ length: 46 }, () => { const a = rnd() * 6.283, r = 1 + Math.sqrt(rnd()) * 3.2; return [Math.cos(a) * r, gauss() * .55, Math.sin(a) * r, .07 + rnd() * .2]; });
function observe(i) {         // many businesses, each a cluster
  if (rnd() < .1) return [gauss() * 3, gauss() * 1.2, gauss() * 3];
  const c = CL[i % CL.length]; return [c[0] + gauss() * c[3], c[1] + gauss() * c[3], c[2] + gauss() * c[3]];
}
function bottleneck() {       // many complaints funnel into one constraint
  const y = (rnd() * 2 - 1) * 2.5, k = Math.abs(y) / 2.5, r = .07 + 2 * Math.pow(k, 1.7), a = rnd() * 6.283 + y * 1.3;
  return [Math.cos(a) * r + gauss() * .03, y, Math.sin(a) * r + gauss() * .03];
}
const G = [-1.5, -.75, 0, .75, 1.5];
function build() {            // infrastructure: a lattice
  const ax = Math.floor(rnd() * 3), p = [G[Math.floor(rnd() * 5)], G[Math.floor(rnd() * 5)], G[Math.floor(rnd() * 5)]];
  p[ax] = (rnd() * 2 - 1) * 1.5; return p.map(v => v + gauss() * .008);
}
function deploy(i) {          // out into the world: streams from the center
  const [dx, dy, dz] = fib(i % 18, 18), t = rnd(), r = .25 + t * 3.4, w = Math.sin(t * 5 + i % 18) * .18 * t;
  return [dx * r + w * dy, dy * r - w * dx, dz * r + gauss() * .02 * (1 + t)];
}
const RINGS = Array.from({ length: 6 }, (_, k) => ({ r: .55 + k * .42, tx: (rnd() - .5) * 1.1, tz: (rnd() - .5) * 1.1 }));
function measure(i) {         // outcomes, measured: orbits
  const g = RINGS[i % RINGS.length], a = rnd() * 6.283;
  let x = Math.cos(a) * g.r, y = gauss() * .015, z = Math.sin(a) * g.r;
  const cy = Math.cos(g.tx), sy = Math.sin(g.tx); [y, z] = [y * cy - z * sy, y * sy + z * cy];
  const cz = Math.cos(g.tz), sz = Math.sin(g.tz); [x, y] = [x * cz - y * sz, x * sz + y * cz];
  return [x, y, z];
}
const SHAPES = [mark, observe, bottleneck, build, deploy, measure];
const SEQ = [0, 1, 2, 3, 4, 5, 0];

/* ---------- scene ---------- */
const canvas = document.getElementById('field');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); }
catch (e) { document.body.classList.add('nogl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x07070b, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 50);
  camera.position.set(0, 0, small ? 8.6 : 7.2);

  const geo = new THREE.BufferGeometry();
  SHAPES.forEach((fn, s) => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; }
    geo.setAttribute('s' + s, new THREE.BufferAttribute(a, 3));
  });
  geo.setAttribute('position', geo.getAttribute('s0'));
  const rand = new Float32Array(N); for (let i = 0; i < N; i++) rand[i] = rnd();
  geo.setAttribute('r', new THREE.BufferAttribute(rand, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uA: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() * (small ? 1.5 : 1) }, uFade: { value: 1 } },
    vertexShader: `
      attribute vec3 s0; attribute vec3 s1; attribute vec3 s2; attribute vec3 s3; attribute vec3 s4; attribute vec3 s5;
      attribute float r;
      uniform int uA; uniform int uB; uniform float uT; uniform float uTime; uniform float uPx;
      varying float vR; varying float vD;
      vec3 pick(int k){ if(k==0) return s0; if(k==1) return s1; if(k==2) return s2; if(k==3) return s3; if(k==4) return s4; return s5; }
      void main(){
        // each point leaves on its own schedule, so the morph reads as a flock, not a crossfade
        float t = smoothstep(r*.35, .65 + r*.35, uT);
        vec3 p = mix(pick(uA), pick(uB), t);
        float lift = sin(t*3.14159);
        p += lift * .35 * vec3(sin(r*40.), cos(r*31.), sin(r*23.));
        p += .02 * vec3(sin(uTime*.7 + r*60.), cos(uTime*.6 + r*50.), sin(uTime*.5 + r*70.));
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        vD = -mv.z;
        gl_PointSize = (1.3 + r*1.8) * uPx * (6.5 / vD);
        vR = r;
      }`,
    fragmentShader: `
      varying float vR; varying float vD; uniform float uTime; uniform float uFade;
      void main(){
        vec2 c = gl_PointCoord - .5; float d = dot(c,c); if(d > .25) discard;
        vec3 a = vec3(.48,.48,1.), b = vec3(.71,.85,.29), w = vec3(.95,.95,.92);
        vec3 col = mix(a, b, smoothstep(.15,.85,vR));
        col = mix(col, w, step(.93, vR) * .8);
        float tw = .75 + .25*sin(uTime*1.3 + vR*90.);
        float fog = smoothstep(12., 4.5, vD);
        gl_FragColor = vec4(col * tw, (1. - d*4.) * .85 * fog * uFade);
      }`
  });
  const pts = new THREE.Points(geo, mat);
  const group = new THREE.Group(); group.add(pts); scene.add(group);

  /* ---------- scroll → shape ---------- */
  const steps = [...document.querySelectorAll('.step')];
  const band = document.querySelector('#praxis');
  let p = 0;
  function progress() {
    const mid = innerHeight * .5;
    const first = steps[0].getBoundingClientRect();
    const h = first.height;
    // 0 at the hero, k while step k sits mid-screen, 6 by the end of the loop
    let s = (mid - (first.top + h * .5)) / h + 1;
    s = Math.max(0, Math.min(steps.length, s));
    p = s;
    let on = -1; steps.forEach((el, k) => { const r = el.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) on = k; });
    steps.forEach((el, k) => el.classList.toggle('on', k === on));
    // dim the field once the solid sections take over
    const bt = band.getBoundingClientRect().top;
    mat.uniforms.uFade.value = Math.max(.35, Math.min(1, bt / innerHeight + .35));
  }

  /* ---------- layout ---------- */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.set(w > 900 ? 1.9 : 0, w > 900 ? 0 : .9, 0);
  }
  addEventListener('resize', resize); resize();

  let mx = 0, my = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  const clock = new THREE.Clock();
  let shown = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    progress();
    shown += (p - shown) * (reduce ? 1 : Math.min(1, dt * 4));
    const k = Math.min(Math.floor(shown), SEQ.length - 2), f = shown - k;
    const u = mat.uniforms;
    u.uA.value = SEQ[k]; u.uB.value = SEQ[k + 1];
    u.uT.value = Math.min(1, Math.max(0, (f - .15) / .7));
    u.uTime.value = t;
    if (!reduce) {
      group.rotation.y += dt * .07;
      group.rotation.x += ((my * .3 + .12) - group.rotation.x) * .04;
      group.rotation.z += ((-mx * .15) - group.rotation.z) * .04;
    }
    renderer.render(scene, camera);
    if (!reduce || Math.abs(p - shown) > .001) requestAnimationFrame(frame);
  }
  frame();
  if (reduce) addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
}

/* ---------- page chrome ---------- */
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.loop-head, .band .kicker, .band h2, .band .body, .facts, .agents, .halves, .not, .founder > *, .cred, .final > *')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

/* ---------- Praxis: one quiet waveform per agent ---------- */
const wave = document.getElementById('wave');
if (wave) {
  const ctx = wave.getContext('2d'), rows = [...wave.parentElement.querySelectorAll('li')];
  let live = false, W = 0, H = 0;
  const size = () => { const d = Math.min(devicePixelRatio, 2); W = wave.clientWidth; H = wave.clientHeight; wave.width = W * d; wave.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  new ResizeObserver(size).observe(wave); size();
  new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live) requestAnimationFrame(draw); }).observe(wave);
  const grad = () => { const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(123,123,255,0)'); g.addColorStop(.45, 'rgba(123,123,255,.5)'); g.addColorStop(1, 'rgba(182,216,74,.65)'); return g; };
  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : ts / 1000, top = wave.getBoundingClientRect().top;
    ctx.strokeStyle = grad(); ctx.lineWidth = 1.2;
    rows.forEach((li, k) => {
      const r = li.getBoundingClientRect(), cy = r.top - top + r.height / 2, amp = r.height * .28;
      ctx.beginPath();
      for (let x = W * .5; x <= W; x += 3) {
        const q = x / W, env = Math.sin(Math.PI * (q - .5) / .5);
        const y = cy + env * amp * (Math.sin(q * 38 + t * (1.6 + k * .23) + k) * .55 + Math.sin(q * 91 - t * 2.4 + k * 2) * .3 + Math.sin(q * 13 + t * .7) * .15);
        x === W * .5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.globalAlpha = .55; ctx.stroke();
    });
    if (live && !reduce) requestAnimationFrame(draw);
  }
}

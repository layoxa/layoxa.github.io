// A plant floor as a point cloud, swept by a lidar line. Decorative only; the text sits in the HTML.
import * as THREE from 'three';

const canvas = document.getElementById('scan');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

  // floor grid + machine blocks + a robot-arm silhouette, as points
  const pts = [];
  const floor = (x, z) => pts.push(x, 0, z);
  for (let x = -60; x <= 60; x += 1.5) for (let z = -36; z <= 36; z += 1.5) floor(x, z);
  const box = (cx, cz, w, d, h, step = 0.9) => {
    for (let x = -w / 2; x <= w / 2; x += step) for (let y = 0; y <= h; y += step) { pts.push(cx + x, y, cz - d / 2, cx + x, y, cz + d / 2); }
    for (let z = -d / 2; z <= d / 2; z += step) for (let y = 0; y <= h; y += step) { pts.push(cx - w / 2, y, cz + z, cx + w / 2, y, cz + z); }
    for (let x = -w / 2; x <= w / 2; x += step) for (let z = -d / 2; z <= d / 2; z += step) pts.push(cx + x, h, cz + z);
  };
  [[-34, -14, 14, 6, 5], [-34, 10, 14, 6, 5], [-10, -20, 8, 8, 9], [16, 14, 22, 5, 3], [36, -12, 10, 10, 7], [40, 16, 6, 6, 12]]
    .forEach(b => box(...b));
  // robot arm: base, two links, wrist
  const seg = (a, b, n = 40) => { for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); } };
  box(4, -4, 4, 4, 2, 0.6);
  for (let r = 0; r < 1.2; r += 0.4) { seg([4 - r, 2, -4], [4 - r, 12, -2]); seg([4 - r, 12, -2], [12 - r, 14, 4]); }
  seg([12, 14, 4], [13, 9, 6], 20);

  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(pts); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const col = new Float32Array(pos.length); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.42, vertexColors: true, transparent: true, opacity: 0.95, sizeAttenuation: true });
  scene.add(new THREE.Points(geo, mat));

  const base = [0.30, 0.31, 0.30], hit = [0.45, 0.85, 0.76];
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const t0 = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduce ? 6 : (now - t0) / 1000;
    const ang = 0.6 + t * 0.06;
    camera.position.set(Math.cos(ang) * 78, 34, Math.sin(ang) * 78); camera.lookAt(6, 2, 0);
    const sweep = ((t * 14) % 150) - 75;            // lidar line moving across x
    for (let i = 0; i < pos.length; i += 3) {
      const d = Math.abs(pos[i] - sweep), k = d < 3 ? 1 - d / 3 : 0, h = Math.min(pos[i + 1] / 14, 1) * 0.25;
      col[i] = base[0] + h + (hit[0] - base[0]) * k; col[i + 1] = base[1] + h + (hit[1] - base[1]) * k; col[i + 2] = base[2] + h + (hit[2] - base[2]) * k;
    }
    geo.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}

const T3 = "https://cdn.jsdelivr.net/npm/three@0.186.1";
const Q = new URLSearchParams(location.search);
const POSTER = Q.has("poster") ? Math.min(1, Math.max(0, +Q.get("poster") || 0)) : null;
const html = document.documentElement;
const wantScene = POSTER !== null || !(html.classList.contains("rm") || html.classList.contains("no3d") || html.classList.contains("swgl"));
if (wantScene) {
  if (POSTER !== null) boot();
  else {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
    requestAnimationFrame(() => setTimeout(() => idle(boot, { timeout: 1500 }), 0));
  }
}
async function boot() {
  const canvas = document.querySelector("#sz8 .cv");
  if (!canvas) return;
  const small = matchMedia("(max-width: 699px), (pointer: coarse)").matches || Q.has("small");
  let bloomOn = !small;
  const urls = [T3 + "/+esm"];
  if (bloomOn) for (const f of ["EffectComposer", "RenderPass", "UnrealBloomPass", "OutputPass"])
    urls.push(`${T3}/examples/jsm/postprocessing/${f}.js/+esm`);
  let mods;
  try {
    mods = await Promise.all(urls.map((u) => import(u)));
  } catch (err) {
    html.classList.add("no3d");
    return;
  }
  const THREE = mods[0];
  console.info("three r" + THREE.REVISION);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: "high-performance", preserveDrawingBuffer: POSTER !== null });
  } catch (err) {
    html.classList.add("no3d");
    return;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  let dpr = Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(657931);
  const camZ = small ? 14 : 10;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 0, camZ);
  const world = new THREE.Group();
  scene.add(world);
  const ink = new THREE.Color(15921130), red = new THREE.Color(15020586);
  let seed = 11;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const gauss = () => {
    let u = 0;
    while (!u) u = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * rnd());
  };
  const N = 140, K = 6, CORE = 0.95;
  const A = new Float32Array(N * 3), B = new Float32Array(N * 3), C = new Float32Array(N * 3);
  const P = new Float32Array(N * 3), ph = new Float32Array(N), cl = new Uint8Array(N);
  const dir = [];
  for (let k = 0; k < K; k++) {
    const y = 1 - (k + 0.5) / K * 2, r = Math.sqrt(1 - y * y), th = k * 2.399963;
    const v = [Math.cos(th) * r, y * 0.8, Math.sin(th) * r], l = Math.hypot(v[0], v[1], v[2]);
    dir.push([v[0] / l, v[1] / l, v[2] / l]);
  }
  const src = small ? [[-1.3, 3.5, -1], [1.5, 2.2, -2], [-1.5, 0.5, -1.5], [1.4, -1, -0.5], [-1.2, -2.6, -2], [1.3, -3.8, -1]] : [[-4.6, 2, -1.5], [-3.2, -0.9, -1], [0.4, 2.6, -3], [2.9, -2.3, -1.5], [4.8, 1.6, -2], [0.6, -3.1, -1.5]];
  const fa = small && innerWidth < innerHeight ? 0.55 : 1, fb = small && innerWidth < innerHeight ? 0.74 : 1;
  for (let i = 0; i < N; i++) {
    const k = i % K, d = dir[k], s = src[k], o = i * 3;
    cl[i] = k;
    ph[i] = rnd() * 6.2832;
    A[o] = (s[0] + gauss() * 0.75) * fa;
    A[o + 1] = s[1] + gauss() * 0.75;
    A[o + 2] = s[2] + gauss() * 0.6;
    B[o] = (d[0] * 2.3 + gauss() * 0.38) * fb;
    B[o + 1] = d[1] * 2.3 + gauss() * 0.38;
    B[o + 2] = d[2] * 2.3 + gauss() * 0.38;
    let x = d[0] + gauss() * 0.42, y = d[1] + gauss() * 0.42, z = d[2] + gauss() * 0.42;
    const l = Math.hypot(x, y, z), rr = (CORE + 0.18 + rnd() * 0.12) / l;
    C[o] = x * rr;
    C[o + 1] = y * rr;
    C[o + 2] = z * rr;
  }
  const ea = [], eb = [], seen = /* @__PURE__ */ new Set();
  const d2 = (i, j) => {
    const a = i * 3, b = j * 3;
    return (B[a] - B[b]) ** 2 + (B[a + 1] - B[b + 1]) ** 2 + (B[a + 2] - B[b + 2]) ** 2;
  };
  const r2 = (i) => B[i * 3] ** 2 + B[i * 3 + 1] ** 2 + B[i * 3 + 2] ** 2;
  for (let i = 0; i < N; i++) {
    const near = [];
    for (let j = 0; j < N; j++) if (j !== i && cl[j] === cl[i]) near.push([d2(i, j), j]);
    near.sort((a, b) => a[0] - b[0]);
    for (const [, j] of near.slice(0, 2 + i % 2)) {
      const key = i < j ? i * 1e3 + j : j * 1e3 + i;
      if (seen.has(key)) continue;
      seen.add(key);
      if (r2(i) >= r2(j)) {
        ea.push(i);
        eb.push(j);
      } else {
        ea.push(j);
        eb.push(i);
      }
    }
  }
  for (let k = 0; k < K; k++) {
    const mine = [];
    for (let i = 0; i < N; i++) if (cl[i] === k) mine.push([r2(i), i]);
    mine.sort((a, b) => a[0] - b[0]);
    for (const [, i] of mine.slice(0, 1)) {
      ea.push(i);
      eb.push(-1);
    }
  }
  const E = ea.length;
  const outStart = new Int16Array(N + 1), outList = new Int16Array(E);
  for (let e = 0; e < E; e++) outStart[ea[e] + 1]++;
  for (let i = 0; i < N; i++) outStart[i + 1] += outStart[i];
  const fill = outStart.slice(0, N);
  for (let e = 0; e < E; e++) outList[fill[ea[e]]++] = e;
  const nodeGeo = new THREE.IcosahedronGeometry(0.035, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: ink.clone().multiplyScalar(0.7) });
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, N);
  nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodes.frustumCulled = false;
  const im = nodes.instanceMatrix.array;
  for (let i = 0; i < N; i++) {
    const o = i * 16;
    im[o] = im[o + 5] = im[o + 10] = im[o + 15] = 1;
  }
  const nodeCol = new THREE.Color();
  for (let i = 0; i < N; i++) nodes.setColorAt(i, nodeCol.setRGB(1, 1, 1));
  nodes.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const nc = nodes.instanceColor.array;
  world.add(nodes);
  const lp = new Float32Array(E * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(lp, 3).setUsage(THREE.DynamicDrawUsage));
  const lc = new Float32Array(E * 6).fill(1);
  lineGeo.setAttribute("color", new THREE.BufferAttribute(lc, 3).setUsage(THREE.DynamicDrawUsage));
  const lineMat = new THREE.LineBasicMaterial({ color: ink, vertexColors: true, transparent: true, opacity: 0.14, depthWrite: false });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  world.add(lines);
  const M = 60, pe = new Int16Array(M), pt = new Float32Array(M), pv = new Float32Array(M), pp = new Float32Array(M * 3);
  for (let m = 0; m < M; m++) {
    pe[m] = Math.floor(rnd() * E);
    pt[m] = rnd();
    pv[m] = 0.7 + rnd() * 0.6;
  }
  const dot = document.createElement("canvas");
  dot.width = dot.height = 64;
  const g = dot.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,.55)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const dotTex = new THREE.CanvasTexture(dot);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3).setUsage(THREE.DynamicDrawUsage));
  const PS = small ? 0.2 : 0.14;
  const pulseMat = new THREE.PointsMaterial({ size: PS, map: dotTex, color: red, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const pulses = new THREE.Points(pulseGeo, pulseMat);
  pulses.frustumCulled = false;
  world.add(pulses);
  const coreGeo = new THREE.IcosahedronGeometry(CORE, 2);
  const wireGeo = new THREE.WireframeGeometry(coreGeo);
  const wireMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.24, depthWrite: false });
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  const solidGeo = new THREE.IcosahedronGeometry(CORE * 0.985, 2);
  const solidMat = new THREE.MeshStandardMaterial({ color: 1312004, emissive: red, emissiveIntensity: 0, roughness: 0.55, metalness: 0.15, flatShading: true, transparent: true, opacity: 0 });
  solidMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\n  float szF = 1.0 - abs(dot(normal, normalize(vViewPosition)));\n  totalEmissiveRadiance *= mix(0.22, 1.0, pow(szF, 1.4));"
    );
  };
  const solid = new THREE.Mesh(solidGeo, solidMat);
  const core = new THREE.Group();
  const rimMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: red.clone() }, uI: { value: 0 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uColor; uniform float uI; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5); gl_FragColor = vec4(uColor * f * uI, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const rimGeo = new THREE.IcosahedronGeometry(CORE * 1.02, 4);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  core.add(solid, rim, wire);
  world.add(core);
  scene.add(new THREE.HemisphereLight(15921130, 657931, 0.35));
  const sun = new THREE.DirectionalLight(15921130, 1.1);
  sun.position.set(3, 4, 6);
  scene.add(sun);
  const glowMat = new THREE.SpriteMaterial({ map: dotTex, color: red, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(CORE * 3.2, CORE * 3.2, 1);
  world.add(glow);
  let composer = null, bloom = null;
  if (bloomOn) {
    const [, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = mods;
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.35, 0.55);
    const setFull = bloom.setSize.bind(bloom);
    bloom.setSize = (w, h) => setFull(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
  let W = 0, H = 0;
  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || w === W && Math.abs(h - H) < 2) return;
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    if (composer) {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  addEventListener("resize", size);
  let tx = 0, ty = 0, px = 0, py = 0;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && POSTER === null) addEventListener("pointermove", (e) => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  const TAN = Math.tan(19 * Math.PI / 180);
  let wide = innerWidth >= 1100;
  let lift = 0;
  function measureLift() {
    lift = 0;
    if (innerWidth >= 700) return;
    const eb2 = document.querySelector("#sz8 .eyebrow"), H2 = canvas.clientHeight;
    if (!eb2 || !H2) return;
    const top = eb2.getBoundingClientRect().top + scrollY, half = H2 / 2, hh = camZ * TAN;
    const r = CORE / hh * half;
    const need = half + r + 32 - top;
    if (need > 0) lift = need / half * hh;
  }
  measureLift();
  addEventListener("resize", () => {
    wide = innerWidth >= 1100;
    measureLift();
  });
  if (document.fonts) document.fonts.ready.then(measureLift);
  const ss = (x, a, b) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const DEG3 = 3 * Math.PI / 180;
  let time = 0;
  const box = { l: 0, t: 0, r: 0, b: 0 };
  function measureBox() {
    const hc = document.querySelector("#sz8 .hc");
    if (!hc) return;
    const r = hc.getBoundingClientRect(), y = scrollY;
    box.l = r.left - 32;
    box.r = r.right + 32;
    box.t = r.top + y - 32;
    box.b = r.bottom + y + 32;
  }
  measureBox();
  addEventListener("resize", measureBox);
  if (document.fonts) document.fonts.ready.then(measureBox);
  const pv3 = new THREE.Vector3();
  function inBox(x, y, z) {
    pv3.set(x, y, z).applyMatrix4(world.matrixWorld).project(camera);
    const sx = (pv3.x + 1) / 2 * W, sy = (1 - pv3.y) / 2 * H;
    return sx > box.l && sx < box.r && sy > box.t && sy < box.b;
  }
  let dimmed = -1, dimTick = 0;
  const dep = (z) => Math.min(1, Math.max(0.4, 0.9 + 0.12 * z));
  function dimText(k) {
    const kk = Math.round(k * 20) / 20;
    if (kk === dimmed && ++dimTick % 6) return;
    dimmed = kk;
    world.updateMatrixWorld();
    const lo = 1 - 0.9 * kk;
    for (let i = 0; i < N; i++) {
      const o = i * 3, f = (kk > 0 && inBox(P[o], P[o + 1], P[o + 2]) ? lo : 1) * dep(P[o + 2]);
      nc[o] = nc[o + 1] = nc[o + 2] = f;
    }
    nodes.instanceColor.needsUpdate = true;
    for (let v = 0; v < E * 2; v++) {
      const o = v * 3, f = (kk > 0 && inBox(lp[o], lp[o + 1], lp[o + 2]) ? lo : 1) * dep(lp[o + 2]);
      lc[o] = lc[o + 1] = lc[o + 2] = f;
    }
    lineGeo.attributes.color.needsUpdate = true;
  }
  const lbls = document.querySelectorAll("#sz8 .lbls span"), cx = new Float32Array(K * 3), cn = new Float32Array(K);
  const lblX = new Float32Array(K), lblY = new Float32Array(K), lblW = new Float32Array(K);
  let lblOp = -1;
  const coreS = { x: 0, y: 0, r: 0 };
  function placeLabels(p) {
    const op = ss(p, 0.1, 0.15) * (1 - ss(p, 0.3, 0.37));
    if (Math.abs(op - lblOp) > 0.01) {
      for (let k = 0; k < lbls.length; k++) lbls[k].style.opacity = op.toFixed(3);
      lblOp = op;
    }
    if (op <= 0 || !lbls.length) return;
    cx.fill(0);
    cn.fill(0);
    world.updateMatrixWorld();
    pv3.set(0, 0, 0).applyMatrix4(world.matrixWorld).project(camera);
    coreS.x = (pv3.x + 1) / 2 * W;
    coreS.y = (1 - pv3.y) / 2 * H;
    pv3.set(0, CORE * core.scale.x, 0).applyMatrix4(world.matrixWorld).project(camera);
    coreS.r = Math.abs((1 - pv3.y) / 2 * H - coreS.y);
    for (let i = 0; i < N; i++) {
      const c = cl[i], o = i * 3;
      cx[c * 3] += P[o];
      cx[c * 3 + 1] += P[o + 1];
      cx[c * 3 + 2] += P[o + 2];
      cn[c]++;
    }
    for (let k = 0; k < K && k < lbls.length; k++) {
      pv3.set(cx[k * 3] / cn[k], cx[k * 3 + 1] / cn[k], cx[k * 3 + 2] / cn[k]).applyMatrix4(world.matrixWorld).project(camera);
      if (!lblW[k]) lblW[k] = lbls[k].offsetWidth;
      const px2 = (pv3.x + 1) / 2 * W, py2 = (1 - pv3.y) / 2 * H;
      const x = Math.round(Math.min(W - 24 - lblW[k] / 2, Math.max(24 + lblW[k] / 2, px2))), y = Math.round(Math.min(H - 24, Math.max(100, py2)));
      const onCore = Math.hypot(px2 - coreS.x, py2 - coreS.y) < coreS.r + 28;
      lbls[k].style.visibility = onCore ? "hidden" : "";
      if (x !== lblX[k] || y !== lblY[k]) {
        lbls[k].style.transform = "translate(" + x + "px," + y + "px)";
        lblX[k] = x;
        lblY[k] = y;
      }
    }
  }
  const vig = document.querySelector("#sz8 .vig"), layerEl = document.querySelector("#sz8 .layer");
  let live = false, lastOp = 1, lastVig = -1;
  function update(dt) {
    const p = POSTER !== null ? POSTER : window.__szP || 0;
    const s1 = ss(p, 0.37, 0.62), s2 = ss(p, 0.64, 0.8), spoke = ss(p, 0.1, 0.4);
    time += dt;
    const amp = 0.075 * (1 - 0.75 * s2);
    for (let i = 0; i < N; i++) {
      const o = i * 3, q = ph[i];
      const ax = A[o] + (B[o] - A[o]) * s1, ay = A[o + 1] + (B[o + 1] - A[o + 1]) * s1, az = A[o + 2] + (B[o + 2] - A[o + 2]) * s1;
      const x = ax + (C[o] - ax) * s2 + Math.sin(time * 0.15 + q) * amp;
      const y = ay + (C[o + 1] - ay) * s2 + Math.cos(time * 0.13 + q * 1.3) * amp;
      const z = az + (C[o + 2] - az) * s2 + Math.sin(time * 0.11 + q * 0.7) * amp;
      P[o] = x;
      P[o + 1] = y;
      P[o + 2] = z;
      const m = i * 16;
      im[m + 12] = x;
      im[m + 13] = y;
      im[m + 14] = z;
      im[m] = im[m + 5] = im[m + 10] = Math.min(1.25, Math.max(0.55, 1 + 0.11 * z));
    }
    nodes.instanceMatrix.needsUpdate = true;
    for (let e = 0; e < E; e++) {
      const a = ea[e] * 3, o = e * 6;
      lp[o] = P[a];
      lp[o + 1] = P[a + 1];
      lp[o + 2] = P[a + 2];
      if (eb[e] < 0) {
        const l = CORE / (Math.hypot(P[a], P[a + 1], P[a + 2]) || 1), g2 = spoke;
        lp[o + 3] = P[a] + (P[a] * l - P[a]) * g2;
        lp[o + 4] = P[a + 1] + (P[a + 1] * l - P[a + 1]) * g2;
        lp[o + 5] = P[a + 2] + (P[a + 2] * l - P[a + 2]) * g2;
      } else {
        const b = eb[e] * 3;
        lp[o + 3] = P[b];
        lp[o + 4] = P[b + 1];
        lp[o + 5] = P[b + 2];
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineMat.opacity = 0.14 + 0.16 * s1 - 0.06 * s2;
    const active = Math.round(18 + 42 * s1), speed = 0.35 + 0.65 * s1 + 0.35 * s2;
    for (let m = 0; m < active; m++) {
      if (POSTER === null) {
        pt[m] += pv[m] * speed * dt;
        if (pt[m] >= 1) {
          pt[m] = 0;
          const to = eb[pe[m]];
          const n = to < 0 ? 0 : outStart[to + 1] - outStart[to];
          pe[m] = n ? outList[outStart[to] + Math.floor(Math.random() * n)] : Math.floor(Math.random() * E);
        }
      }
      const o = pe[m] * 6, t = pt[m], w = m * 3;
      pp[w] = lp[o] + (lp[o + 3] - lp[o]) * t;
      pp[w + 1] = lp[o + 1] + (lp[o + 4] - lp[o + 1]) * t;
      pp[w + 2] = lp[o + 2] + (lp[o + 5] - lp[o + 2]) * t;
    }
    pulseGeo.setDrawRange(0, active);
    pulseMat.size = PS * (2.4 - 1.2 * s1);
    pulseMat.color.copy(red).multiplyScalar(1.8 - 0.6 * s1);
    pulseGeo.attributes.position.needsUpdate = true;
    wireMat.opacity = 0.24 * (1 - s2) + 0.05;
    solidMat.opacity = s2;
    solidMat.emissiveIntensity = 1.4 * s2;
    rimMat.uniforms.uI.value = 1.6 * s2;
    rim.visible = s2 > 1e-3;
    solid.visible = s2 > 1e-3;
    glowMat.opacity = 0.15 * (1 - s2);
    core.rotation.y += dt * 0.02;
    core.rotation.x = 0.35;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    world.rotation.y = px * 2 * DEG3;
    world.rotation.x = py * 2 * DEG3;
    camera.position.z = camZ - 1.6 * p;
    const k = 1 - ss(p, 0.05, 0.33), off = wide ? k : 0;
    const hh = camera.position.z * TAN;
    world.position.x = off * 0.45 * hh * camera.aspect;
    world.position.y = off * 0.16 * hh + k * lift;
    const out = ss(p, 0.92, 1);
    core.scale.setScalar(1 - 0.3 * out);
    if (live) {
      const o = 1 - out;
      if (Math.abs(o - lastOp) > 0.01 || o === 1 !== (lastOp === 1)) {
        canvas.style.opacity = o.toFixed(3);
        lastOp = o;
      }
    }
    if (vig) {
      const v = ss(p, 0.5, 0.9);
      if (Math.abs(v - lastVig) > 0.01) {
        vig.style.opacity = v.toFixed(3);
        lastVig = v;
      }
    }
    dimText(k);
    placeLabels(p);
  }
  function draw() {
    if (bloomOn) composer.render();
    else renderer.render(scene, camera);
  }
  if (POSTER !== null) {
    html.classList.add("poster");
    size();
    if (document.fonts) await document.fonts.ready;
    measureLift();
    await renderer.compileAsync(scene, camera);
    update(0);
    draw();
    update(0);
    draw();
    canvas.classList.add("on");
    window.__posterReady = true;
    return;
  }
  let onScreen = true, running = false, last = 0, frames = 0, secStart = 0, secFrames = 0;
  let phase = 0, mFrom = 6, mT = 0;
  const _v = new THREE.Vector3();
  const api = window.SZ3D = {
    frames: 0,
    fps: 0,
    measured: [],
    state: "starting",
    setProgress(p) {
      window.__szP = p;
    },
    coreBottom() {
      world.updateMatrixWorld();
      _v.set(0, -CORE, 0).applyMatrix4(world.matrixWorld).project(camera);
      return (1 - _v.y) / 2 * canvas.clientHeight;
    },
    coreCircle() {
      world.updateMatrixWorld();
      _v.set(0, 0, 0).applyMatrix4(world.matrixWorld).project(camera);
      const x = (_v.x + 1) / 2 * W, y = (1 - _v.y) / 2 * H;
      _v.set(0, -CORE * core.scale.x, 0).applyMatrix4(world.matrixWorld).project(camera);
      return { x, y, r: Math.abs((1 - _v.y) / 2 * H - y) };
    },
    longEdges(f) {
      world.updateMatrixWorld();
      let n = 0, m = 0;
      const q = new THREE.Vector3();
      for (let e = 0; e < E; e++) {
        const o = e * 6;
        _v.set(lp[o], lp[o + 1], lp[o + 2]).applyMatrix4(world.matrixWorld).project(camera);
        q.set(lp[o + 3], lp[o + 4], lp[o + 5]).applyMatrix4(world.matrixWorld).project(camera);
        const L = Math.hypot((_v.x - q.x) / 2 * W, (_v.y - q.y) / 2 * H);
        if (L > m) m = L;
        if (L > f * Math.max(W, H)) n++;
      }
      return { n, longest: Math.round(m), edges: E };
    }
  };
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1e3) : 0;
    last = now;
    update(dt);
    draw();
    frames++;
    api.frames = frames;
    if (frames === 1) {
      canvas.classList.add("on");
      api.state = "running";
      setTimeout(() => {
        if (api.state === "poster") return;
        canvas.style.transition = "none";
        live = true;
        lastOp = -1;
        layerEl.classList.add("live");
      }, 1300);
    }
    if (!secStart) secStart = now;
    secFrames++;
    if (now - secStart >= 1e3) {
      api.fps = Math.round(secFrames * 1e3 / (now - secStart));
      canvas.dataset.fps = api.fps;
      secStart = now;
      secFrames = 0;
    }
    if (phase < 2) {
      if (frames === mFrom) mT = now;
      else if (frames > mFrom && (frames === mFrom + 90 || now - mT > 3e3)) {
        const fps = (frames - mFrom) * 1e3 / (now - mT);
        api.measured.push(Math.round(fps));
        if (phase === 0 && fps < 45) {
          bloomOn = false;
          dpr = 1;
          renderer.setPixelRatio(1);
          W = 0;
          size();
          api.state = "stepped-down";
          phase = 1;
          mFrom = frames + 5;
        } else if (fps < 30) {
          slow();
          return;
        } else phase = 2;
      }
    }
  }
  let ready = false;
  function play() {
    if (!ready || running || !onScreen || document.hidden) return;
    running = true;
    last = 0;
    secStart = 0;
    secFrames = 0;
    if (phase < 2) mFrom = frames + 5;
    renderer.setAnimationLoop(frame);
  }
  function pause() {
    if (!running) return;
    running = false;
    renderer.setAnimationLoop(null);
  }
  function slow() {
    pause();
    api.state = "poster";
    live = false;
    canvas.style.transition = "";
    canvas.style.opacity = "";
    layerEl.classList.remove("live");
    canvas.classList.remove("on");
    setTimeout(teardown, 1300);
  }
  function teardown() {
    pause();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    dotTex.dispose();
    wireGeo.dispose();
    if (composer) composer.dispose();
    renderer.dispose();
  }
  const stage = document.querySelector("#sz8 .stage");
  new IntersectionObserver((es) => {
    onScreen = es[0].isIntersecting;
    onScreen ? play() : pause();
  }).observe(stage);
  document.addEventListener("visibilitychange", () => document.hidden ? pause() : play());
  addEventListener("pagehide", () => {
    if (api.state !== "poster") {
      api.state = "poster";
      teardown();
    }
  });
  addEventListener("pageshow", (ev) => {
    if (ev.persisted) {
      canvas.classList.remove("on");
      canvas.style.opacity = "";
      layerEl.classList.remove("live");
    }
  });
  await renderer.compileAsync(scene, camera);
  ready = true;
  play();
}

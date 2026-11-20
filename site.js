/* Menu, reveals, card tilt, contact form, and the two canvas scenes (ported from the site's original sections). */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var btn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    var d = document.querySelector('.sub-nav[open]');
    if (d && !d.contains(e.target) && window.innerWidth > 900) d.removeAttribute('open');
    var a = e.target.closest ? e.target.closest('a[href$="#contact"]') : null;
    if (a && nav) { nav.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
  });

  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    [].forEach.call(document.querySelectorAll('.card'), function (card) {
      var glow = card.querySelector('.glow');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = 'rotateX(' + ((0.5 - py) * 10) + 'deg) rotateY(' + ((px - 0.5) * 10) + 'deg) scale(1.015)';
        if (glow) { glow.style.setProperty('--gx', (px * 100) + '%'); glow.style.setProperty('--gy', (py * 100) + '%'); }
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value + '\n\n' + f.message.value;
    var note = document.getElementById('formNote');
    if (note) note.hidden = false;
    window.location.href = 'mailto:info@reishlakishconsulting.com?subject=' + encodeURIComponent(f.subject.value || 'Website inquiry') + '&body=' + encodeURIComponent(body);
  });

  /* Star field behind the namesake section. */
  var stars = document.getElementById('stars');
  if (stars && stars.getContext) (function () {
    var ctx = stars.getContext('2d'), W, H, list = [], mouse = { x: 0.5, y: 0.5 }, t = 0, on = true;
    function size() { W = stars.width = stars.clientWidth; H = stars.height = stars.clientHeight; }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 160; i++) list.push({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, r: 0.5 + Math.random() * 1.6, tw: Math.random() * Math.PI * 2 });
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX / window.innerWidth; mouse.y = e.clientY / window.innerHeight; }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(stars);
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++) {
        var s = list[i], px = (s.x + (mouse.x - 0.5) * 0.06 * s.z) * W, py = (s.y + (mouse.y - 0.5) * 0.06 * s.z) * H;
        var a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.8 + s.tw));
        ctx.beginPath(); ctx.arc(px, py, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212,175,55,' + (a * s.z).toFixed(3) + ')'; ctx.fill();
      }
    }
    draw();
    if (!reduced) (function loop() { requestAnimationFrame(loop); if (on && !document.hidden) draw(); })();
  })();

  /* Hero: the faceted gem among gold dust. */
  var hero = document.getElementById('hero'), canvas = document.getElementById('scene');
  if (!hero || !canvas || typeof THREE === 'undefined') return;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1220);
  scene.fog = new THREE.FogExp2(0x0a1220, 0.055);
  var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  var W = 1, H = 1;
  function size() {
    W = hero.clientWidth; H = hero.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  size(); window.addEventListener('resize', size);
  var COUNT = Math.min(window.innerWidth, window.innerHeight) < 600 ? 700 : 1400;
  var pos = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i++) {
    var r = 5 + Math.random() * 9, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = (r * Math.sin(ph) * Math.sin(th)) * 0.6;
    pos[i * 3 + 2] = r * Math.cos(ph) - 4;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var c = document.createElement('canvas'); c.width = c.height = 64;
  var g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,236,170,1)'); grad.addColorStop(0.35, 'rgba(212,175,55,0.8)'); grad.addColorStop(1, 'rgba(212,175,55,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.14, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xd4af37 }));
  scene.add(particles);
  var group = new THREE.Group(), ico = new THREE.IcosahedronGeometry(2.1, 1);
  group.add(new THREE.Mesh(ico, new THREE.MeshStandardMaterial({ color: 0x16283f, metalness: 0.55, roughness: 0.25, transparent: true, opacity: 0.55, flatShading: true })));
  group.add(new THREE.LineSegments(new THREE.WireframeGeometry(ico), new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55 })));
  var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.35 }));
  group.add(core); group.position.set(0, 0.1, 0); scene.add(group);
  scene.add(new THREE.AmbientLight(0x8899bb, 0.7));
  var key = new THREE.PointLight(0xd4af37, 1.3, 40); key.position.set(6, 5, 6); scene.add(key);
  var rim = new THREE.PointLight(0x4a7bd0, 1.0, 40); rim.position.set(-7, -4, 4); scene.add(rim);
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 }, visible = true;
  function move(e) {
    var x = e.touches ? e.touches[0].clientX : e.clientX, y = e.touches ? e.touches[0].clientY : e.clientY;
    mouse.tx = (x / window.innerWidth) * 2 - 1; mouse.ty = -((y / window.innerHeight) * 2 - 1);
  }
  window.addEventListener('mousemove', move, { passive: true });
  window.addEventListener('touchmove', move, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
  var clock = new THREE.Clock();
  function tick() {
    var t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    if (!reduced) {
      group.rotation.y = t * 0.16 + mouse.x * 0.9;
      group.rotation.x = Math.sin(t * 0.12) * 0.15 + (-mouse.y) * 0.55;
      group.position.y = 0.1 + Math.sin(t * 0.8) * 0.12;
      core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.12);
      particles.rotation.y = t * 0.02 + mouse.x * 0.22;
      particles.rotation.x = mouse.y * 0.12;
      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      key.position.x = 6 + mouse.x * 3; key.position.y = 5 + mouse.y * 3;
    }
    renderer.render(scene, camera);
  }
  tick();
  if (!reduced) (function loop() { requestAnimationFrame(loop); if (visible && !document.hidden) tick(); })();
})();

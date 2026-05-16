/* ── PARTICLES ── */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 55;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = rand(0, W);
    this.y  = rand(0, H);
    this.r  = rand(0.8, 2.2);
    this.vx = rand(-0.2, 0.2);
    this.vy = rand(-0.25, -0.05);
    this.alpha = rand(0.15, 0.55);
    this.gold  = Math.random() > 0.75;
  };

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(232,160,32,${p.alpha})`
        : `rgba(56,189,248,${p.alpha})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4 || p.x < -4 || p.x > W + 4) p.reset();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── ACTIVE NAV ON SCROLL ── */
(function () {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function onScroll() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── SMOOTH SCROLL FOR NAV LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    // close mobile sidebar if open
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    if (sidebar)  sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  });
});

/* ── REVEAL ON SCROLL ── */
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
})();

/* ── MOBILE HAMBURGER ── */
(function () {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  if (!hamburger || !sidebar) return;

  // create overlay if not present
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  hamburger.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    overlay.classList.toggle('visible', open);
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  });
})();

/* ── CONTACT FORM ── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    const btn = form.querySelector('button[type="submit"]');
    const action = form.getAttribute('action');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // Let Formspree handle the submission natively
    // Re-enable button after a delay in case of error
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }, 5000);
  });
})();

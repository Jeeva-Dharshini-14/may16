/* ============================================================
   BIRTHDAY WEBSITE — script.js
   Enhanced Romantic Edition
   ============================================================ */

// ── 1. LOADER FADE ────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Kick off sparkles after load
      initSparkles();
      // Add reveal classes to sections
      scheduleRevealInit();
    }, 900);
  });

  // Fallback: if load never fires within 4s
  setTimeout(() => {
    loader.classList.add('hidden');
    initSparkles();
    scheduleRevealInit();
  }, 4000);
})();

// ── 2. SPARKLE CANVAS ─────────────────────────────────────────
function initSparkles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'sparkle-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, sparks = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = [
    'rgba(255,107,157,',
    'rgba(216,180,254,',
    'rgba(247,201,72,',
    'rgba(255,158,196,',
    'rgba(255,255,255,'
  ];

  class Spark {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2.5 + 0.5;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.55 + 0.15;
      this.fadingIn = true;
      this.speed = Math.random() * 0.008 + 0.004;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.twinkle = Math.random() * Math.PI * 2; // phase
      this.drift = (Math.random() - 0.5) * 0.15;
      this.rise = -Math.random() * 0.18 - 0.05;
    }
    update() {
      this.twinkle += this.speed * 3;
      if (this.fadingIn) {
        this.alpha += this.speed;
        if (this.alpha >= this.maxAlpha) { this.fadingIn = false; }
      } else {
        this.alpha -= this.speed * 0.6;
        if (this.alpha <= 0) { this.reset(); return; }
      }
      this.x += this.drift;
      this.y += this.rise;
    }
    draw() {
      const pulse = Math.sin(this.twinkle) * 0.3 + 0.7;
      ctx.save();
      ctx.globalAlpha = this.alpha * pulse;
      ctx.fillStyle = this.color + this.alpha * pulse + ')';

      // Draw a 4-point star
      const s = this.size;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.twinkle * 0.3);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? s * 2 : s * 0.6;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Create ~70 sparkles (lightweight)
  const SPARK_COUNT = 70;
  for (let i = 0; i < SPARK_COUNT; i++) {
    const sp = new Spark();
    sp.alpha = Math.random() * sp.maxAlpha; // start at random phase
    sparks.push(sp);
  }

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(s => { s.update(); s.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();

  // Pause when tab is hidden (battery / perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
}

// ── 3. COUNTDOWN TIMER ────────────────────────────────────────
(function initCountdown() {
  // ✏️ EDIT: Change the target birthday date here (YYYY, M-1, D)
  const BIRTHDAY_DATE = new Date(new Date().getFullYear(), 4, 16); // May 16

  // If this year's birthday has already passed, target next year
  const now = new Date();
  if (BIRTHDAY_DATE < now) BIRTHDAY_DATE.setFullYear(BIRTHDAY_DATE.getFullYear() + 1);

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minsEl    = document.getElementById('minutes');
  const secsEl    = document.getElementById('seconds');
  const msgEl     = document.getElementById('birthday-msg');

  if (!daysEl) return; // section absent

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = BIRTHDAY_DATE - new Date();
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      if (msgEl) { msgEl.hidden = false; }
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    daysEl.textContent  = pad(d);
    hoursEl.textContent = pad(h);
    minsEl.textContent  = pad(m);
    secsEl.textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

// ── 4. MUSIC PLAY / PAUSE ─────────────────────────────────────
(function initMusic() {
  const btn   = document.getElementById('music-btn');
  const icon  = document.getElementById('music-icon');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;

  let playing = false;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      icon.textContent = '🎵';
      btn.setAttribute('aria-label', 'Play background music');
      btn.classList.remove('playing');
    } else {
      audio.play().catch(() => {}); // Silently ignore autoplay block
      icon.textContent = '⏸';
      btn.setAttribute('aria-label', 'Pause background music');
      btn.classList.add('playing');
    }
    playing = !playing;
  });

  // Auto-resume icon state if audio ends unexpectedly
  audio.addEventListener('pause', () => {
    icon.textContent = '🎵';
    btn.classList.remove('playing');
    playing = false;
  });
  audio.addEventListener('play', () => {
    icon.textContent = '⏸';
    btn.classList.add('playing');
    playing = true;
  });
})();

// ── 5. SURPRISE BUTTON ────────────────────────────────────────
(function initSurprise() {
  const btn     = document.getElementById('surprise-btn');
  const message = document.getElementById('surprise-message');
  const btnText = document.getElementById('surprise-btn-text');
  if (!btn || !message) return;

  btn.addEventListener('click', () => {
    const isHidden = message.hidden;
    message.hidden = !isHidden;
    btn.setAttribute('aria-expanded', String(isHidden));
    if (btnText) {
      btnText.textContent = isHidden
        ? 'Hide the surprise 💝'
        : 'Click to reveal your surprise 💝';
    }
    // Confetti burst on reveal
    if (isHidden) launchConfetti(btn);
  });
})();

// ── 6. SCROLL REVEAL ──────────────────────────────────────────
function scheduleRevealInit() {
  // Mark each section child as reveal targets
  const targets = document.querySelectorAll(
    '.section-title, .section-subtitle, .time-box, .polaroid, ' +
    '.gallery-item, .reason-item, .goal-card, .timeline-event, ' +
    '.letter-card, .surprise-wrapper, .final-quote, .final-from, .final-hearts'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger items in same parent group
    const mod = i % 6;
    if (mod > 0) el.classList.add('reveal-delay-' + Math.min(mod, 3));
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ── 7. MINI CONFETTI BURST ────────────────────────────────────
function launchConfetti(originEl) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const EMOJIS = ['💗', '✨', '🌸', '💖', '⭐', '💕', '🎊'];
  const PIECES = 24;

  for (let i = 0; i < PIECES; i++) {
    const el = document.createElement('span');
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top:  ${cy}px;
      font-size: ${Math.random() * 12 + 10}px;
      pointer-events: none;
      z-index: 9000;
      user-select: none;
      transition: none;
    `;
    document.body.appendChild(el);

    const angle  = (Math.random() * Math.PI * 2);
    const dist   = Math.random() * 160 + 60;
    const tx     = Math.cos(angle) * dist;
    const ty     = Math.sin(angle) * dist - 80;
    const rot    = (Math.random() - 0.5) * 540;
    const dur    = Math.random() * 600 + 700;

    // Use Web Animations API (widely supported)
    const anim = el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0.4)`, opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });

    anim.onfinish = () => el.remove();
  }
}

// ── 8. POLAROID TILT ON MOUSE MOVE (desktop only) ─────────────
(function initPolaroidTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch

  document.querySelectorAll('.polaroid').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `
        scale(1.1)
        rotateX(${-dy * 8}deg)
        rotateY(${dx * 8}deg)
        translateY(-16px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── 9. GALLERY LIGHTBOX (simple tap-to-enlarge) ───────────────
(function initLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photo lightbox');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 8000;
    background: rgba(30,8,20,0.88);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; visibility: hidden;
    transition: opacity 0.35s ease, visibility 0.35s ease;
    cursor: zoom-out;
    padding: 20px;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width: min(90vw, 720px);
    max-height: 85vh;
    border-radius: 12px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,157,0.3);
    transform: scale(0.88);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    object-fit: contain;
  `;
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    requestAnimationFrame(() => { img.style.transform = 'scale(1)'; });
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.style.opacity = '0';
    img.style.transform = 'scale(0.88)';
    setTimeout(() => {
      overlay.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }, 350);
  }

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Attach to gallery + polaroids
  document.querySelectorAll('.gallery-item img, .polaroid img').forEach(el => {
    el.parentElement.style.cursor = 'zoom-in';
    el.parentElement.addEventListener('click', () => open(el.src, el.alt));
  });
})();
/* =========================================================
   PerralVPN — Motion engine
   The rive.app feel without the rive.app payload: everything
   here is CSS transitions, SVG pathLength and a handful of
   rAF loops. Zero dependencies, zero network requests.
   Every entry point no-ops under prefers-reduced-motion.
   ========================================================= */

const Motion = (() => {
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowData = () => document.documentElement.dataset.motion === 'low';
  const duration = (base) => (lowData() ? Math.round(base * 0.5) : base);

  /* ---- staggered module rise, only when the block is near view ---- */
  let revealer = null;
  function ensureRevealer(){
    if (revealer || reducedMotion()) return;
    revealer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-risen');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });
  }

  function stagger(scope){
    ensureRevealer();
    const nodes = scope.querySelectorAll('[data-rise]:not(.is-risen)');
    nodes.forEach((node, index) => {
      node.style.setProperty('--rise-i', Math.min(index, 8));
      if (!revealer || index < 4) { node.classList.add('is-risen'); return; }
      revealer.observe(node);
    });
  }

  /* ---- measured values count up, never decorative numbers ---- */
  const FORMATS = {
    value: (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)),
    currency: (n) => formatCurrency(Math.round(n)),
    percent: (n) => `${Math.round(n)}%`,
  };

  function countUp(scope){
    const nodes = scope.querySelectorAll('[data-count]');
    nodes.forEach(node => {
      if (node.dataset.countDone === '1') return;
      const target = Number(node.dataset.count);
      if (!Number.isFinite(target)) return;
      node.dataset.countDone = '1';
      const format = FORMATS[node.dataset.countFormat] || FORMATS.value;
      if (reducedMotion()) { node.textContent = format(target); return; }
      const span = duration(720);
      const startedAt = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / span);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = format(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      node.textContent = format(0);
      requestAnimationFrame(tick);
    });
  }

  /* ---- the isobar layer leans toward the pointer, a few pixels ---- */
  // A Map, not a WeakMap: weak entries cannot be enumerated at all, and the
  // sweep below is what keeps detached canvases from piling up.
  const parallaxTargets = new Map();
  let parallaxBound = false;
  let parallaxFrame = 0;
  let pointer = { x: 0, y: 0 };

  function applyParallax(){
    parallaxFrame = 0;
    parallaxTargets.forEach((layer, field) => {
      if (!field.isConnected){ parallaxTargets.delete(field); return; }
      const box = field.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const dx = (pointer.x - (box.left + box.width / 2)) / box.width;
      const dy = (pointer.y - (box.top + box.height / 2)) / box.height;
      layer.style.transform = `translate3d(${(dx * 7).toFixed(2)}px, ${(dy * 5).toFixed(2)}px, 0)`;
    });
  }

  function bindParallax(scope){
    if (reducedMotion() || lowData() || !window.matchMedia('(hover: hover)').matches) return;
    const fields = scope.querySelectorAll('[data-parallax]');
    if (!fields.length) return;
    parallaxTargets.forEach((layer, field) => {
      if (!field.isConnected) parallaxTargets.delete(field);
    });
    fields.forEach(field => {
      if (parallaxTargets.has(field)) return;
      const layer = field.querySelector('[data-parallax-layer]') || field.firstElementChild;
      if (layer) parallaxTargets.set(field, layer);
    });
    if (parallaxBound) return;
    parallaxBound = true;
    // Driven by the pointer, not by a standing rAF loop: getBoundingClientRect
    // forces layout, so an idle page should never pay for it.
    document.addEventListener('pointermove', (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!parallaxFrame) parallaxFrame = requestAnimationFrame(applyParallax);
    }, { passive: true });
  }

  /* ---- entry point ---- */
  function bind(scope){
    if (!scope || !scope.querySelectorAll) return;
    stagger(scope);
    countUp(scope);
    bindParallax(scope);
  }

  /* Page renderers repaint whole sections after data arrives, so bind
     once on the content root and let mutations drive the rest. The
     attribute is the contract with the stylesheet: claiming it turns
     on the hooks, and never reaching this file leaves them inert. */
  function observeContent(){
    const content = document.getElementById('pageContent');
    if (!content) return;
    if (!reducedMotion()) document.documentElement.dataset.motionEngine = 'on';
    bind(content);
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; bind(content); });
    }).observe(content, { childList: true, subtree: true });
  }

  return { bind, observeContent, reducedMotion };
})();

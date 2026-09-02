(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const hero = document.querySelector('[data-hero]');
  const parallaxItems = document.querySelectorAll('[data-parallax]');
  const revealItems = document.querySelectorAll('[data-reveal], .interior main > section, .legacy-studio main > section, body.legacy-studio > section');
  const primaryNav = document.querySelector('.site-header .nav-links');

  if (primaryNav) {
    const links = Array.from(primaryNav.children).filter((item) => item.matches('a'));
    const panel = document.createElement('div');
    const toggle = document.createElement('button');

    panel.className = 'mobile-nav-panel';
    links.forEach((link) => panel.appendChild(link));

    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.textContent = 'Menu';

    primaryNav.append(toggle, panel);

    const closeMenu = () => {
      primaryNav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.textContent = 'Menu';
    };

    toggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    panel.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  const legacyToggle = document.querySelector('.legacy-studio .navbar-toggle');
  if (legacyToggle) {
    legacyToggle.setAttribute('role', 'button');
    legacyToggle.setAttribute('tabindex', '0');
    legacyToggle.setAttribute('aria-expanded', 'false');
    const toggleLegacyMenu = () => {
      const open = body.classList.toggle('legacy-nav-open');
      legacyToggle.setAttribute('aria-expanded', String(open));
    };
    legacyToggle.addEventListener('click', toggleLegacyMenu);
    legacyToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleLegacyMenu();
      }
    });
    document.querySelector('#navigation')?.addEventListener('click', (event) => {
      if (!event.target.closest('a')) return;
      body.classList.remove('legacy-nav-open');
      legacyToggle.setAttribute('aria-expanded', 'false');
    });
  }

  requestAnimationFrame(() => body.classList.add('is-ready'));

  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => observer.observe(item));

  let ticking = false;
  const updateMotion = () => {
    const y = window.scrollY;
    if (hero) {
      const progress = Math.min(y / Math.max(hero.offsetHeight, 1), 1);
      hero.style.setProperty('--hero-progress', progress.toFixed(3));
      body.classList.toggle('has-scrolled', y > 24);
    }

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) / window.innerHeight;
      item.style.setProperty('--parallax', Math.max(-1, Math.min(1, offset)).toFixed(3));
    });
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateMotion);
  };

  updateMotion();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
})();

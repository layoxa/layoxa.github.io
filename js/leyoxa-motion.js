(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const hero = document.querySelector('[data-hero]');
  const parallaxItems = document.querySelectorAll('[data-parallax]');
  const revealItems = document.querySelectorAll('[data-reveal], .interior main > section, .legacy-studio main > section, body.legacy-studio > section');

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
